<script>
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
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
    map.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
    }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      addZoneLayers();
      addDrawLayers();
      updateZoneData();
    });

    map.on('click', (e) => {
      if (appState.drawingMode) {
        handleDrawClick(e.lngLat);
      } else if (appState.activeTab === 'people') {
        addUserLocation(e.lngLat);
      }
    });

    return () => {
      map?.remove();
    };
  });

  function addZoneLayers() {
    map.addSource('zone', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
    map.addLayer({
      id: 'zone-fill',
      type: 'fill',
      source: 'zone',
      paint: { 'fill-color': '#2B7A6F', 'fill-opacity': 0.1 }
    });
    map.addLayer({
      id: 'zone-border',
      type: 'line',
      source: 'zone',
      paint: { 'line-color': '#2B7A6F', 'line-width': 2.5, 'line-dasharray': [4, 3] }
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
      paint: { 'line-color': '#E85D4A', 'line-width': 2, 'line-dasharray': [3, 2] }
    });
    map.addLayer({
      id: 'draw-points',
      type: 'circle',
      source: 'draw-points',
      paint: {
        'circle-radius': 5,
        'circle-color': '#E85D4A',
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

  function handleDrawClick(lngLat) {
    drawPoints.push([lngLat.lng, lngLat.lat]);
    updateDrawVisuals();
  }

  function updateDrawVisuals() {
    if (!map?.getSource('draw-points')) return;

    const pointFeatures = drawPoints.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: p }
    }));
    map.getSource('draw-points').setData({ type: 'FeatureCollection', features: pointFeatures });

    if (drawPoints.length >= 2) {
      const lineCoords = [...drawPoints, drawPoints[0]];
      map.getSource('draw-line').setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: lineCoords }
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
      el.className = 'user-marker';
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
    if (resultMarker) {
      resultMarker.remove();
      resultMarker = null;
    }

    if (!map || !appState.generatedPoint) return;

    const el = document.createElement('div');
    el.innerHTML = `<svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="#2B7A6F"/>
      <circle cx="18" cy="17" r="7" fill="white"/>
      <circle cx="18" cy="17" r="3" fill="#2B7A6F"/>
    </svg>`;
    el.style.cursor = 'pointer';
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

  $effect(() => {
    appState.zoneCoordinates;
    updateZoneData();
  });

  $effect(() => {
    appState.userLocations;
    updateUserMarkers();
  });

  $effect(() => {
    appState.generatedPoint;
    updateResultMarker();
  });

  $effect(() => {
    const city = CITY_PRESETS[appState.selectedCity];
    if (map) {
      map.flyTo({ center: city.center, zoom: city.zoom, duration: 1000 });
    }
  });

  $effect(() => {
    if (map) {
      map.getCanvas().style.cursor = appState.drawingMode ? 'crosshair' : '';
    }
  });
</script>

<div bind:this={mapContainer} class="absolute inset-0 w-full h-full"></div>

{#if appState.drawingMode}
  <div class="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur rounded-xl shadow-lg px-5 py-3 flex items-center gap-3 max-lg:left-4 max-lg:translate-x-0 max-lg:right-4 max-lg:top-auto max-lg:bottom-[calc(70vh+1rem)]">
    <span class="text-sm text-ink-600">Кликайте на карту для точек полигона</span>
    <button
      class="px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
      onclick={() => finishDrawing()}
    >
      Готово ✓
    </button>
    <button
      class="px-3 py-1.5 text-xs font-medium rounded-lg bg-cream-200 text-ink-600 hover:bg-cream-300 transition-colors"
      onclick={() => cancelDrawing()}
    >
      Отмена
    </button>
  </div>
{/if}

<style>
  :global(.user-marker-dot) {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1A1A1A;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border: 2.5px solid white;
    cursor: grab;
    transition: transform 0.15s;
  }
  :global(.user-marker-dot:hover) {
    transform: scale(1.1);
  }
  :global(.result-pin) {
    animation: dropBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes dropBounce {
    0% { transform: translateY(-30px); opacity: 0; }
    60% { transform: translateY(4px); opacity: 1; }
    100% { transform: translateY(0); }
  }
</style>
