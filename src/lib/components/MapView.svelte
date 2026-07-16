<script>
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import { circle } from '@turf/circle';
  import { appState, addUserLocation, addPreferencePoint } from '../stores/app.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';
  import { MINSK_DISTRICTS } from '../utils/districts.js';
  import { createPolygonFeature } from '../utils/geo.js';

  let mapContainer;
  let map;
  let userMarkers = [];
  let preferenceMarkers = [];
  let resultMarker = null;
  let drawPoints = [];
  let initialLoad = true;

  const MAP_PADDING = { top: 60, bottom: 60, left: 400, right: 60 };

  const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
  const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  onMount(() => {
    const city = appState.city;

    map = new maplibregl.Map({
      container: mapContainer,
      style: appState.darkMode ? DARK_STYLE : LIGHT_STYLE,
      center: city.center,
      zoom: city.zoom,
      padding: MAP_PADDING,
      attributionControl: false,
      maxZoom: 18,
      maxPitch: 0,
      dragRotate: false,
      touchPitch: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }), 'bottom-right');

    map.on('load', () => {
      applyStyleOverrides();
      addZoneLayers();
      addRadiusLayers();
      addPreferenceRadiusLayers();
      addDrawLayers();
      updateZoneData();
      updatePreferenceRadii();
    });

    map.on('click', (e) => {
      if (appState.drawingMode) {
        handleDrawClick(e.lngLat);
      } else if (appState.step === 1) {
        addUserLocation(e.lngLat);
      } else if (appState.step === 2) {
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
        map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', 'name:ru'], ['get', 'name']]);
      }
    }
  }

  function addRadiusLayers() {
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
    if (appState.step < 2) {
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

    if (appState.selectedDistricts.length > 0) {
      const features = appState.selectedDistricts
        .map(name => MINSK_DISTRICTS[name])
        .filter(Boolean)
        .map(coords => createPolygonFeature(coords))
        .filter(Boolean);
      map.getSource('zone').setData({ type: 'FeatureCollection', features });
      return;
    }

    const polygon = createPolygonFeature(appState.zoneCoordinates.map(c => [c[0], c[1]]));
    map.getSource('zone').setData(
      polygon ? { type: 'FeatureCollection', features: [polygon] } : { type: 'FeatureCollection', features: [] }
    );
  }

  function updateRadiusCircles() {
    if (!map?.getSource('radius-min') || !map?.getSource('radius-max')) return;

    if (appState.userLocations.length === 0 || appState.step < 3) {
      map.getSource('radius-min').setData({ type: 'FeatureCollection', features: [] });
      map.getSource('radius-max').setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const minCircles = appState.userLocations.map(loc =>
      circle([loc.lng, loc.lat], appState.minDistance, { units: 'kilometers', steps: 64 })
    );
    const maxCircles = appState.userLocations.map(loc =>
      circle([loc.lng, loc.lat], appState.maxDistance, { units: 'kilometers', steps: 64 })
    );

    map.getSource('radius-min').setData({ type: 'FeatureCollection', features: minCircles });
    map.getSource('radius-max').setData({ type: 'FeatureCollection', features: maxCircles });
  }

  function handleDrawClick(lngLat) {
    drawPoints.push([lngLat.lng, lngLat.lat]);
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
    if (drawPoints.length >= 3) {
      appState.zoneCoordinates = [...drawPoints];
      appState.zonePreset = 'custom';
    }
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
      el.innerHTML = `<div class="user-marker-dot">${i + 1}</div>`;

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

  function createPrefPin(color) {
    const el = document.createElement('div');
    el.innerHTML = `<svg width="24" height="32" viewBox="0 0 24 32" fill="none">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20C24 5.37 18.63 0 12 0z" fill="${color}"/>
      <circle cx="12" cy="11" r="4" fill="white" fill-opacity="0.9"/>
    </svg>`;
    el.style.cursor = 'grab';
    return el;
  }

  function updatePreferenceMarkers() {
    preferenceMarkers.forEach(m => m.remove());
    preferenceMarkers = [];
    if (!map || appState.step < 2) return;

    const draggable = appState.step === 2;

    appState.attractionPoints.forEach((pt, i) => {
      const marker = new maplibregl.Marker({ element: createPrefPin('#22C55E'), draggable, anchor: 'bottom' })
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
      const marker = new maplibregl.Marker({ element: createPrefPin('#EF4444'), draggable, anchor: 'bottom' })
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

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([appState.generatedPoint.lng, appState.generatedPoint.lat]);
    for (const loc of appState.userLocations) {
      bounds.extend([loc.lng, loc.lat]);
    }
    map.fitBounds(bounds, { padding: MAP_PADDING, maxZoom: 14, duration: 1200 });
  }

  $effect(() => { appState.zoneCoordinates; appState.selectedDistricts; updateZoneData(); });
  $effect(() => { appState.userLocations; appState.step; updateUserMarkers(); });
  $effect(() => { appState.attractionPoints; appState.repulsionPoints; appState.step; updatePreferenceMarkers(); });
  $effect(() => { appState.attractionPoints; appState.repulsionPoints; appState.attractionRadius; appState.repulsionRadius; appState.step; updatePreferenceRadii(); });
  $effect(() => { appState.generatedPoint; updateResultMarker(); });
  $effect(() => { appState.userLocations; appState.minDistance; appState.maxDistance; appState.step; updateRadiusCircles(); });
  $effect(() => {
    const center = appState.city.center;
    const zoom = appState.city.zoom;
    if (!map) return;
    if (initialLoad) {
      initialLoad = false;
      map.jumpTo({ center, zoom, padding: MAP_PADDING });
      return;
    }
    map.flyTo({ center, zoom, padding: MAP_PADDING, duration: 1000 });
  });
  $effect(() => { if (map) map.getCanvas().style.cursor = (appState.drawingMode || appState.step === 2) ? 'crosshair' : ''; });
  $effect(() => {
    if (!map) return;
    const style = appState.darkMode ? DARK_STYLE : LIGHT_STYLE;
    if (map.getStyle()?.sprite !== style) {
      map.setStyle(style);
      map.once('style.load', () => {
        applyStyleOverrides();
        addZoneLayers();
        addRadiusLayers();
        addPreferenceRadiusLayers();
        addDrawLayers();
        updateZoneData();
        updateRadiusCircles();
        updatePreferenceRadii();
        updatePreferenceMarkers();
      });
    }
  });
</script>

<div bind:this={mapContainer} class="absolute inset-0 w-full h-full"></div>

{#if appState.drawingMode}
  <div class="absolute top-4 left-1/2 -translate-x-1/2 z-30 glass rounded-xl shadow-lg px-5 py-3 flex items-center gap-3 border border-border
    max-lg:left-4 max-lg:right-4 max-lg:translate-x-0 max-lg:top-4">
    <span class="text-[13px] text-ink-2 font-medium">Кликайте для точек полигона</span>
    <button class="px-3 py-1.5 text-[12px] font-semibold rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors" onclick={() => finishDrawing()}>Готово</button>
    <button class="px-3 py-1.5 text-[12px] font-semibold rounded-lg text-ink-3 hover:bg-panel-hover transition-colors" onclick={() => cancelDrawing()}>Отмена</button>
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
  :global(.user-marker-dot:hover) { transform: scale(1.1); }
  :global(.result-pin) { animation: dropBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
  @keyframes dropBounce {
    0% { transform: translateY(-30px); opacity: 0; }
    60% { transform: translateY(4px); opacity: 1; }
    100% { transform: translateY(0); }
  }
  :global(.maplibregl-ctrl-attrib) { display: none !important; }
</style>
