import { appState, regenerate } from '../../shared/stores/app.svelte.js';
import { zoneState } from '../zone/store.svelte.js';
import { peopleState } from '../people/store.svelte.js';
import { distanceState } from '../distance/store.svelte.js';
import { preferencesState } from '../preferences/store.svelte.js';
import { generateConstrainedPoint, generateConstrainedPointMulti, zoneToPolygon, buildDistrictPolygons, getLocationsOrCenter } from '../../shared/utils/geo.js';
import { t } from '../../shared/i18n/index.svelte.js';

/**
 * Generate a random constrained point based on current wizard state.
 * @returns {string|null} error message string, or null on success
 */
export async function handleGenerate() {
  if (appState.isGenerating) return null;
  appState.isGenerating = true;
  regenerate();

  const useDistricts = zoneState.selectedDistricts.length > 0;
  let polygons = [];
  let zoneBounds = null;

  const zonePoly = zoneToPolygon(zoneState.zoneCoordinates);

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

  const locations = getLocationsOrCenter(peopleState.userLocations, zoneState.city.center);

  const preferences = {
    attractionPoints: preferencesState.attractionPoints,
    repulsionPoints: preferencesState.repulsionPoints,
    attractionRadius: preferencesState.attractionRadius,
    repulsionRadius: preferencesState.repulsionRadius,
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
