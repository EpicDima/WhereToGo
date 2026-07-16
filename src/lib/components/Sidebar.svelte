<script>
  import { appState, nextStep, prevStep, restart, regenerate, setPresetCity } from '../stores/app.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';
  import { generateConstrainedPoint, generateConstrainedPointMulti, createPolygonFeature } from '../utils/geo.js';
  import { MINSK_DISTRICTS } from '../utils/districts.js';
  import StepZone from './StepZone.svelte';
  import StepPeople from './StepPeople.svelte';
  import StepPreferences from './StepPreferences.svelte';
  import StepSettings from './StepSettings.svelte';
  import StepResult from './StepResult.svelte';

  let errorMsg = $state('');

  const stepTitles = ['Выберите зону', 'Кто идёт?', 'Предпочтения', 'Настройки', 'Результат'];

  async function handleGenerate() {
    appState.isGenerating = true;
    regenerate();
    errorMsg = '';

    const useDistricts = appState.selectedDistricts.length > 0;
    let polygons = [];

    if (useDistricts) {
      polygons = appState.selectedDistricts
        .map(name => MINSK_DISTRICTS[name])
        .filter(Boolean)
        .map(coords => createPolygonFeature(coords))
        .filter(Boolean);
    } else {
      const poly = createPolygonFeature(
        appState.zoneCoordinates.map(c => [c[0], c[1]])
      );
      if (poly) polygons = [poly];
    }

    if (polygons.length === 0) {
      errorMsg = 'Зона не задана.';
      appState.isGenerating = false;
      return;
    }

    const locations = appState.userLocations.length > 0
      ? appState.userLocations
      : [{ lng: appState.city.center[0], lat: appState.city.center[1] }];

    const preferences = {
      attractionPoints: appState.attractionPoints,
      repulsionPoints: appState.repulsionPoints,
      attractionRadius: appState.attractionRadius,
      repulsionRadius: appState.repulsionRadius,
    };

    await new Promise(r => setTimeout(r, 300));

    const point = polygons.length === 1
      ? generateConstrainedPoint(polygons[0], locations, appState.minDistance, appState.maxDistance, preferences)
      : generateConstrainedPointMulti(polygons, locations, appState.minDistance, appState.maxDistance, preferences);

    if (!point) {
      errorMsg = 'Не удалось найти точку. Измените расстояния, зону или предпочтения.';
      appState.isGenerating = false;
      return;
    }

    appState.generatedPoint = point;
    appState.step = 4;
    appState.isGenerating = false;
  }
</script>

<div class="
  fixed z-20 flex flex-col
  top-4 left-4 bottom-4 w-[360px]
  glass rounded-2xl border border-border
  shadow-xl shadow-black/8
  max-lg:top-auto max-lg:left-0 max-lg:right-0 max-lg:bottom-0
  max-lg:w-full max-lg:rounded-t-2xl max-lg:rounded-b-none
  max-lg:max-h-[75vh] max-lg:border-0 max-lg:border-t
">
  <!-- Header -->
  <div class="px-5 pt-4 pb-2 max-lg:pt-2 shrink-0">
    <div class="w-9 h-[3px] bg-ink-4/50 rounded-full mx-auto mb-2.5 lg:hidden"></div>
    <div class="flex items-center justify-between">
      <h1 class="font-heading text-lg font-bold text-ink tracking-tight">Куда пойти?</h1>
    </div>
    <span class="text-[12px] text-ink-3">{appState.city.name}</span>
  </div>

  <!-- Progress -->
  <div class="px-5 pb-2 shrink-0">
    <div class="flex gap-1.5">
      {#each [0, 1, 2, 3, 4] as i}
        <div class="flex-1 h-[3px] rounded-full transition-colors {i <= appState.step ? 'bg-accent' : 'bg-ink-4/20'}"></div>
      {/each}
    </div>
    <div class="flex items-center justify-between mt-2">
      {#if appState.step > 0}
        <button class="text-[11px] text-ink-3 hover:text-ink transition-colors" onclick={prevStep}>
          ← Назад
        </button>
      {:else}
        <span></span>
      {/if}
      {#if appState.step > 0 && appState.step < 4}
        <button class="text-[11px] text-ink-3 hover:text-accent transition-colors font-medium" onclick={restart}>
          Сначала
        </button>
      {/if}
    </div>
    <h2 class="text-[15px] font-bold text-ink mt-1">{stepTitles[appState.step]}</h2>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto px-5 py-2 min-h-0">
    {#if appState.step === 0}
      <StepZone onNext={nextStep} />
    {:else if appState.step === 1}
      <StepPeople onNext={nextStep} />
    {:else if appState.step === 2}
      <StepPreferences onNext={nextStep} />
    {:else if appState.step === 3}
      <StepSettings onGenerate={handleGenerate} {errorMsg} />
    {:else}
      <StepResult onRestart={restart} onRegenerate={handleGenerate} />
    {/if}
  </div>
</div>
