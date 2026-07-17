import maplibregl from 'maplibre-gl';
import { point } from '@turf/helpers';
import { bbox } from '@turf/bbox';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { createPolygonFeature, buildDistrictPolygons, EMPTY_FC } from '../../shared/utils/geo.js';
const DEBUG_GRID = 100;
const DEG2RAD = Math.PI / 180;

function fastDistKm(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * DEG2RAD;
  const dLng = (lng2 - lng1) * DEG2RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * DEG2RAD) * Math.cos(lat2 * DEG2RAD) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getZonePolygons(selectedDistricts, zoneCoordinates) {
  if (selectedDistricts.length > 0) {
    return buildDistrictPolygons(selectedDistricts);
  }
  const poly = createPolygonFeature(zoneCoordinates.map(c => [c[0], c[1]]));
  return poly ? [poly] : [];
}

export function computeDebugGrid(state, showDebugHeatmap) {
  if (!showDebugHeatmap) return EMPTY_FC;

  const polygons = getZonePolygons(state.selectedDistricts, state.zoneCoordinates);
  if (polygons.length === 0) return EMPTY_FC;

  const zoneBounds = state.selectedDistricts.length > 0
    ? createPolygonFeature(state.zoneCoordinates.map(c => [c[0], c[1]]))
    : null;

  const bboxes = polygons.map(p => bbox(p));
  const bb = [
    Math.min(...bboxes.map(b => b[0])),
    Math.min(...bboxes.map(b => b[1])),
    Math.max(...bboxes.map(b => b[2])),
    Math.max(...bboxes.map(b => b[3])),
  ];

  const lngStep = (bb[2] - bb[0]) / DEBUG_GRID;
  const latStep = (bb[3] - bb[1]) / DEBUG_GRID;

  const locations = state.userLocations.length > 0
    ? state.userLocations
    : [{ lng: state.city.center[0], lat: state.city.center[1] }];

  const results = [];
  const useDistance = state.step >= 2;
  const usePrefs = state.step >= 3;

  for (let i = 0; i <= DEBUG_GRID; i++) {
    for (let j = 0; j <= DEBUG_GRID; j++) {
      const lng = bb[0] + i * lngStep;
      const lat = bb[1] + j * latStep;
      const pt = point([lng, lat]);

      if (!polygons.some(p => booleanPointInPolygon(pt, p))) continue;
      if (zoneBounds && !booleanPointInPolygon(pt, zoneBounds)) continue;

      if (useDistance) {
        const passesDistance = locations.every(loc => {
          const dist = fastDistKm(loc.lat, loc.lng, lat, lng);
          return dist >= state.minDistance && dist <= state.maxDistance;
        });
        if (!passesDistance) continue;
      }

      let score = 0;
      if (usePrefs) {
        for (const ap of state.attractionPoints) {
          const dist = fastDistKm(ap.lat, ap.lng, lat, lng);
          score += Math.exp(-((dist / state.attractionRadius) ** 2));
        }
        for (const rp of state.repulsionPoints) {
          const dist = fastDistKm(rp.lat, rp.lng, lat, lng);
          score -= Math.exp(-((dist / state.repulsionRadius) ** 2));
        }
      }

      results.push({ lng, lat, score });
    }
  }

  if (results.length === 0) return EMPTY_FC;

  const scores = results.map(r => r.score);
  const minScore = Math.min(...scores);
  const weights = scores.map(s => s - minScore + 0.01);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const maxWeight = Math.max(...weights);
  const hasPrefs = state.attractionPoints.length > 0 || state.repulsionPoints.length > 0;

  return {
    type: 'FeatureCollection',
    features: results.map((pt, idx) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [pt.lng, pt.lat] },
      properties: {
        weight: hasPrefs ? weights[idx] / maxWeight : 0.5,
        pct: (weights[idx] / totalWeight * 100).toFixed(3),
      },
    })),
  };
}

let debugPopup = null;

function onDebugMouseMove(e) {
  if (!e.features?.length) return;
  const pct = e.features[0].properties.pct;
  if (!debugPopup) {
    debugPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'debug-popup', offset: 12 });
  }
  debugPopup.setLngLat(e.lngLat).setHTML(`${pct}%`).addTo(e.target);
}

function onDebugMouseLeave() {
  debugPopup?.remove();
  debugPopup = null;
}

export function addDebugHeatmapLayer(map) {
  if (map.getSource('debug-heatmap')) return;
  map.addSource('debug-heatmap', { type: 'geojson', data: EMPTY_FC });
  map.addLayer({
    id: 'debug-heatmap',
    type: 'circle',
    source: 'debug-heatmap',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 12, 16, 14, 32, 16, 64],
      'circle-color': ['interpolate', ['linear'], ['get', 'weight'], 0, '#6366F1', 0.25, '#06B6D4', 0.5, '#22C55E', 0.75, '#EAB308', 1, '#EF4444'],
      'circle-opacity': 0.4,
      'circle-blur': 1,
    },
  });
  map.off('mousemove', 'debug-heatmap', onDebugMouseMove);
  map.off('mouseleave', 'debug-heatmap', onDebugMouseLeave);
  map.on('mousemove', 'debug-heatmap', onDebugMouseMove);
  map.on('mouseleave', 'debug-heatmap', onDebugMouseLeave);
}

export function updateDebugHeatmap(map, data) {
  if (!map?.getSource('debug-heatmap')) return;
  map.getSource('debug-heatmap').setData(data);
}
