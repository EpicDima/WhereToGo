import { saved, registerSlice, save } from '../../shared/stores/persist.js';
import { t } from '../../shared/i18n/index.svelte.js';
import { clearResult } from '../../shared/stores/app.svelte.js';

export const prefsState = $state({
  attractionPoints: saved?.attractionPoints ?? [],
  repulsionPoints: saved?.repulsionPoints ?? [],
  attractionRadius: saved?.attractionRadius ?? 1.5,
  repulsionRadius: saved?.repulsionRadius ?? 0.5,
  preferenceMode: saved?.preferenceMode ?? 'repulsion',
});

registerSlice(() => ({
  attractionPoints: prefsState.attractionPoints,
  repulsionPoints: prefsState.repulsionPoints,
  attractionRadius: prefsState.attractionRadius,
  repulsionRadius: prefsState.repulsionRadius,
  preferenceMode: prefsState.preferenceMode,
}));

export function addPreferencePoint(lngLat) {
  if (prefsState.preferenceMode === 'attraction') {
    const name = `${t('defaultPointName')} ${prefsState.attractionPoints.length + 1}`;
    prefsState.attractionPoints = [...prefsState.attractionPoints, { lng: lngLat.lng, lat: lngLat.lat, name }];
  } else {
    const name = `${t('defaultPointName')} ${prefsState.repulsionPoints.length + 1}`;
    prefsState.repulsionPoints = [...prefsState.repulsionPoints, { lng: lngLat.lng, lat: lngLat.lat, name }];
  }
  clearResult();
  save();
}

export function removeAttractionPoint(index) {
  prefsState.attractionPoints = prefsState.attractionPoints.filter((_, i) => i !== index);
  save();
}

export function removeRepulsionPoint(index) {
  prefsState.repulsionPoints = prefsState.repulsionPoints.filter((_, i) => i !== index);
  save();
}

export function updateAttractionPointName(index, name) {
  prefsState.attractionPoints = prefsState.attractionPoints.map((p, i) =>
    i === index ? { ...p, name } : p
  );
  save();
}

export function updateRepulsionPointName(index, name) {
  prefsState.repulsionPoints = prefsState.repulsionPoints.map((p, i) =>
    i === index ? { ...p, name } : p
  );
  save();
}

export function updateAttractionPointPosition(index, lng, lat) {
  prefsState.attractionPoints = prefsState.attractionPoints.map((p, i) =>
    i === index ? { ...p, lng, lat } : p
  );
  save();
}

export function updateRepulsionPointPosition(index, lng, lat) {
  prefsState.repulsionPoints = prefsState.repulsionPoints.map((p, i) =>
    i === index ? { ...p, lng, lat } : p
  );
  save();
}
