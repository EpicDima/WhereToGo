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

export function generateConstrainedPoint(polygon, userLocations, minKm, maxKm, maxAttempts = 3000) {
  for (let i = 0; i < maxAttempts; i++) {
    const point = generateRandomPointInPolygon(polygon);
    if (!point) continue;

    const allWithinRange = userLocations.every(loc => {
      const dist = haversineDistance(loc, point);
      return dist >= minKm && dist <= maxKm;
    });

    if (allWithinRange) return point;
  }

  return null;
}

export function generateConstrainedPointMulti(polygons, userLocations, minKm, maxKm, maxAttempts = 3000) {
  const bboxes = polygons.map(p => turf.bbox(p));
  const combined = [
    Math.min(...bboxes.map(b => b[0])),
    Math.min(...bboxes.map(b => b[1])),
    Math.max(...bboxes.map(b => b[2])),
    Math.max(...bboxes.map(b => b[3])),
  ];

  for (let i = 0; i < maxAttempts; i++) {
    const lng = combined[0] + Math.random() * (combined[2] - combined[0]);
    const lat = combined[1] + Math.random() * (combined[3] - combined[1]);
    const pt = turf.point([lng, lat]);

    if (!polygons.some(p => turf.booleanPointInPolygon(pt, p))) continue;

    const point = { lng, lat };
    const allWithinRange = userLocations.every(loc => {
      const dist = haversineDistance(loc, point);
      return dist >= minKm && dist <= maxKm;
    });

    if (allWithinRange) return point;
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
  return turf.polygon([closed]);
}
