import { CITY_PRESETS, DEFAULT_CITY } from '../../shared/utils/presets.js';
import { saved, registerSlice, save } from '../../shared/stores/persist.js';
import { clearResult } from '../../shared/stores/app.svelte.js';

function getInitialCity() {
  if (saved?.customCity) return saved.customCity;
  const key = saved?.presetKey && CITY_PRESETS[saved.presetKey] ? saved.presetKey : DEFAULT_CITY;
  return { name: CITY_PRESETS[key].name, center: CITY_PRESETS[key].center, zoom: CITY_PRESETS[key].zoom };
}

function getInitialZone() {
  if (saved?.zoneCoordinates) return saved.zoneCoordinates;
  return [...CITY_PRESETS[DEFAULT_CITY].zones.wide.coordinates];
}

export const zoneState = $state({
  city: getInitialCity(),
  presetKey: saved?.presetKey ?? DEFAULT_CITY,
  zoneCoordinates: getInitialZone(),
  zonePreset: saved?.zonePreset ?? 'wide',
  customZones: saved?.customZones ?? [],
  selectedDistricts: saved?.selectedDistricts ?? [],
  drawingMode: false,
});

registerSlice(() => ({
  customCity: zoneState.city,
  presetKey: zoneState.presetKey,
  zoneCoordinates: zoneState.zoneCoordinates,
  zonePreset: zoneState.zonePreset,
  customZones: zoneState.customZones,
  selectedDistricts: zoneState.selectedDistricts,
}));

export function setPresetCity(key) {
  const city = CITY_PRESETS[key];
  if (!city || zoneState.presetKey === key) return;
  zoneState.presetKey = key;
  zoneState.city = { name: city.name, center: city.center, zoom: city.zoom };
  zoneState.zoneCoordinates = [...city.zones.wide.coordinates];
  zoneState.zonePreset = 'wide';
  zoneState.selectedDistricts = [];
  clearResult();
  save();
}

export function setCustomCity(name, center, zoom) {
  zoneState.presetKey = null;
  zoneState.city = { name, center, zoom };
  zoneState.zoneCoordinates = [];
  zoneState.zonePreset = 'custom';
  clearResult();
  save();
}

export function setZonePreset(presetKey) {
  const preset = CITY_PRESETS[zoneState.presetKey];
  if (preset?.zones[presetKey]) {
    zoneState.zoneCoordinates = [...preset.zones[presetKey].coordinates];
    zoneState.zonePreset = presetKey;
    zoneState.selectedDistricts = [];
    clearResult();
    save();
  }
}

export function toggleDistrict(name) {
  if (zoneState.selectedDistricts.includes(name)) {
    zoneState.selectedDistricts = zoneState.selectedDistricts.filter(d => d !== name);
  } else {
    zoneState.selectedDistricts = [...zoneState.selectedDistricts, name];
  }
  zoneState.drawingMode = false;
  clearResult();
  save();
}

export function saveCustomZone(name) {
  if (zoneState.zoneCoordinates.length < 3) return;
  const existing = zoneState.customZones.map(z => z.name);
  let uniqueName = name;
  let n = 2;
  while (existing.includes(uniqueName)) {
    uniqueName = `${name} (${n++})`;
  }
  zoneState.customZones = [...zoneState.customZones, { name: uniqueName, coordinates: [...zoneState.zoneCoordinates] }];
  save();
}

export function loadCustomZone(index) {
  const zone = zoneState.customZones[index];
  if (!zone) return;
  zoneState.zoneCoordinates = [...zone.coordinates];
  zoneState.zonePreset = 'custom';
  zoneState.selectedDistricts = [];
  zoneState.drawingMode = false;
  clearResult();
  save();
}

export function deleteCustomZone(index) {
  const deleted = zoneState.customZones[index];
  zoneState.customZones = zoneState.customZones.filter((_, i) => i !== index);
  if (deleted && zoneState.zonePreset === 'custom' && JSON.stringify(zoneState.zoneCoordinates) === JSON.stringify(deleted.coordinates)) {
    const preset = CITY_PRESETS[zoneState.presetKey];
    if (preset) {
      const fallback = preset.zones.mkad ? 'mkad' : 'wide';
      zoneState.zonePreset = fallback;
      zoneState.zoneCoordinates = [...preset.zones[fallback].coordinates];
    }
    clearResult();
  }
  save();
}
