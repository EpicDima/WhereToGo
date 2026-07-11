<script>
  import { onMount, onDestroy } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import { appState, addUserLocation } from '../stores/app.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';
  import { createPolygonFeature } from '../utils/geo.js';

  let mapContainer;
  let map;
  let markers = [];
  let resultMarker = null;

  const MAPTILER_KEY = 'get_your_free_key';

  onMount(() => {
    const city = CITY_PRESETS[appState.selectedCity];

    map = new maplibregl.Map({
      container: mapContainer,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
      center: city.center,
      zoom: city.zoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
    }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      updateZoneLayer();
    });

    map.on('click', (e) => {
      if (appState.activeTab === 'people') {
        addUserLocation(e.lngLat);
      }
    });

    return () => {
      map?.remove();
    };
  });

  function updateZoneLayer() {
    if (!map || !map.isStyleLoaded()) return;

    const polygon = createPolygonFeature(
      appState.zoneCoordinates.map(c => [c[0], c[1]])
    );

    if (!polygon) return;

    const sourceData = { type: 'FeatureCollection', features: [polygon] };

    if (map.getSource('zone')) {
      map.getSource('zone').setData(sourceData);
    } else {
      map.addSource('zone', { type: 'geojson', data: sourceData });
      map.addLayer({
        id: 'zone-fill',
        type: 'fill',
        source: 'zone',
        paint: {
          'fill-color': '#2B7A6F',
          'fill-opacity': 0.12,
        }
      });
      map.addLayer({
        id: 'zone-border',
        type: 'line',
        source: 'zone',
        paint: {
          'line-color': '#2B7A6F',
          'line-width': 2.5,
          'line-dasharray': [3, 2],
        }
      });
    }
  }

  function updateUserMarkers() {
    markers.forEach(m => m.remove());
    markers = [];

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

      markers.push(marker);
    });
  }

  function updateResultMarker() {
    if (resultMarker) {
      resultMarker.remove();
      resultMarker = null;
    }

    if (appState.generatedPoint) {
      const el = document.createElement('div');
      el.className = 'result-marker';
      el.innerHTML = `<div class="result-marker-pin">
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
          <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 24 16 24s16-12 16-24C32 7.164 24.836 0 16 0z" fill="#2B7A6F"/>
          <circle cx="16" cy="15" r="6" fill="white"/>
        </svg>
      </div>`;

      resultMarker = new maplibregl.Marker({ element: el })
        .setLngLat([appState.generatedPoint.lng, appState.generatedPoint.lat])
        .addTo(map);

      map.flyTo({
        center: [appState.generatedPoint.lng, appState.generatedPoint.lat],
        zoom: 14,
        duration: 1200,
      });
    }
  }

  $effect(() => {
    appState.zoneCoordinates;
    updateZoneLayer();
  });

  $effect(() => {
    appState.userLocations;
    if (map) updateUserMarkers();
  });

  $effect(() => {
    appState.generatedPoint;
    if (map) updateResultMarker();
  });

  $effect(() => {
    const city = CITY_PRESETS[appState.selectedCity];
    if (map) {
      map.flyTo({ center: city.center, zoom: city.zoom, duration: 1000 });
    }
  });
</script>

<div bind:this={mapContainer} class="absolute inset-0 w-full h-full"></div>

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
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    border: 2.5px solid white;
    cursor: grab;
  }
  :global(.user-marker-dot:active) {
    cursor: grabbing;
  }
  :global(.result-marker) {
    cursor: pointer;
  }
  :global(.result-marker-pin) {
    animation: dropIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes dropIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
</style>
