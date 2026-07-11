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

function getInitialCity() {
  if (saved?.customCity) return saved.customCity;
  const key = saved?.selectedCity && CITY_PRESETS[saved.selectedCity] ? saved.selectedCity : DEFAULT_CITY;
  return { name: CITY_PRESETS[key].name, center: CITY_PRESETS[key].center, zoom: CITY_PRESETS[key].zoom };
}

function getInitialZone() {
  if (saved?.zoneCoordinates) return saved.zoneCoordinates;
  return [...CITY_PRESETS[DEFAULT_CITY].zones.wide.coordinates];
}

export const appState = $state({
  city: getInitialCity(),
  presetKey: saved?.presetKey ?? DEFAULT_CITY,
  zoneCoordinates: getInitialZone(),
  zonePreset: saved?.zonePreset ?? 'wide',

  userLocations: saved?.userLocations ?? [],
  savedFriends: saved?.savedFriends ?? [],

  minDistance: saved?.minDistance ?? 0.5,
  maxDistance: saved?.maxDistance ?? 10,

  generatedPoint: null,
  isGenerating: false,

  drawingMode: false,

  showRouting: saved?.showRouting ?? true,
  routeData: null,

  poiCategories: saved?.poiCategories ?? ['parks', 'cafes', 'culture'],
  poiWeight: saved?.poiWeight ?? 0.3,

  step: 0,
  themeMode: saved?.themeMode ?? 'system',
  darkMode: saved?.themeMode === 'dark' || (saved?.themeMode !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches),
});

export function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      customCity: appState.city,
      presetKey: appState.presetKey,
      zoneCoordinates: appState.zoneCoordinates,
      zonePreset: appState.zonePreset,
      userLocations: appState.userLocations,
      savedFriends: appState.savedFriends,
      minDistance: appState.minDistance,
      maxDistance: appState.maxDistance,
      showRouting: appState.showRouting,
      themeMode: appState.themeMode,
      poiCategories: appState.poiCategories,
      poiWeight: appState.poiWeight,
    }));
  } catch {}
}

export function setPresetCity(key) {
  const city = CITY_PRESETS[key];
  if (!city) return;
  appState.presetKey = key;
  appState.city = { name: city.name, center: city.center, zoom: city.zoom };
  appState.zoneCoordinates = [...city.zones.wide.coordinates];
  appState.zonePreset = 'wide';
  appState.generatedPoint = null;
  appState.routeData = null;
  saveSettings();
}

export function setCustomCity(name, center, zoom) {
  appState.presetKey = null;
  appState.city = { name, center, zoom };
  appState.zoneCoordinates = [];
  appState.zonePreset = 'custom';
  appState.generatedPoint = null;
  appState.routeData = null;
  saveSettings();
}

export function setZonePreset(presetKey) {
  const preset = CITY_PRESETS[appState.presetKey];
  if (preset?.zones[presetKey]) {
    appState.zoneCoordinates = [...preset.zones[presetKey].coordinates];
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

export function saveFriends() {
  appState.savedFriends = [...appState.userLocations];
  saveSettings();
}

export function loadFriends() {
  appState.userLocations = [...appState.savedFriends];
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

export function regenerate() {
  appState.generatedPoint = null;
  appState.routeData = null;
}

export function setThemeMode(mode) {
  appState.themeMode = mode;
  if (mode === 'system') {
    appState.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    appState.darkMode = mode === 'dark';
  }
  saveSettings();
}
