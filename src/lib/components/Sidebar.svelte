<script>
  import { appState, setCity } from '../stores/app.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';
  import { generateConstrainedPoint, createPolygonFeature } from '../utils/geo.js';
  import { getWalkingRoute } from '../utils/routing.js';
  import ZoneTab from './ZoneTab.svelte';
  import PeopleTab from './PeopleTab.svelte';
  import GenerateTab from './GenerateTab.svelte';

  const tabs = [
    { id: 'zone', label: 'Зона' },
    { id: 'people', label: 'Люди' },
    { id: 'go', label: 'Пойти!' },
  ];

  let errorMsg = $state('');

  async function handleGenerate() {
    appState.isGenerating = true;
    appState.generatedPoint = null;
    appState.routeData = null;
    errorMsg = '';

    const polygon = createPolygonFeature(
      appState.zoneCoordinates.map(c => [c[0], c[1]])
    );

    if (!polygon) {
      errorMsg = 'Зона не задана. Выберите пресет или нарисуйте свою.';
      appState.isGenerating = false;
      return;
    }

    const locations = appState.userLocations.length > 0
      ? appState.userLocations
      : [{ lng: CITY_PRESETS[appState.selectedCity].center[0], lat: CITY_PRESETS[appState.selectedCity].center[1] }];

    await new Promise(r => setTimeout(r, 350));

    const point = generateConstrainedPoint(
      polygon, locations, appState.minDistance, appState.maxDistance
    );

    if (!point) {
      errorMsg = 'Не удалось найти точку. Увеличьте макс. расстояние или уменьшите мин.';
      appState.isGenerating = false;
      return;
    }

    appState.generatedPoint = point;

    if (appState.showRouting && appState.userLocations.length > 0) {
      try {
        const route = await getWalkingRoute(appState.userLocations[0], point);
        appState.routeData = route;
      } catch {
        // silent fail — point is still shown
      }
    }

    appState.isGenerating = false;
  }
</script>

<!-- Desktop: floating panel -->
<div class="
  fixed z-20 flex flex-col
  top-4 left-4 bottom-4 w-[360px]
  glass rounded-2xl
  border border-border
  shadow-xl shadow-black/8
  max-lg:top-auto max-lg:left-0 max-lg:right-0 max-lg:bottom-0
  max-lg:w-full max-lg:rounded-t-2xl max-lg:rounded-b-none
  max-lg:max-h-[70vh] max-lg:border-0 max-lg:border-t
">
  <!-- Header -->
  <div class="px-5 pt-4 pb-2 max-lg:pt-2 shrink-0">
    <div class="w-9 h-[3px] bg-ink-4/50 rounded-full mx-auto mb-2.5 lg:hidden"></div>
    <div class="flex items-center justify-between">
      <h1 class="font-heading text-lg font-bold text-ink tracking-tight">Куда пойти?</h1>
      <select
        class="text-[13px] text-ink-2 bg-transparent border-0 outline-none cursor-pointer font-medium pr-1 appearance-auto"
        bind:value={appState.selectedCity}
        onchange={(e) => setCity(e.target.value)}
      >
        {#each Object.entries(CITY_PRESETS) as [key, city]}
          <option value={key}>{city.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Tabs -->
  <nav class="flex px-4 gap-1 shrink-0 mb-1">
    {#each tabs as tab}
      <button
        class="flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all
          {appState.activeTab === tab.id
            ? 'bg-ink text-white'
            : 'text-ink-3 hover:text-ink-2 hover:bg-panel-hover'}"
        onclick={() => appState.activeTab = tab.id}
      >
        {tab.label}
      </button>
    {/each}
  </nav>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto px-5 py-3 min-h-0">
    {#if appState.activeTab === 'zone'}
      <ZoneTab />
    {:else if appState.activeTab === 'people'}
      <PeopleTab />
    {:else}
      <GenerateTab {errorMsg} onGenerate={handleGenerate} />
    {/if}
  </div>
</div>
