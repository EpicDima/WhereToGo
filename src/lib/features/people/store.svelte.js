import { saved, registerSlice, save } from '../../shared/stores/persist.js';
import { t } from '../../shared/i18n/index.svelte.js';

export const peopleState = $state({
  userLocations: saved?.userLocations ?? [],
});

registerSlice(() => ({
  userLocations: peopleState.userLocations,
}));

export function addUserLocation(lngLat) {
  const name = peopleState.userLocations.length === 0 ? t('defaultNameMe') : `${t('defaultNameFriend')} ${peopleState.userLocations.length}`;
  peopleState.userLocations = [...peopleState.userLocations, { lng: lngLat.lng, lat: lngLat.lat, name }];
  save();
}

export function removeUserLocation(index) {
  peopleState.userLocations = peopleState.userLocations.filter((_, i) => i !== index);
  save();
}

export function updateUserLocationName(index, name) {
  peopleState.userLocations = peopleState.userLocations.map((loc, i) =>
    i === index ? { ...loc, name } : loc
  );
  save();
}

export function updateUserLocationPosition(index, lng, lat) {
  peopleState.userLocations = peopleState.userLocations.map((loc, i) =>
    i === index ? { ...loc, lng, lat } : loc
  );
  save();
}
