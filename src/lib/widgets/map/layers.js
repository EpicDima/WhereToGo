import { circle } from '@turf/circle';
import { intersect } from '@turf/intersect';
import { featureCollection } from '@turf/helpers';
import { zoneToPolygon, buildDistrictPolygons, getLocationsOrCenter, EMPTY_FC } from '../../shared/utils/geo.js';

export function applyStyleOverrides(map, locale) {
  for (const layer of map.getStyle().layers) {
    if (layer.id.includes('boundary')) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
    if (layer.type === 'symbol' && layer.layout?.['text-field']) {
      const langKey = locale === 'ru' ? 'name:ru' : 'name:en';
      map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', langKey], ['get', 'name']]);
    }
  }
}

export function addZoneLayers(map) {
  if (map.getSource('zone')) return;
  map.addSource('zone', { type: 'geojson', data: EMPTY_FC });
  map.addLayer({ id: 'zone-fill', type: 'fill', source: 'zone', paint: { 'fill-color': '#E8584A', 'fill-opacity': 0.05 } });
  map.addLayer({ id: 'zone-border', type: 'line', source: 'zone', paint: { 'line-color': '#E8584A', 'line-width': 2, 'line-opacity': 0.4 } });
}

export function updateZoneData(map, { drawingMode, zoneCoordinates, selectedDistricts }) {
  if (!map?.getSource('zone')) return;
  if (drawingMode) { map.getSource('zone').setData(EMPTY_FC); return; }

  const zonePoly = zoneToPolygon(zoneCoordinates);

  if (selectedDistricts.length > 0 && zonePoly) {
    const clipped = buildDistrictPolygons(selectedDistricts)
      .map(dp => intersect(featureCollection([zonePoly, dp])))
      .filter(Boolean);
    map.getSource('zone').setData({ type: 'FeatureCollection', features: clipped });
    return;
  }

  map.getSource('zone').setData(zonePoly ? { type: 'FeatureCollection', features: [zonePoly] } : EMPTY_FC);
}

export function addRadiusLayers(map) {
  if (map.getSource('radius-min')) return;
  map.addSource('radius-min', { type: 'geojson', data: EMPTY_FC });
  map.addSource('radius-max', { type: 'geojson', data: EMPTY_FC });

  map.addLayer({ id: 'radius-max-fill', type: 'fill', source: 'radius-max', paint: { 'fill-color': '#F59E0B', 'fill-opacity': 0.06 } });
  map.addLayer({ id: 'radius-max-border', type: 'line', source: 'radius-max', paint: { 'line-color': '#F59E0B', 'line-width': 1.5, 'line-opacity': 0.6, 'line-dasharray': [6, 4] } });
  map.addLayer({ id: 'radius-min-fill', type: 'fill', source: 'radius-min', paint: { 'fill-color': '#6366F1', 'fill-opacity': 0.08 } });
  map.addLayer({ id: 'radius-min-border', type: 'line', source: 'radius-min', paint: { 'line-color': '#6366F1', 'line-width': 1.5, 'line-opacity': 0.7, 'line-dasharray': [4, 3] } });
}

export function updateRadiusCircles(map, { step, userLocations, cityCenter, minDistance, maxDistance }) {
  if (!map?.getSource('radius-min') || !map?.getSource('radius-max')) return;

  if (step < 2) {
    map.getSource('radius-min').setData(EMPTY_FC);
    map.getSource('radius-max').setData(EMPTY_FC);
    return;
  }

  const locations = getLocationsOrCenter(userLocations, cityCenter);

  map.getSource('radius-min').setData({
    type: 'FeatureCollection',
    features: locations.map(loc => circle([loc.lng, loc.lat], minDistance, { units: 'kilometers', steps: 64 })),
  });
  map.getSource('radius-max').setData({
    type: 'FeatureCollection',
    features: locations.map(loc => circle([loc.lng, loc.lat], maxDistance, { units: 'kilometers', steps: 64 })),
  });
}

export function addPreferenceRadiusLayers(map) {
  if (map.getSource('pref-attraction')) return;
  map.addSource('pref-attraction', { type: 'geojson', data: EMPTY_FC });
  map.addSource('pref-repulsion', { type: 'geojson', data: EMPTY_FC });

  map.addLayer({ id: 'pref-attraction-fill', type: 'fill', source: 'pref-attraction', paint: { 'fill-color': '#22C55E', 'fill-opacity': 0.06 } });
  map.addLayer({ id: 'pref-attraction-border', type: 'line', source: 'pref-attraction', paint: { 'line-color': '#22C55E', 'line-width': 1.5, 'line-opacity': 0.5, 'line-dasharray': [4, 3] } });
  map.addLayer({ id: 'pref-repulsion-fill', type: 'fill', source: 'pref-repulsion', paint: { 'fill-color': '#EF4444', 'fill-opacity': 0.06 } });
  map.addLayer({ id: 'pref-repulsion-border', type: 'line', source: 'pref-repulsion', paint: { 'line-color': '#EF4444', 'line-width': 1.5, 'line-opacity': 0.5, 'line-dasharray': [4, 3] } });
}

export function updatePreferenceRadii(map, { step, attractionPoints, repulsionPoints, attractionRadius, repulsionRadius }) {
  if (!map?.getSource('pref-attraction') || !map?.getSource('pref-repulsion')) return;

  if (step < 3) {
    map.getSource('pref-attraction').setData(EMPTY_FC);
    map.getSource('pref-repulsion').setData(EMPTY_FC);
    return;
  }

  map.getSource('pref-attraction').setData({
    type: 'FeatureCollection',
    features: attractionPoints.map(pt => circle([pt.lng, pt.lat], attractionRadius, { units: 'kilometers', steps: 48 })),
  });
  map.getSource('pref-repulsion').setData({
    type: 'FeatureCollection',
    features: repulsionPoints.map(pt => circle([pt.lng, pt.lat], repulsionRadius, { units: 'kilometers', steps: 48 })),
  });
}

export function addDrawLayers(map) {
  if (map.getSource('draw-points')) return;
  map.addSource('draw-points', { type: 'geojson', data: EMPTY_FC });
  map.addSource('draw-line', { type: 'geojson', data: EMPTY_FC });
  map.addLayer({ id: 'draw-line', type: 'line', source: 'draw-line', paint: { 'line-color': '#E8584A', 'line-width': 2, 'line-dasharray': [3, 2] } });
  map.addLayer({ id: 'draw-points', type: 'circle', source: 'draw-points', paint: { 'circle-radius': 5, 'circle-color': '#E8584A', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } });
}

export function updateDrawVisuals(map, drawPoints) {
  if (!map?.getSource('draw-points')) return;
  map.getSource('draw-points').setData({
    type: 'FeatureCollection',
    features: drawPoints.map(p => ({ type: 'Feature', geometry: { type: 'Point', coordinates: p } })),
  });
  if (drawPoints.length >= 2) {
    map.getSource('draw-line').setData({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: [...drawPoints, drawPoints[0]] } }],
    });
  }
}

export function clearDrawLayers(map) {
  if (map?.getSource('draw-points')) map.getSource('draw-points').setData(EMPTY_FC);
  if (map?.getSource('draw-line')) map.getSource('draw-line').setData(EMPTY_FC);
}
