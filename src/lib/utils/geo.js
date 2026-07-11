import * as turf from '@turf/turf';

export function haversineDistance(coord1, coord2) {
  const from = turf.point([coord1.lng, coord1.lat]);
  const to = turf.point([coord2.lng, coord2.lat]);
  return turf.distance(from, to, { units: 'kilometers' });
}

export function generateRandomPointInPolygon(polygon, maxAttempts = 1000) {
  const bbox = turf.bbox(polygon);
  for (let i = 0; i < maxAttempts; i++) {
    const lng = bbox[0] + Math.random() * (bbox[2] - bbox[0]);
    const lat = bbox[1] + Math.random() * (bbox[3] - bbox[1]);
    const pt = turf.point([lng, lat]);
    if (turf.booleanPointInPolygon(pt, polygon)) {
      return { lng, lat };
    }
  }
  return null;
}

export function generateConstrainedPoint(polygon, userLocations, minKm, maxKm, pois = [], poiWeight = 0.3, maxAttempts = 3000) {
  const candidates = [];

  for (let i = 0; i < maxAttempts; i++) {
    const point = generateRandomPointInPolygon(polygon);
    if (!point) continue;

    const allWithinRange = userLocations.every(loc => {
      const dist = haversineDistance(loc, point);
      return dist >= minKm && dist <= maxKm;
    });

    if (allWithinRange) {
      candidates.push(point);
      if (candidates.length >= 20) break;
    }
  }

  if (candidates.length === 0) return null;
  if (pois.length === 0 || poiWeight <= 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  let best = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    let minPoiDist = Infinity;
    for (const poi of pois) {
      const d = haversineDistance(candidate, poi);
      if (d < minPoiDist) minPoiDist = d;
    }
    const poiScore = 1 / (1 + minPoiDist);
    const randomScore = Math.random();
    const score = randomScore * (1 - poiWeight) + poiScore * poiWeight;

    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}

export function createPolygonFeature(coordinates) {
  if (coordinates.length < 3) return null;
  const closed = [...coordinates];
  const first = closed[0];
  const last = closed[closed.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    closed.push([...first]);
  }
  return turf.polygon([closed]);
}
