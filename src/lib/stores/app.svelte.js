import { CITY_PRESETS, DEFAULT_CITY } from '../utils/presets.js';
import { t } from '../i18n/index.svelte.js';

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

  customZones: saved?.customZones ?? [],
  selectedDistricts: saved?.selectedDistricts ?? [],

  userLocations: saved?.userLocations ?? [],

  attractionPoints: saved?.attractionPoints ?? [],
  repulsionPoints: saved?.repulsionPoints ?? [],
  attractionRadius: saved?.attractionRadius ?? 1.5,
  repulsionRadius: saved?.repulsionRadius ?? 0.5,
  preferenceMode: 'repulsion',

  minDistance: saved?.minDistance ?? 0.5,
  maxDistance: saved?.maxDistance ?? 10,

  generatedPoint: null,
  isGenerating: false,

  drawingMode: false,

  step: Math.min(saved?.step ?? 0, 3),
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
      customZones: appState.customZones,
      selectedDistricts: appState.selectedDistricts,
      userLocations: appState.userLocations,
      attractionPoints: appState.attractionPoints,
      repulsionPoints: appState.repulsionPoints,
      attractionRadius: appState.attractionRadius,
      repulsionRadius: appState.repulsionRadius,
      minDistance: appState.minDistance,
      maxDistance: appState.maxDistance,
      step: appState.step,
      themeMode: appState.themeMode,
    }));
  } catch {}
}

export function setPresetCity(key) {
  const city = CITY_PRESETS[key];
  if (!city || appState.presetKey === key) return;
  appState.presetKey = key;
  appState.city = { name: city.name, center: city.center, zoom: city.zoom };
  appState.zoneCoordinates = [...city.zones.wide.coordinates];
  appState.zonePreset = 'wide';
  appState.selectedDistricts = [];
  appState.generatedPoint = null;
  saveSettings();
}

export function setCustomCity(name, center, zoom) {
  appState.presetKey = null;
  appState.city = { name, center, zoom };
  appState.zoneCoordinates = [];
  appState.zonePreset = 'custom';
  appState.generatedPoint = null;
  saveSettings();
}

export function setZonePreset(presetKey) {
  const preset = CITY_PRESETS[appState.presetKey];
  if (preset?.zones[presetKey]) {
    appState.zoneCoordinates = [...preset.zones[presetKey].coordinates];
    appState.zonePreset = presetKey;
    appState.selectedDistricts = [];
    appState.generatedPoint = null;
    saveSettings();
  }
}

export function toggleDistrict(name) {
  if (appState.selectedDistricts.includes(name)) {
    appState.selectedDistricts = appState.selectedDistricts.filter(d => d !== name);
  } else {
    appState.selectedDistricts = [...appState.selectedDistricts, name];
  }
  appState.drawingMode = false;
  appState.generatedPoint = null;
  saveSettings();
}

export function addPreferencePoint(lngLat) {
  if (appState.preferenceMode === 'attraction') {
    const name = `${t('defaultPointName')} ${appState.attractionPoints.length + 1}`;
    appState.attractionPoints = [...appState.attractionPoints, { lng: lngLat.lng, lat: lngLat.lat, name }];
  } else {
    const name = `${t('defaultPointName')} ${appState.repulsionPoints.length + 1}`;
    appState.repulsionPoints = [...appState.repulsionPoints, { lng: lngLat.lng, lat: lngLat.lat, name }];
  }
  appState.generatedPoint = null;
  saveSettings();
}

export function removeAttractionPoint(index) {
  appState.attractionPoints = appState.attractionPoints.filter((_, i) => i !== index);
  saveSettings();
}

export function removeRepulsionPoint(index) {
  appState.repulsionPoints = appState.repulsionPoints.filter((_, i) => i !== index);
  saveSettings();
}

export function updateAttractionPointName(index, name) {
  appState.attractionPoints = appState.attractionPoints.map((p, i) =>
    i === index ? { ...p, name } : p
  );
  saveSettings();
}

export function updateRepulsionPointName(index, name) {
  appState.repulsionPoints = appState.repulsionPoints.map((p, i) =>
    i === index ? { ...p, name } : p
  );
  saveSettings();
}

export function addUserLocation(lngLat) {
  const name = appState.userLocations.length === 0 ? t('defaultNameMe') : `${t('defaultNameFriend')} ${appState.userLocations.length}`;
  appState.userLocations = [...appState.userLocations, { lng: lngLat.lng, lat: lngLat.lat, name }];
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

export function saveCustomZone(name) {
  if (appState.zoneCoordinates.length < 3) return;
  const existing = appState.customZones.map(z => z.name);
  let uniqueName = name;
  let n = 2;
  while (existing.includes(uniqueName)) {
    uniqueName = `${name} (${n++})`;
  }
  appState.customZones = [...appState.customZones, { name: uniqueName, coordinates: [...appState.zoneCoordinates] }];
  saveSettings();
}

export function loadCustomZone(index) {
  const zone = appState.customZones[index];
  if (!zone) return;
  appState.zoneCoordinates = [...zone.coordinates];
  appState.zonePreset = 'custom';
  appState.selectedDistricts = [];
  appState.drawingMode = false;
  appState.generatedPoint = null;
  saveSettings();
}

export function deleteCustomZone(index) {
  const deleted = appState.customZones[index];
  appState.customZones = appState.customZones.filter((_, i) => i !== index);
  if (deleted && appState.zonePreset === 'custom' && JSON.stringify(appState.zoneCoordinates) === JSON.stringify(deleted.coordinates)) {
    const preset = CITY_PRESETS[appState.presetKey];
    if (preset) {
      const fallback = preset.zones.mkad ? 'mkad' : 'wide';
      appState.zonePreset = fallback;
      appState.zoneCoordinates = [...preset.zones[fallback].coordinates];
    }
    appState.generatedPoint = null;
  }
  saveSettings();
}

export function nextStep() {
  appState.step = Math.min(appState.step + 1, 4);
  saveSettings();
}

export function prevStep() {
  if (appState.step === 4) {
    appState.generatedPoint = null;
  }
  appState.step = Math.max(appState.step - 1, 0);
  saveSettings();
}

export function restart() {
  appState.generatedPoint = null;
  appState.step = 0;
  saveSettings();
}

export function regenerate() {
  appState.generatedPoint = null;
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
