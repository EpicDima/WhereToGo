import { appState, regenerate } from '../shared/stores/app.svelte.js';
import { zoneState } from './zone.svelte.js';
import { peopleState } from './people.svelte.js';
import { distanceState } from './distance.svelte.js';
import { prefsState } from './preferences.svelte.js';
import { generateConstrainedPoint, generateConstrainedPointMulti, createPolygonFeature, buildDistrictPolygons } from '../shared/utils/geo.js';
import { t } from '../shared/i18n/index.svelte.js';

/**
 * Generate a random constrained point based on current wizard state.
 * @returns {string|null} error message string, or null on success
 */
export async function handleGenerate() {
  appState.isGenerating = true;
  regenerate();

  const useDistricts = zoneState.selectedDistricts.length > 0;
  let polygons = [];
  let zoneBounds = null;

  const zonePoly = createPolygonFeature(
    zoneState.zoneCoordinates.map(c => [c[0], c[1]])
  );

  if (useDistricts) {
    polygons = buildDistrictPolygons(zoneState.selectedDistricts);
    zoneBounds = zonePoly;
  } else {
    if (zonePoly) polygons = [zonePoly];
  }

  if (polygons.length === 0) {
    appState.isGenerating = false;
    return t('zoneNotSet');
  }

  const locations = peopleState.userLocations.length > 0
    ? peopleState.userLocations
    : [{ lng: zoneState.city.center[0], lat: zoneState.city.center[1] }];

  const preferences = {
    attractionPoints: prefsState.attractionPoints,
    repulsionPoints: prefsState.repulsionPoints,
    attractionRadius: prefsState.attractionRadius,
    repulsionRadius: prefsState.repulsionRadius,
  };

  await new Promise(r => setTimeout(r, 300));

  const point = polygons.length === 1 && !zoneBounds
    ? generateConstrainedPoint(polygons[0], locations, distanceState.minDistance, distanceState.maxDistance, preferences)
    : generateConstrainedPointMulti(polygons, locations, distanceState.minDistance, distanceState.maxDistance, preferences, 3000, zoneBounds);

  if (!point) {
    appState.isGenerating = false;
    return t('generationFailed');
  }

  appState.generatedPoint = point;
  appState.step = 4;
  appState.isGenerating = false;
  return null;
}
