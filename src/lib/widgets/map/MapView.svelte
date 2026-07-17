<script>
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import { circle } from '@turf/circle';
  import { appState, clearResult } from '../../shared/stores/app.svelte.js';
  import { zoneState } from '../../features/zone/store.svelte.js';
  import { save } from '../../shared/stores/persist.js';
  import { peopleState, addUserLocation, updateUserLocationPosition } from '../../features/people/store.svelte.js';
  import { distanceState } from '../../features/distance/store.svelte.js';
  import { preferencesState, addPreferencePoint, updateAttractionPointPosition, updateRepulsionPointPosition } from '../../features/preferences/store.svelte.js';
  import { t, i18n } from '../../shared/i18n/index.svelte.js';
  import { uiState } from '../../shared/stores/ui.svelte.js';
  import {
    applyStyleOverrides,
    addZoneLayers, updateZoneData,
    addRadiusLayers, updateRadiusCircles,
    addPreferenceRadiusLayers, updatePreferenceRadii,
    addDrawLayers, updateDrawVisuals, clearDrawLayers,
  } from './layers.js';
  import { createUserMarkerEl, createAttractionMarkerEl, createRepulsionMarkerEl, createResultMarkerEl } from './markers.js';
  import { computeDebugGrid, addDebugHeatmapLayer, updateDebugHeatmap } from './debug.js';

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

  function initLayers() {
    applyStyleOverrides(map, i18n.locale);
    if (isDev) addDebugHeatmapLayer(map);
    addZoneLayers(map);
    addRadiusLayers(map);
    addPreferenceRadiusLayers(map);
    addDrawLayers(map);
    updateZoneData(map, zoneState);
    updateRadiusCircles(map, {
      step: appState.step,
      userLocations: peopleState.userLocations,
      cityCenter: zoneState.city.center,
      minDistance: distanceState.minDistance,
      maxDistance: distanceState.maxDistance,
    });
    updatePreferenceRadii(map, { step: appState.step, ...preferencesState });
    if (zoneState.drawingMode) updateDrawVisuals(map, drawPoints);
    if (isDev) updateDebugHeatmap(map, computeDebugGrid({ ...zoneState, ...peopleState, ...distanceState, ...preferencesState, step: appState.step }, showDebugHeatmap));
  }

  onMount(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    isMobile = mq.matches;
    const onMqChange = (e) => isMobile = e.matches;
    mq.addEventListener('change', onMqChange);

    mapPadding = isMobile
      ? { top: 60, bottom: 200, left: 20, right: 20 }
      : { top: 60, bottom: 60, left: 400, right: 60 };

    const city = zoneState.city;

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

    map.on('load', initLayers);

    map.on('click', (e) => {
      if (zoneState.drawingMode) {
        handleDrawClick(e.lngLat);
      } else if (appState.step === 1) {
        addUserLocation(e.lngLat);
      } else if (appState.step === 3) {
        addPreferencePoint(e.lngLat);
      }
    });

    return () => { mq.removeEventListener('change', onMqChange); map?.remove(); };
  });

  function handleDrawClick(lngLat) {
    drawPoints = [...drawPoints, [lngLat.lng, lngLat.lat]];
    updateDrawVisuals(map, drawPoints);
  }

  export function finishDrawing() {
    if (drawPoints.length < 3) { cancelDrawing(); return; }
    zoneState.zoneCoordinates = [...drawPoints];
    zoneState.zonePreset = 'custom';
    drawPoints = [];
    clearDrawLayers(map);
    zoneState.drawingMode = false;
    clearResult();
    save();
  }

  export function cancelDrawing() {
    drawPoints = [];
    clearDrawLayers(map);
    zoneState.drawingMode = false;
  }

  function syncUserMarkers() {
    userMarkers.forEach(m => m.remove());
    userMarkers = [];
    if (!map || appState.step === 0) return;

    const draggable = appState.step === 1;

    peopleState.userLocations.forEach((loc, i) => {
      const marker = new maplibregl.Marker({ element: createUserMarkerEl(i, draggable), draggable })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map);

      if (draggable) {
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          updateUserLocationPosition(i, lngLat.lng, lngLat.lat);
        });
      }

      userMarkers.push(marker);
    });
  }

  function syncPreferenceMarkers() {
    preferenceMarkers.forEach(m => m.remove());
    preferenceMarkers = [];
    if (!map || appState.step < 3) return;

    const draggable = appState.step === 3;

    preferencesState.attractionPoints.forEach((pt, i) => {
      const marker = new maplibregl.Marker({ element: createAttractionMarkerEl(), draggable })
        .setLngLat([pt.lng, pt.lat])
        .addTo(map);
      if (draggable) {
        marker.on('drag', () => {
          const pos = marker.getLngLat();
          const circles = preferencesState.attractionPoints.map((p, idx) =>
            circle([idx === i ? pos.lng : p.lng, idx === i ? pos.lat : p.lat], preferencesState.attractionRadius, { units: 'kilometers', steps: 48 })
          );
          map.getSource('pref-attraction').setData({ type: 'FeatureCollection', features: circles });
        });
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          updateAttractionPointPosition(i, lngLat.lng, lngLat.lat);
        });
      }
      preferenceMarkers.push(marker);
    });

    preferencesState.repulsionPoints.forEach((pt, i) => {
      const marker = new maplibregl.Marker({ element: createRepulsionMarkerEl(), draggable })
        .setLngLat([pt.lng, pt.lat])
        .addTo(map);
      if (draggable) {
        marker.on('drag', () => {
          const pos = marker.getLngLat();
          const circles = preferencesState.repulsionPoints.map((p, idx) =>
            circle([idx === i ? pos.lng : p.lng, idx === i ? pos.lat : p.lat], preferencesState.repulsionRadius, { units: 'kilometers', steps: 48 })
          );
          map.getSource('pref-repulsion').setData({ type: 'FeatureCollection', features: circles });
        });
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          updateRepulsionPointPosition(i, lngLat.lng, lngLat.lat);
        });
      }
      preferenceMarkers.push(marker);
    });
  }

  function syncResultMarker() {
    if (resultMarker) { resultMarker.remove(); resultMarker = null; }
    if (!map || !appState.generatedPoint) return;

    resultMarker = new maplibregl.Marker({ element: createResultMarkerEl(), anchor: 'bottom' })
      .setLngLat([appState.generatedPoint.lng, appState.generatedPoint.lat])
      .addTo(map);

    const gp = [appState.generatedPoint.lng, appState.generatedPoint.lat];

    if (peopleState.userLocations.length === 0) {
      map.flyTo({ center: gp, zoom: 14, padding: mapPadding, duration: 1200 });
      return;
    }

    const container = map.getContainer();
    const halfW = (container.clientWidth - mapPadding.left - mapPadding.right) / 2 * 0.85;
    const halfH = (container.clientHeight - mapPadding.top - mapPadding.bottom) / 2 * 0.85;

    const gpMerc = maplibregl.MercatorCoordinate.fromLngLat(gp);
    let maxDx = 0, maxDy = 0;
    for (const loc of peopleState.userLocations) {
      const m = maplibregl.MercatorCoordinate.fromLngLat([loc.lng, loc.lat]);
      maxDx = Math.max(maxDx, Math.abs(m.x - gpMerc.x));
      maxDy = Math.max(maxDy, Math.abs(m.y - gpMerc.y));
    }

    let zoom = 14;
    if (maxDx > 0 && halfW > 0) zoom = Math.min(zoom, Math.log2(halfW / (maxDx * 512)));
    if (maxDy > 0 && halfH > 0) zoom = Math.min(zoom, Math.log2(halfH / (maxDy * 512)));

    map.flyTo({ center: gp, zoom, padding: mapPadding, duration: 1200 });
  }

  $effect(() => {
    const mobile = isMobile;
    const height = uiState.mobileSheetHeight;
    mapPadding = mobile
      ? { top: 60, bottom: Math.max(height + 20, 80), left: 20, right: 20 }
      : { top: 60, bottom: 60, left: 400, right: 60 };
    if (map) map.setPadding(mapPadding);
  });

  $effect(() => {
    zoneState.zoneCoordinates; zoneState.selectedDistricts; zoneState.drawingMode;
    updateZoneData(map, zoneState);
  });

  $effect(() => {
    if (!zoneState.drawingMode && map) {
      drawPoints = [];
      clearDrawLayers(map);
    }
  });

  $effect(() => { peopleState.userLocations; appState.step; syncUserMarkers(); });
  $effect(() => { preferencesState.attractionPoints; preferencesState.repulsionPoints; appState.step; syncPreferenceMarkers(); });

  $effect(() => {
    preferencesState.attractionPoints; preferencesState.repulsionPoints;
    preferencesState.attractionRadius; preferencesState.repulsionRadius; appState.step;
    updatePreferenceRadii(map, { step: appState.step, ...preferencesState });
  });

  $effect(() => { appState.generatedPoint; syncResultMarker(); });

  $effect(() => {
    peopleState.userLocations; distanceState.minDistance; distanceState.maxDistance; appState.step;
    updateRadiusCircles(map, {
      step: appState.step,
      userLocations: peopleState.userLocations,
      cityCenter: zoneState.city.center,
      minDistance: distanceState.minDistance,
      maxDistance: distanceState.maxDistance,
    });
  });

  if (isDev) {
    $effect(() => {
      showDebugHeatmap; appState.step;
      zoneState.zoneCoordinates; zoneState.selectedDistricts;
      peopleState.userLocations; distanceState.minDistance; distanceState.maxDistance;
      preferencesState.attractionPoints; preferencesState.repulsionPoints;
      preferencesState.attractionRadius; preferencesState.repulsionRadius;
      updateDebugHeatmap(map, computeDebugGrid({ ...zoneState, ...peopleState, ...distanceState, ...preferencesState, step: appState.step }, showDebugHeatmap));
    });
  }

  $effect(() => {
    const center = zoneState.city.center;
    const zoom = zoneState.city.zoom;
    if (!map) return;
    if (initialLoad) {
      initialLoad = false;
      map.jumpTo({ center, zoom, padding: mapPadding });
      return;
    }
    map.flyTo({ center, zoom, padding: mapPadding, duration: 1000 });
  });

  $effect(() => { if (map) map.getCanvas().style.cursor = (zoneState.drawingMode || appState.step === 3) ? 'crosshair' : ''; });

  $effect(() => {
    const lang = i18n.locale;
    if (!map?.isStyleLoaded()) return;
    applyStyleOverrides(map, lang);
  });

  $effect(() => {
    if (!map) return;
    const style = appState.darkMode ? DARK_STYLE : LIGHT_STYLE;
    if (style !== currentStyleUrl) {
      currentStyleUrl = style;
      map.setStyle(style);
      map.once('style.load', () => {
        initLayers();
        syncPreferenceMarkers();
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

{#if zoneState.drawingMode}
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
    background: var(--color-ink); color: white;
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
