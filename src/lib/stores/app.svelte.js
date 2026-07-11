import { CITY_PRESETS, DEFAULT_CITY } from '../utils/presets.js';

const STORAGE_KEY = 'where-to-go-settings';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const saved = loadSaved();

export const appState = $state({
  selectedCity: saved?.selectedCity && CITY_PRESETS[saved.selectedCity] ? saved.selectedCity : DEFAULT_CITY,
  zoneCoordinates: saved?.zoneCoordinates ?? [...CITY_PRESETS[DEFAULT_CITY].zones.wide.coordinates],
  zonePreset: saved?.zonePreset ?? 'wide',

  userLocations: saved?.userLocations ?? [],

  minDistance: saved?.minDistance ?? 0.5,
  maxDistance: saved?.maxDistance ?? 10,

  generatedPoint: null,
  isGenerating: false,

  drawingMode: false,

  showRouting: saved?.showRouting ?? true,
  routeData: null,

  step: 0,
});

export function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      selectedCity: appState.selectedCity,
      zoneCoordinates: appState.zoneCoordinates,
      zonePreset: appState.zonePreset,
      userLocations: appState.userLocations,
      minDistance: appState.minDistance,
      maxDistance: appState.maxDistance,
      showRouting: appState.showRouting,
    }));
  } catch {}
}

export function resetState() {
  const city = CITY_PRESETS[appState.selectedCity];
  appState.zoneCoordinates = [...city.zones.wide.coordinates];
  appState.zonePreset = 'wide';
  appState.userLocations = [];
  appState.generatedPoint = null;
  appState.routeData = null;
  appState.step = 0;
  saveSettings();
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
    saveSettings();
  }
}

export function addUserLocation(lngLat) {
  appState.userLocations = [...appState.userLocations, { lng: lngLat.lng, lat: lngLat.lat, name: `Друг ${appState.userLocations.length + 1}` }];
  saveSettings();
}

export function removeUserLocation(index) {
  appState.userLocations = appState.userLocations.filter((_, i) => i !== index);
  saveSettings();
}

export function updateUserLocationName(index, name) {
  appState.userLocations = appState.userLocations.map((loc, i) =>
    i === index ? { ...loc, name } : loc
  );
  saveSettings();
}

export function nextStep() {
  appState.step = Math.min(appState.step + 1, 3);
}

export function restart() {
  appState.generatedPoint = null;
  appState.routeData = null;
  appState.step = 0;
}
