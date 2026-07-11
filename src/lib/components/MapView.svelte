<script>
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import * as turf from '@turf/turf';
  import { appState, addUserLocation } from '../stores/app.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';
  import { createPolygonFeature } from '../utils/geo.js';

  let mapContainer;
  let map;
  let userMarkers = [];
  let resultMarker = null;
  let drawPoints = [];

  const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

  onMount(() => {
    const city = CITY_PRESETS[appState.selectedCity];

    map = new maplibregl.Map({
      container: mapContainer,
      style: MAP_STYLE,
      center: city.center,
      zoom: city.zoom,
      attributionControl: false,
      maxZoom: 18,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', () => {
      addRouteLayers();
      addRadiusLayers();
      addZoneLayers();
      addDrawLayers();
      updateZoneData();
    });

    map.on('click', (e) => {
      if (appState.drawingMode) {
        handleDrawClick(e.lngLat);
      } else if (appState.step === 1) {
        addUserLocation(e.lngLat);
      }
    });

    return () => {
      map?.remove();
    };
  });

  function addRouteLayers() {
    map.addSource('route', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
    map.addLayer({
      id: 'route-line-bg',
      type: 'line',
      source: 'route',
      paint: { 'line-color': '#111', 'line-width': 6, 'line-opacity': 0.1 },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    });
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      paint: { 'line-color': '#E8584A', 'line-width': 3 },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    });
  }

  function addRadiusLayers() {
    map.addSource('radius-min', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
    map.addSource('radius-max', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
    map.addLayer({
      id: 'radius-max-fill',
      type: 'fill',
      source: 'radius-max',
      paint: { 'fill-color': '#E8584A', 'fill-opacity': 0.04 }
    });
    map.addLayer({
      id: 'radius-max-border',
      type: 'line',
      source: 'radius-max',
      paint: { 'line-color': '#E8584A', 'line-width': 1.5, 'line-opacity': 0.3, 'line-dasharray': [4, 4] }
    });
    map.addLayer({
      id: 'radius-min-fill',
      type: 'fill',
      source: 'radius-min',
      paint: { 'fill-color': '#999', 'fill-opacity': 0.08 }
    });
    map.addLayer({
      id: 'radius-min-border',
      type: 'line',
      source: 'radius-min',
      paint: { 'line-color': '#999', 'line-width': 1.5, 'line-opacity': 0.4, 'line-dasharray': [3, 3] }
    });
  }

  function addZoneLayers() {
    map.addSource('zone', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
    map.addLayer({
      id: 'zone-fill',
      type: 'fill',
      source: 'zone',
      paint: { 'fill-color': '#E8584A', 'fill-opacity': 0.06 }
    });
    map.addLayer({
      id: 'zone-border',
      type: 'line',
      source: 'zone',
      paint: { 'line-color': '#E8584A', 'line-width': 2, 'line-opacity': 0.5 }
    });
  }

  function addDrawLayers() {
    map.addSource('draw-points', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
    map.addSource('draw-line', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
    map.addLayer({
      id: 'draw-line',
      type: 'line',
      source: 'draw-line',
      paint: { 'line-color': '#E8584A', 'line-width': 2, 'line-dasharray': [3, 2] }
    });
    map.addLayer({
      id: 'draw-points',
      type: 'circle',
      source: 'draw-points',
      paint: {
        'circle-radius': 5,
        'circle-color': '#E8584A',
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 2,
      }
    });
  }

  function updateZoneData() {
    if (!map?.getSource('zone')) return;
    const polygon = createPolygonFeature(appState.zoneCoordinates.map(c => [c[0], c[1]]));
    map.getSource('zone').setData(
      polygon
        ? { type: 'FeatureCollection', features: [polygon] }
        : { type: 'FeatureCollection', features: [] }
    );
  }

  function updateRadiusCircles() {
    if (!map?.getSource('radius-min') || !map?.getSource('radius-max')) return;

    if (appState.userLocations.length === 0 || appState.step < 2) {
      map.getSource('radius-min').setData({ type: 'FeatureCollection', features: [] });
      map.getSource('radius-max').setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const minCircles = appState.userLocations.map(loc =>
      turf.circle([loc.lng, loc.lat], appState.minDistance, { units: 'kilometers', steps: 48 })
    );
    const maxCircles = appState.userLocations.map(loc =>
      turf.circle([loc.lng, loc.lat], appState.maxDistance, { units: 'kilometers', steps: 48 })
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
    const pointFeatures = drawPoints.map(p => ({
      type: 'Feature', geometry: { type: 'Point', coordinates: p }
    }));
    map.getSource('draw-points').setData({ type: 'FeatureCollection', features: pointFeatures });

    if (drawPoints.length >= 2) {
      map.getSource('draw-line').setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [...drawPoints, drawPoints[0]] }
        }]
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
    if (map?.getSource('draw-points')) {
      map.getSource('draw-points').setData({ type: 'FeatureCollection', features: [] });
    }
    if (map?.getSource('draw-line')) {
      map.getSource('draw-line').setData({ type: 'FeatureCollection', features: [] });
    }
  }

  function updateUserMarkers() {
    userMarkers.forEach(m => m.remove());
    userMarkers = [];
    if (!map) return;

    appState.userLocations.forEach((loc, i) => {
      const el = document.createElement('div');
      el.innerHTML = `<div class="user-marker-dot">${i + 1}</div>`;

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        appState.userLocations = appState.userLocations.map((l, idx) =>
          idx === i ? { ...l, lng: lngLat.lng, lat: lngLat.lat } : l
        );
      });

      userMarkers.push(marker);
    });
  }

  function updateResultMarker() {
    if (resultMarker) { resultMarker.remove(); resultMarker = null; }
    if (!map || !appState.generatedPoint) return;

    const el = document.createElement('div');
    el.innerHTML = `<svg width="36" height="44" viewBox="0 0 36 44" fill="none">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="#E8584A"/>
      <circle cx="18" cy="17" r="7" fill="white"/>
      <circle cx="18" cy="17" r="3" fill="#E8584A"/>
    </svg>`;
    el.className = 'result-pin';

    resultMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([appState.generatedPoint.lng, appState.generatedPoint.lat])
      .addTo(map);

    map.flyTo({
      center: [appState.generatedPoint.lng, appState.generatedPoint.lat],
      zoom: Math.max(map.getZoom(), 14),
      duration: 1200,
    });
  }

  $effect(() => { appState.zoneCoordinates; updateZoneData(); });
  $effect(() => { appState.userLocations; updateUserMarkers(); });
  $effect(() => { appState.generatedPoint; updateResultMarker(); });
  $effect(() => {
    appState.userLocations; appState.minDistance; appState.maxDistance; appState.step;
    updateRadiusCircles();
  });
  $effect(() => {
    const city = CITY_PRESETS[appState.selectedCity];
    if (map) map.flyTo({ center: city.center, zoom: city.zoom, duration: 1000 });
  });
  $effect(() => {
    if (!map?.getSource('route')) return;
    if (appState.routeData) {
      map.getSource('route').setData({ type: 'FeatureCollection', features: [appState.routeData] });
    } else {
      map.getSource('route').setData({ type: 'FeatureCollection', features: [] });
    }
  });
  $effect(() => {
    if (map) map.getCanvas().style.cursor = appState.drawingMode ? 'crosshair' : '';
  });
</script>

<div bind:this={mapContainer} class="absolute inset-0 w-full h-full"></div>

{#if appState.drawingMode}
  <div class="absolute top-4 left-1/2 -translate-x-1/2 z-30 glass rounded-xl shadow-lg px-5 py-3 flex items-center gap-3 border border-border
    max-lg:left-4 max-lg:right-4 max-lg:translate-x-0 max-lg:top-4">
    <span class="text-[13px] text-ink-2 font-medium">Кликайте для точек полигона</span>
    <button
      class="px-3 py-1.5 text-[12px] font-semibold rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
      onclick={() => finishDrawing()}
    >
      Готово
    </button>
    <button
      class="px-3 py-1.5 text-[12px] font-semibold rounded-lg text-ink-3 hover:bg-panel-hover transition-colors"
      onclick={() => cancelDrawing()}
    >
      Отмена
    </button>
  </div>
{/if}

<style>
  :global(.user-marker-dot) {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #111;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border: 2px solid white;
    cursor: grab;
    transition: transform 0.15s;
  }
  :global(.user-marker-dot:hover) { transform: scale(1.1); }
  :global(.result-pin) {
    animation: dropBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes dropBounce {
    0% { transform: translateY(-30px); opacity: 0; }
    60% { transform: translateY(4px); opacity: 1; }
    100% { transform: translateY(0); }
  }
  :global(.maplibregl-ctrl-attrib) { display: none !important; }
</style>
