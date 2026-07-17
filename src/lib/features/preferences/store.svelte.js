import { saved, registerSlice, save } from '../../shared/stores/persist.js';
import { t } from '../../shared/i18n/index.svelte.js';
import { clearResult } from '../../shared/stores/app.svelte.js';

export const preferencesState = $state({
  attractionPoints: saved?.attractionPoints ?? [],
  repulsionPoints: saved?.repulsionPoints ?? [],
  attractionRadius: saved?.attractionRadius ?? 1.5,
  repulsionRadius: saved?.repulsionRadius ?? 0.5,
  preferenceMode: saved?.preferenceMode ?? 'repulsion',
});

registerSlice(() => ({
  attractionPoints: preferencesState.attractionPoints,
  repulsionPoints: preferencesState.repulsionPoints,
  attractionRadius: preferencesState.attractionRadius,
  repulsionRadius: preferencesState.repulsionRadius,
  preferenceMode: preferencesState.preferenceMode,
}));

export function setPreferenceMode(mode) {
  preferencesState.preferenceMode = mode;
  save();
}

export function setAttractionRadius(value) {
  preferencesState.attractionRadius = value;
  save();
}

export function setRepulsionRadius(value) {
  preferencesState.repulsionRadius = value;
  save();
}

export function addPreferencePoint(lngLat) {
  if (preferencesState.preferenceMode === 'attraction') {
    const name = `${t('defaultPointName')} ${preferencesState.attractionPoints.length + 1}`;
    preferencesState.attractionPoints = [...preferencesState.attractionPoints, { lng: lngLat.lng, lat: lngLat.lat, name }];
  } else {
    const name = `${t('defaultPointName')} ${preferencesState.repulsionPoints.length + 1}`;
    preferencesState.repulsionPoints = [...preferencesState.repulsionPoints, { lng: lngLat.lng, lat: lngLat.lat, name }];
  }
  clearResult();
  save();
}

export function removeAttractionPoint(index) {
  preferencesState.attractionPoints = preferencesState.attractionPoints.filter((_, i) => i !== index);
  save();
}

export function removeRepulsionPoint(index) {
  preferencesState.repulsionPoints = preferencesState.repulsionPoints.filter((_, i) => i !== index);
  save();
}

export function updateAttractionPointName(index, name) {
  preferencesState.attractionPoints = preferencesState.attractionPoints.map((p, i) =>
    i === index ? { ...p, name } : p
  );
  save();
}

export function updateRepulsionPointName(index, name) {
  preferencesState.repulsionPoints = preferencesState.repulsionPoints.map((p, i) =>
    i === index ? { ...p, name } : p
  );
  save();
}

export function updateAttractionPointPosition(index, lng, lat) {
  preferencesState.attractionPoints = preferencesState.attractionPoints.map((p, i) =>
    i === index ? { ...p, lng, lat } : p
  );
  save();
}

export function updateRepulsionPointPosition(index, lng, lat) {
  preferencesState.repulsionPoints = preferencesState.repulsionPoints.map((p, i) =>
    i === index ? { ...p, lng, lat } : p
  );
  save();
}
