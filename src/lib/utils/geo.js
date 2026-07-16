import { point, polygon } from '@turf/helpers';
import { distance } from '@turf/distance';
import { bbox } from '@turf/bbox';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';

export function haversineDistance(coord1, coord2) {
  const from = point([coord1.lng, coord1.lat]);
  const to = point([coord2.lng, coord2.lat]);
  return distance(from, to, { units: 'kilometers' });
}

function checkAllConstraints(candidate, userLocations, minKm, maxKm, preferences) {
  const withinRange = userLocations.every(loc => {
    const dist = haversineDistance(loc, candidate);
    return dist >= minKm && dist <= maxKm;
  });
  if (!withinRange) return false;

  if (preferences.repulsionPoints.length > 0) {
    for (const rp of preferences.repulsionPoints) {
      if (haversineDistance(rp, candidate) < preferences.repulsionRadius) return false;
    }
  }

  if (preferences.attractionPoints.length > 0) {
    const nearAny = preferences.attractionPoints.some(
      ap => haversineDistance(ap, candidate) < preferences.attractionRadius
    );
    if (!nearAny) return false;
  }

  return true;
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

export function generateConstrainedPoint(poly, userLocations, minKm, maxKm, preferences = DEFAULT_PREFS, maxAttempts = 3000) {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generateRandomPointInPolygon(poly);
    if (!candidate) continue;
    if (checkAllConstraints(candidate, userLocations, minKm, maxKm, preferences)) return candidate;
  }
  return null;
}

export function generateConstrainedPointMulti(polygons, userLocations, minKm, maxKm, preferences = DEFAULT_PREFS, maxAttempts = 3000) {
  const bboxes = polygons.map(p => bbox(p));
  const combined = [
    Math.min(...bboxes.map(b => b[0])),
    Math.min(...bboxes.map(b => b[1])),
    Math.max(...bboxes.map(b => b[2])),
    Math.max(...bboxes.map(b => b[3])),
  ];

  for (let i = 0; i < maxAttempts; i++) {
    const lng = combined[0] + Math.random() * (combined[2] - combined[0]);
    const lat = combined[1] + Math.random() * (combined[3] - combined[1]);
    const pt = point([lng, lat]);
    if (!polygons.some(p => booleanPointInPolygon(pt, p))) continue;

    const candidate = { lng, lat };
    if (checkAllConstraints(candidate, userLocations, minKm, maxKm, preferences)) return candidate;
  }
  return null;
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
