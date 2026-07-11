import { CITY_PRESETS, DEFAULT_CITY } from '../utils/presets.js';

export const appState = $state({
  selectedCity: DEFAULT_CITY,
  zoneCoordinates: [...CITY_PRESETS[DEFAULT_CITY].zones.wide.coordinates],
  zonePreset: 'wide',

  userLocations: [],

  minDistance: 0.5,
  maxDistance: 10,

  generatedPoint: null,
  isGenerating: false,

  drawingMode: false,

  showRouting: false,
  routeData: null,

  sidebarOpen: true,
  activeTab: 'zone',
});

export function resetState() {
  const city = CITY_PRESETS[appState.selectedCity];
  appState.zoneCoordinates = [...city.zones.wide.coordinates];
  appState.zonePreset = 'wide';
  appState.userLocations = [];
  appState.generatedPoint = null;
  appState.routeData = null;
}

export function setCity(cityKey) {
  appState.selectedCity = cityKey;
  resetState();
}

export function setZonePreset(presetKey) {
  const city = CITY_PRESETS[appState.selectedCity];
  if (city.zones[presetKey]) {
    appState.zoneCoordinates = [...city.zones[presetKey].coordinates];
    appState.zonePreset = presetKey;
    appState.generatedPoint = null;
  }
}

export function addUserLocation(lngLat) {
  appState.userLocations = [...appState.userLocations, { lng: lngLat.lng, lat: lngLat.lat, name: `Друг ${appState.userLocations.length + 1}` }];
}

export function removeUserLocation(index) {
  appState.userLocations = appState.userLocations.filter((_, i) => i !== index);
}

export function updateUserLocationName(index, name) {
  appState.userLocations = appState.userLocations.map((loc, i) =>
    i === index ? { ...loc, name } : loc
  );
}
