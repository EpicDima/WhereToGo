import { saved, registerSlice, save } from '../shared/stores/persist.js';

export const distanceState = $state({
  minDistance: saved?.minDistance ?? 0.5,
  maxDistance: saved?.maxDistance ?? 10,
});

registerSlice(() => ({
  minDistance: distanceState.minDistance,
  maxDistance: distanceState.maxDistance,
}));

export { save };
