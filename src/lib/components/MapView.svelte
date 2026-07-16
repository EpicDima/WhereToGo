<script>
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import { circle } from '@turf/circle';
  import { point } from '@turf/helpers';
  import { bbox } from '@turf/bbox';
  import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
  import { intersect } from '@turf/intersect';
  import { featureCollection } from '@turf/helpers';
  import { appState, addUserLocation, addPreferencePoint } from '../stores/app.svelte.js';
  import { t, i18n } from '../i18n/index.svelte.js';
  import { uiState } from '../stores/ui.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';
  import { MINSK_DISTRICTS } from '../utils/districts.js';
  import { createPolygonFeature } from '../utils/geo.js';

  let mapContainer;
  let map;
  let userMarkers = [];
  let preferenceMarkers = [];
  let resultMarker = null;
  let drawPoints = $state([]);
  let initialLoad = true;
  const isDev = import.meta.env.DEV;
  let showDebugHeatmap = $state(false);
  let isMobile = $state(false);
  let mapPadding = { top: 60, bottom: 60, left: 400, right: 60 };
  let currentStyleUrl = '';

  const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
  const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  onMount(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    isMobile = mq.matches;
    mq.addEventListener('change', (e) => isMobile = e.matches);

    mapPadding = isMobile
      ? { top: 60, bottom: 200, left: 20, right: 20 }
      : { top: 60, bottom: 60, left: 400, right: 60 };

    const city = appState.city;

    currentStyleUrl = appState.darkMode ? DARK_STYLE : LIGHT_STYLE;
    map = new maplibregl.Map({
      container: mapContainer,
      style: currentStyleUrl,
      center: city.center,
      zoom: city.zoom,
      padding: mapPadding,
      attributionControl: false,
      maxZoom: 18,
      maxPitch: 0,
      dragRotate: false,
      touchPitch: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }), 'bottom-right');

    map.on('load', () => {
      applyStyleOverrides();
      if (isDev) addDebugHeatmapLayer();
      addZoneLayers();
      addRadiusLayers();
      addPreferenceRadiusLayers();
      addDrawLayers();
      updateZoneData();
      updatePreferenceRadii();
      if (isDev) updateDebugHeatmap();
    });

    map.on('click', (e) => {
      if (appState.drawingMode) {
        handleDrawClick(e.lngLat);
      } else if (appState.step === 1) {
        addUserLocation(e.lngLat);
      } else if (appState.step === 3) {
        addPreferencePoint(e.lngLat);
      }
    });

    return () => { map?.remove(); };
  });

  function applyStyleOverrides() {
    for (const layer of map.getStyle().layers) {
      if (layer.id.includes('boundary')) {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      }
      if (layer.type === 'symbol' && layer.layout?.['text-field']) {
        const langKey = i18n.locale === 'ru' ? 'name:ru' : 'name:en';
        map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', langKey], ['get', 'name']]);
      }
    }
  }

  function addRadiusLayers() {
    if (map.getSource('radius-min')) return;
    map.addSource('radius-min', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addSource('radius-max', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

    map.addLayer({
      id: 'radius-max-fill', type: 'fill', source: 'radius-max',
      paint: { 'fill-color': '#F59E0B', 'fill-opacity': 0.06 }
    });
    map.addLayer({
      id: 'radius-max-border', type: 'line', source: 'radius-max',
      paint: { 'line-color': '#F59E0B', 'line-width': 1.5, 'line-opacity': 0.6, 'line-dasharray': [6, 4] }
    });
    map.addLayer({
      id: 'radius-min-fill', type: 'fill', source: 'radius-min',
      paint: { 'fill-color': '#6366F1', 'fill-opacity': 0.08 }
    });
    map.addLayer({
      id: 'radius-min-border', type: 'line', source: 'radius-min',
      paint: { 'line-color': '#6366F1', 'line-width': 1.5, 'line-opacity': 0.7, 'line-dasharray': [4, 3] }
    });
  }

  function addPreferenceRadiusLayers() {
    if (map.getSource('pref-attraction')) return;
    map.addSource('pref-attraction', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addSource('pref-repulsion', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

    map.addLayer({
      id: 'pref-attraction-fill', type: 'fill', source: 'pref-attraction',
      paint: { 'fill-color': '#22C55E', 'fill-opacity': 0.06 }
    });
    map.addLayer({
      id: 'pref-attraction-border', type: 'line', source: 'pref-attraction',
      paint: { 'line-color': '#22C55E', 'line-width': 1.5, 'line-opacity': 0.5, 'line-dasharray': [4, 3] }
    });
    map.addLayer({
      id: 'pref-repulsion-fill', type: 'fill', source: 'pref-repulsion',
      paint: { 'fill-color': '#EF4444', 'fill-opacity': 0.06 }
    });
    map.addLayer({
      id: 'pref-repulsion-border', type: 'line', source: 'pref-repulsion',
      paint: { 'line-color': '#EF4444', 'line-width': 1.5, 'line-opacity': 0.5, 'line-dasharray': [4, 3] }
    });
  }

  function updatePreferenceRadii() {
    if (!map?.getSource('pref-attraction') || !map?.getSource('pref-repulsion')) return;

    const empty = { type: 'FeatureCollection', features: [] };
    if (appState.step < 3) {
      map.getSource('pref-attraction').setData(empty);
      map.getSource('pref-repulsion').setData(empty);
      return;
    }

    const aCircles = appState.attractionPoints.map(pt =>
      circle([pt.lng, pt.lat], appState.attractionRadius, { units: 'kilometers', steps: 48 })
    );
    const rCircles = appState.repulsionPoints.map(pt =>
      circle([pt.lng, pt.lat], appState.repulsionRadius, { units: 'kilometers', steps: 48 })
    );

    map.getSource('pref-attraction').setData({ type: 'FeatureCollection', features: aCircles });
    map.getSource('pref-repulsion').setData({ type: 'FeatureCollection', features: rCircles });
  }

  function addZoneLayers() {
    if (map.getSource('zone')) return;
    map.addSource('zone', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
      id: 'zone-fill', type: 'fill', source: 'zone',
      paint: { 'fill-color': '#E8584A', 'fill-opacity': 0.05 }
    });
    map.addLayer({
      id: 'zone-border', type: 'line', source: 'zone',
      paint: { 'line-color': '#E8584A', 'line-width': 2, 'line-opacity': 0.4 }
    });
  }

  function addDrawLayers() {
    if (map.getSource('draw-points')) return;
    map.addSource('draw-points', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addSource('draw-line', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
      id: 'draw-line', type: 'line', source: 'draw-line',
      paint: { 'line-color': '#E8584A', 'line-width': 2, 'line-dasharray': [3, 2] }
    });
    map.addLayer({
      id: 'draw-points', type: 'circle', source: 'draw-points',
      paint: { 'circle-radius': 5, 'circle-color': '#E8584A', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 }
    });
  }

  function updateZoneData() {
    if (!map?.getSource('zone')) return;

    if (appState.drawingMode) {
      map.getSource('zone').setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const zonePoly = createPolygonFeature(appState.zoneCoordinates.map(c => [c[0], c[1]]));

    if (appState.selectedDistricts.length > 0 && zonePoly) {
      const clipped = appState.selectedDistricts
        .map(name => MINSK_DISTRICTS[name])
        .filter(Boolean)
        .map(coords => createPolygonFeature(coords))
        .filter(Boolean)
        .map(dp => intersect(featureCollection([zonePoly, dp])))
        .filter(Boolean);
      map.getSource('zone').setData({ type: 'FeatureCollection', features: clipped });
      return;
    }

    map.getSource('zone').setData(
      zonePoly ? { type: 'FeatureCollection', features: [zonePoly] } : { type: 'FeatureCollection', features: [] }
    );
  }

  function updateRadiusCircles() {
    if (!map?.getSource('radius-min') || !map?.getSource('radius-max')) return;

    const empty = { type: 'FeatureCollection', features: [] };
    if (appState.step < 2) {
      map.getSource('radius-min').setData(empty);
      map.getSource('radius-max').setData(empty);
      return;
    }

    const locations = appState.userLocations.length > 0
      ? appState.userLocations
      : [{ lng: appState.city.center[0], lat: appState.city.center[1] }];

    const minCircles = locations.map(loc =>
      circle([loc.lng, loc.lat], appState.minDistance, { units: 'kilometers', steps: 64 })
    );
    const maxCircles = locations.map(loc =>
      circle([loc.lng, loc.lat], appState.maxDistance, { units: 'kilometers', steps: 64 })
    );

    map.getSource('radius-min').setData({ type: 'FeatureCollection', features: minCircles });
    map.getSource('radius-max').setData({ type: 'FeatureCollection', features: maxCircles });
  }

  function handleDrawClick(lngLat) {
    drawPoints = [...drawPoints, [lngLat.lng, lngLat.lat]];
    updateDrawVisuals();
  }

  function updateDrawVisuals() {
    if (!map?.getSource('draw-points')) return;
    const pts = drawPoints.map(p => ({ type: 'Feature', geometry: { type: 'Point', coordinates: p } }));
    map.getSource('draw-points').setData({ type: 'FeatureCollection', features: pts });
    if (drawPoints.length >= 2) {
      map.getSource('draw-line').setData({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: [...drawPoints, drawPoints[0]] } }]
      });
    }
  }

  export function finishDrawing() {
    if (drawPoints.length < 3) {
      cancelDrawing();
      return;
    }
    appState.zoneCoordinates = [...drawPoints];
    appState.zonePreset = 'custom';
    clearDrawing();
    appState.drawingMode = false;
  }

  export function cancelDrawing() {
    clearDrawing();
    appState.drawingMode = false;
  }

  function clearDrawing() {
    drawPoints = [];
    if (map?.getSource('draw-points')) map.getSource('draw-points').setData({ type: 'FeatureCollection', features: [] });
    if (map?.getSource('draw-line')) map.getSource('draw-line').setData({ type: 'FeatureCollection', features: [] });
  }

  function updateUserMarkers() {
    userMarkers.forEach(m => m.remove());
    userMarkers = [];
    if (!map || appState.step === 0) return;

    const draggable = appState.step === 1;

    appState.userLocations.forEach((loc, i) => {
      const el = document.createElement('div');
      el.innerHTML = `<div class="user-marker-dot${draggable ? '' : ' static'}">${i + 1}</div>`;

      const marker = new maplibregl.Marker({ element: el, draggable })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map);

      if (draggable) {
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          appState.userLocations = appState.userLocations.map((l, idx) =>
            idx === i ? { ...l, lng: lngLat.lng, lat: lngLat.lat } : l
          );
        });
      }

      userMarkers.push(marker);
    });
  }

  function createAttractionMarker() {
    const el = document.createElement('div');
    el.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" fill="#22C55E" stroke="white" stroke-width="2.5"/>
      <path d="M14 7.5l1.8 4.2h4.5l-3.6 2.8 1.3 4.3L14 16.2l-4 2.6 1.3-4.3-3.6-2.8h4.5z" fill="white"/>
    </svg>`;
    el.style.cursor = 'grab';
    return el;
  }

  function createRepulsionMarker() {
    const el = document.createElement('div');
    el.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" fill="#EF4444" stroke="white" stroke-width="2.5"/>
      <path d="M9.5 9.5l9 9M18.5 9.5l-9 9" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
    el.style.cursor = 'grab';
    return el;
  }

  function updatePreferenceMarkers() {
    preferenceMarkers.forEach(m => m.remove());
    preferenceMarkers = [];
    if (!map || appState.step < 3) return;

    const draggable = appState.step === 3;

    appState.attractionPoints.forEach((pt, i) => {
      const marker = new maplibregl.Marker({ element: createAttractionMarker(), draggable })
        .setLngLat([pt.lng, pt.lat])
        .addTo(map);
      if (draggable) {
        marker.on('drag', () => {
          const pos = marker.getLngLat();
          const circles = appState.attractionPoints.map((p, idx) =>
            circle([idx === i ? pos.lng : p.lng, idx === i ? pos.lat : p.lat], appState.attractionRadius, { units: 'kilometers', steps: 48 })
          );
          map.getSource('pref-attraction').setData({ type: 'FeatureCollection', features: circles });
        });
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          appState.attractionPoints = appState.attractionPoints.map((p, idx) =>
            idx === i ? { ...p, lng: lngLat.lng, lat: lngLat.lat } : p
          );
        });
      }
      preferenceMarkers.push(marker);
    });

    appState.repulsionPoints.forEach((pt, i) => {
      const marker = new maplibregl.Marker({ element: createRepulsionMarker(), draggable })
        .setLngLat([pt.lng, pt.lat])
        .addTo(map);
      if (draggable) {
        marker.on('drag', () => {
          const pos = marker.getLngLat();
          const circles = appState.repulsionPoints.map((p, idx) =>
            circle([idx === i ? pos.lng : p.lng, idx === i ? pos.lat : p.lat], appState.repulsionRadius, { units: 'kilometers', steps: 48 })
          );
          map.getSource('pref-repulsion').setData({ type: 'FeatureCollection', features: circles });
        });
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          appState.repulsionPoints = appState.repulsionPoints.map((p, idx) =>
            idx === i ? { ...p, lng: lngLat.lng, lat: lngLat.lat } : p
          );
        });
      }
      preferenceMarkers.push(marker);
    });
  }

  function updateResultMarker() {
    if (resultMarker) { resultMarker.remove(); resultMarker = null; }
    if (!map || !appState.generatedPoint) return;

    const el = document.createElement('div');
    el.innerHTML = `<svg width="36" height="44" viewBox="0 0 36 44" fill="none">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="#E8584A"/>
      <circle cx="18" cy="17" r="7" fill="white"/><circle cx="18" cy="17" r="3" fill="#E8584A"/>
    </svg>`;
    el.className = 'result-pin';

    resultMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([appState.generatedPoint.lng, appState.generatedPoint.lat])
      .addTo(map);

    const gp = [appState.generatedPoint.lng, appState.generatedPoint.lat];
    if (appState.userLocations.length === 0) {
      map.flyTo({ center: gp, zoom: 14, padding: mapPadding, duration: 1200 });
    } else {
      const bounds = new maplibregl.LngLatBounds(gp, gp);
      for (const loc of appState.userLocations) {
        bounds.extend([loc.lng, loc.lat]);
        bounds.extend([2 * gp[0] - loc.lng, 2 * gp[1] - loc.lat]);
      }
      map.fitBounds(bounds, { padding: mapPadding, maxZoom: 14, duration: 1200 });
    }
  }

  const DEBUG_GRID = 100;
  const DEG2RAD = Math.PI / 180;

  function fastDistKm(lat1, lng1, lat2, lng2) {
    const dLat = (lat2 - lat1) * DEG2RAD;
    const dLng = (lng2 - lng1) * DEG2RAD;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * DEG2RAD) * Math.cos(lat2 * DEG2RAD) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function getZonePolygons() {
    if (appState.selectedDistricts.length > 0) {
      return appState.selectedDistricts
        .map(name => MINSK_DISTRICTS[name])
        .filter(Boolean)
        .map(coords => createPolygonFeature(coords))
        .filter(Boolean);
    }
    const poly = createPolygonFeature(appState.zoneCoordinates.map(c => [c[0], c[1]]));
    return poly ? [poly] : [];
  }

  function computeDebugGrid() {
    const empty = { type: 'FeatureCollection', features: [] };
    if (!showDebugHeatmap) return empty;

    const polygons = getZonePolygons();
    if (polygons.length === 0) return empty;

    const zoneBounds = appState.selectedDistricts.length > 0
      ? createPolygonFeature(appState.zoneCoordinates.map(c => [c[0], c[1]]))
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

    const locations = appState.userLocations.length > 0
      ? appState.userLocations
      : [{ lng: appState.city.center[0], lat: appState.city.center[1] }];

    const results = [];

    const useDistance = appState.step >= 2;
    const usePrefs = appState.step >= 3;

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
            return dist >= appState.minDistance && dist <= appState.maxDistance;
          });
          if (!passesDistance) continue;
        }

        let score = 0;
        if (usePrefs) {
          for (const ap of appState.attractionPoints) {
            const dist = fastDistKm(ap.lat, ap.lng, lat, lng);
            score += Math.exp(-((dist / appState.attractionRadius) ** 2));
          }
          for (const rp of appState.repulsionPoints) {
            const dist = fastDistKm(rp.lat, rp.lng, lat, lng);
            score -= Math.exp(-((dist / appState.repulsionRadius) ** 2));
          }
        }

        results.push({ lng, lat, score });
      }
    }

    if (results.length === 0) return empty;

    const scores = results.map(r => r.score);
    const minScore = Math.min(...scores);
    const weights = scores.map(s => s - minScore + 0.01);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const maxWeight = Math.max(...weights);
    const hasPrefs = appState.attractionPoints.length > 0 || appState.repulsionPoints.length > 0;

    return {
      type: 'FeatureCollection',
      features: results.map((pt, idx) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [pt.lng, pt.lat] },
        properties: {
          weight: hasPrefs ? weights[idx] / maxWeight : 0.5,
          pct: (weights[idx] / totalWeight * 100).toFixed(3)
        }
      }))
    };
  }

  let debugPopup = null;

  function onDebugMouseMove(e) {
    if (!e.features?.length) return;
    const pct = e.features[0].properties.pct;
    if (!debugPopup) {
      debugPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'debug-popup', offset: 12 });
    }
    debugPopup.setLngLat(e.lngLat).setHTML(`${pct}%`).addTo(map);
  }

  function onDebugMouseLeave() {
    debugPopup?.remove();
    debugPopup = null;
  }

  function addDebugHeatmapLayer() {
    if (map.getSource('debug-heatmap')) return;
    map.addSource('debug-heatmap', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
    map.addLayer({
      id: 'debug-heatmap',
      type: 'circle',
      source: 'debug-heatmap',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'],
          10, 8, 12, 16, 14, 32, 16, 64],
        'circle-color': ['interpolate', ['linear'], ['get', 'weight'],
          0, '#6366F1',
          0.25, '#06B6D4',
          0.5, '#22C55E',
          0.75, '#EAB308',
          1, '#EF4444',
        ],
        'circle-opacity': 0.4,
        'circle-blur': 1,
      }
    });
    map.off('mousemove', 'debug-heatmap', onDebugMouseMove);
    map.off('mouseleave', 'debug-heatmap', onDebugMouseLeave);
    map.on('mousemove', 'debug-heatmap', onDebugMouseMove);
    map.on('mouseleave', 'debug-heatmap', onDebugMouseLeave);
  }

  function updateDebugHeatmap() {
    if (!map?.getSource('debug-heatmap')) return;
    map.getSource('debug-heatmap').setData(computeDebugGrid());
  }

  $effect(() => {
    const mobile = isMobile;
    const height = uiState.mobileSheetHeight;
    mapPadding = mobile
      ? { top: 60, bottom: Math.max(height + 20, 80), left: 20, right: 20 }
      : { top: 60, bottom: 60, left: 400, right: 60 };
    if (map) map.setPadding(mapPadding);
  });
  $effect(() => { appState.zoneCoordinates; appState.selectedDistricts; appState.drawingMode; updateZoneData(); });
  $effect(() => { appState.userLocations; appState.step; updateUserMarkers(); });
  $effect(() => { appState.attractionPoints; appState.repulsionPoints; appState.step; updatePreferenceMarkers(); });
  $effect(() => { appState.attractionPoints; appState.repulsionPoints; appState.attractionRadius; appState.repulsionRadius; appState.step; updatePreferenceRadii(); });
  $effect(() => { appState.generatedPoint; updateResultMarker(); });
  $effect(() => { appState.userLocations; appState.minDistance; appState.maxDistance; appState.step; updateRadiusCircles(); });
  if (isDev) {
    $effect(() => {
      showDebugHeatmap; appState.step;
      appState.zoneCoordinates; appState.selectedDistricts;
      appState.userLocations; appState.minDistance; appState.maxDistance;
      appState.attractionPoints; appState.repulsionPoints;
      appState.attractionRadius; appState.repulsionRadius;
      updateDebugHeatmap();
    });
  }
  $effect(() => {
    const center = appState.city.center;
    const zoom = appState.city.zoom;
    if (!map) return;
    if (initialLoad) {
      initialLoad = false;
      map.jumpTo({ center, zoom, padding: mapPadding });
      return;
    }
    map.flyTo({ center, zoom, padding: mapPadding, duration: 1000 });
  });
  $effect(() => { if (map) map.getCanvas().style.cursor = (appState.drawingMode || appState.step === 3) ? 'crosshair' : ''; });
  $effect(() => {
    const lang = i18n.locale;
    if (!map?.isStyleLoaded()) return;
    const langKey = lang === 'ru' ? 'name:ru' : 'name:en';
    for (const layer of map.getStyle().layers) {
      if (layer.type === 'symbol' && layer.layout?.['text-field']) {
        map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', langKey], ['get', 'name']]);
      }
    }
  });
  $effect(() => {
    if (!map) return;
    const style = appState.darkMode ? DARK_STYLE : LIGHT_STYLE;
    if (style !== currentStyleUrl) {
      currentStyleUrl = style;
      map.setStyle(style);
      map.once('style.load', () => {
        applyStyleOverrides();
        if (isDev) addDebugHeatmapLayer();
        addZoneLayers();
        addRadiusLayers();
        addPreferenceRadiusLayers();
        addDrawLayers();
        updateZoneData();
        updateRadiusCircles();
        updatePreferenceRadii();
        updatePreferenceMarkers();
        if (isDev) updateDebugHeatmap();
      });
    }
  });
</script>

<div bind:this={mapContainer} class="absolute inset-0 w-full h-full"></div>

{#if isDev}
  <button
    class="absolute top-16 right-4 z-30 rounded-lg p-2 border shadow-md transition-all
      {showDebugHeatmap
        ? 'bg-accent/90 border-accent text-white shadow-accent-glow'
        : 'glass border-border text-ink-3 hover:bg-panel-hover'}"
    onclick={() => showDebugHeatmap = !showDebugHeatmap}
    title={t('heatmapTitle')}
  >
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="1.5" fill="#6366F1" opacity="0.8"/>
      <rect x="10" y="1" width="7" height="7" rx="1.5" fill="#22C55E" opacity="0.8"/>
      <rect x="1" y="10" width="7" height="7" rx="1.5" fill="#EAB308" opacity="0.8"/>
      <rect x="10" y="10" width="7" height="7" rx="1.5" fill="#EF4444" opacity="0.8"/>
    </svg>
  </button>
  {#if showDebugHeatmap}
    <div class="absolute top-[6.5rem] right-4 z-30 glass rounded-xl border border-border shadow-lg px-3 py-2.5 flex flex-col gap-1">
      <span class="text-[10px] font-semibold text-ink-3 uppercase tracking-wider">{t('heatmapLegend')}</span>
      <div class="flex items-stretch gap-2">
        <div class="w-3 rounded-sm" style="background: linear-gradient(to bottom, #EF4444, #EAB308, #22C55E, #06B6D4, #6366F1);"></div>
        <div class="flex flex-col justify-between text-[10px] text-ink-3 py-0.5">
          <span>{t('heatmapHigh')}</span>
          <span>{t('heatmapMedium')}</span>
          <span>{t('heatmapLow')}</span>
        </div>
      </div>
    </div>
  {/if}
{/if}

{#if appState.drawingMode}
  <div class="absolute top-4 left-1/2 -translate-x-1/2 z-30 glass rounded-xl shadow-lg px-5 py-3 flex items-center gap-3 border border-border
    max-lg:left-4 max-lg:right-4 max-lg:translate-x-0 max-lg:top-4">
    <span class="text-[13px] text-ink-2 font-medium">{t('drawClickHint')}</span>
    <button
      class="px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-colors
        {drawPoints.length >= 3 ? 'bg-accent text-white hover:bg-accent-hover' : 'bg-ink-4/20 text-ink-4 cursor-not-allowed'}"
      onclick={() => finishDrawing()}
      disabled={drawPoints.length < 3}
    >{t('done')}</button>
    <button class="px-3 py-1.5 text-[12px] font-semibold rounded-lg text-ink-3 hover:bg-panel-hover transition-colors" onclick={() => cancelDrawing()}>{t('cancel')}</button>
  </div>
{/if}

<style>
  :global(.user-marker-dot) {
    width: 30px; height: 30px; border-radius: 50%;
    background: #111; color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; font-family: 'Inter', sans-serif;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border: 2px solid white; cursor: grab; transition: transform 0.15s;
  }
  :global(.user-marker-dot:not(.static):hover) { transform: scale(1.1); }
  :global(.user-marker-dot.static) { cursor: default; }
  :global(.result-pin) { animation: dropBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
  @keyframes dropBounce {
    0% { transform: translateY(-30px); opacity: 0; }
    60% { transform: translateY(4px); opacity: 1; }
    100% { transform: translateY(0); }
  }
  :global(.maplibregl-ctrl-attrib) { display: none !important; }
  :global(.dark .maplibregl-ctrl-group) {
    background: var(--color-panel);
    border-color: var(--color-border);
  }
  :global(.dark .maplibregl-ctrl-group button + button) {
    border-top-color: var(--color-border);
  }
  :global(.dark .maplibregl-ctrl button .maplibregl-ctrl-icon) {
    filter: invert(1);
  }
  :global(.debug-popup .maplibregl-popup-content) {
    padding: 3px 8px; font-size: 11px; font-weight: 600;
    border-radius: 6px; min-width: auto; pointer-events: none;
    font-family: 'Inter', sans-serif; background: rgba(0,0,0,0.8); color: white;
  }
  :global(.debug-popup .maplibregl-popup-tip) { border-top-color: rgba(0,0,0,0.8); }
  @media (max-width: 1023px) {
    :global(.maplibregl-ctrl-bottom-right) {
      bottom: calc(var(--sheet-height, 0px) + 10px) !important;
      transition: bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
</style>
