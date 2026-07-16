import { point, polygon } from '@turf/helpers';
import { distance } from '@turf/distance';
import { bbox } from '@turf/bbox';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';

export function haversineDistance(coord1, coord2) {
  const from = point([coord1.lng, coord1.lat]);
  const to = point([coord2.lng, coord2.lat]);
  return distance(from, to, { units: 'kilometers' });
}

function checkDistanceConstraints(candidate, userLocations, minKm, maxKm) {
  return userLocations.every(loc => {
    const dist = haversineDistance(loc, candidate);
    return dist >= minKm && dist <= maxKm;
  });
}

function scoreCandidate(candidate, preferences) {
  let score = 0;
  for (const ap of preferences.attractionPoints) {
    const dist = haversineDistance(ap, candidate);
    score += Math.exp(-((dist / preferences.attractionRadius) ** 2));
  }
  for (const rp of preferences.repulsionPoints) {
    const dist = haversineDistance(rp, candidate);
    score -= Math.exp(-((dist / preferences.repulsionRadius) ** 2));
  }
  return score;
}

function generateRandomPointInPolygon(poly, maxAttempts = 1000) {
  const bb = bbox(poly);
  for (let i = 0; i < maxAttempts; i++) {
    const lng = bb[0] + Math.random() * (bb[2] - bb[0]);
    const lat = bb[1] + Math.random() * (bb[3] - bb[1]);
    const pt = point([lng, lat]);
    if (booleanPointInPolygon(pt, poly)) {
      return { lng, lat };
    }
  }
  return null;
}

const DEFAULT_PREFS = { attractionPoints: [], repulsionPoints: [], attractionRadius: 1.5, repulsionRadius: 0.5 };
const CANDIDATE_BATCH = 80;

function pickWeighted(candidates, preferences) {
  const hasPrefs = preferences.attractionPoints.length > 0 || preferences.repulsionPoints.length > 0;
  if (!hasPrefs || candidates.length === 0) return candidates[0] ?? null;

  const scores = candidates.map(c => scoreCandidate(c, preferences));
  const min = Math.min(...scores);
  const weights = scores.map(s => s - min + 0.01);
  const total = weights.reduce((sum, w) => sum + w, 0);

  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export function generateConstrainedPoint(poly, userLocations, minKm, maxKm, preferences = DEFAULT_PREFS, maxAttempts = 3000) {
  const candidates = [];
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generateRandomPointInPolygon(poly);
    if (!candidate) continue;
    if (!checkDistanceConstraints(candidate, userLocations, minKm, maxKm)) continue;
    candidates.push(candidate);
    if (candidates.length >= CANDIDATE_BATCH) break;
  }
  return pickWeighted(candidates, preferences);
}

export function generateConstrainedPointMulti(polygons, userLocations, minKm, maxKm, preferences = DEFAULT_PREFS, maxAttempts = 3000, zoneBounds = null) {
  const bboxes = polygons.map(p => bbox(p));
  const combined = [
    Math.min(...bboxes.map(b => b[0])),
    Math.min(...bboxes.map(b => b[1])),
    Math.max(...bboxes.map(b => b[2])),
    Math.max(...bboxes.map(b => b[3])),
  ];

  const candidates = [];
  for (let i = 0; i < maxAttempts; i++) {
    const lng = combined[0] + Math.random() * (combined[2] - combined[0]);
    const lat = combined[1] + Math.random() * (combined[3] - combined[1]);
    const pt = point([lng, lat]);
    if (!polygons.some(p => booleanPointInPolygon(pt, p))) continue;
    if (zoneBounds && !booleanPointInPolygon(pt, zoneBounds)) continue;

    const candidate = { lng, lat };
    if (!checkDistanceConstraints(candidate, userLocations, minKm, maxKm)) continue;
    candidates.push(candidate);
    if (candidates.length >= CANDIDATE_BATCH) break;
  }
  return pickWeighted(candidates, preferences);
}

export function createPolygonFeature(coordinates) {
  if (coordinates.length < 3) return null;
  const closed = [...coordinates];
  const first = closed[0];
  const last = closed[closed.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    closed.push([...first]);
  }
  return polygon([closed]);
}
