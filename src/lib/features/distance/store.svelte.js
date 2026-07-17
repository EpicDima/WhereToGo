import { saved, registerSlice, save } from '../../shared/stores/persist.js';

export const distanceState = $state({
  minDistance: saved?.minDistance ?? 0.5,
  maxDistance: saved?.maxDistance ?? 10,
});

registerSlice(() => ({
  minDistance: distanceState.minDistance,
  maxDistance: distanceState.maxDistance,
}));

export function setMinDistance(value) {
  distanceState.minDistance = Math.min(value, distanceState.maxDistance - 0.1);
  save();
}

export function setMaxDistance(value) {
  distanceState.maxDistance = Math.max(value, distanceState.minDistance + 0.1);
  save();
}
