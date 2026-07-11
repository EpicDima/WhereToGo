<script>
  import { appState, setCity, setZonePreset, removeUserLocation, updateUserLocationName } from '../stores/app.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';
  import { generateConstrainedPoint, createPolygonFeature } from '../utils/geo.js';
  import ZoneTab from './ZoneTab.svelte';
  import PeopleTab from './PeopleTab.svelte';
  import GenerateTab from './GenerateTab.svelte';

  const tabs = [
    { id: 'zone', label: 'Зона', icon: '◻' },
    { id: 'people', label: 'Люди', icon: '●' },
    { id: 'go', label: 'Пойти!', icon: '→' },
  ];

  function handleGenerate() {
    appState.isGenerating = true;
    appState.generatedPoint = null;

    const polygon = createPolygonFeature(
      appState.zoneCoordinates.map(c => [c[0], c[1]])
    );

    if (!polygon) {
      appState.isGenerating = false;
      return;
    }

    const locations = appState.userLocations.length > 0
      ? appState.userLocations
      : [{ lng: CITY_PRESETS[appState.selectedCity].center[0], lat: CITY_PRESETS[appState.selectedCity].center[1] }];

    setTimeout(() => {
      const point = generateConstrainedPoint(
        polygon,
        locations,
        appState.minDistance,
        appState.maxDistance
      );
      appState.generatedPoint = point;
      appState.isGenerating = false;
    }, 600);
  }
</script>

<div class="
  fixed top-0 left-0 h-full w-[380px] bg-cream-100/95 backdrop-blur-md
  border-r border-cream-300 z-20 flex flex-col
  max-lg:w-full max-lg:h-auto max-lg:top-auto max-lg:bottom-0
  max-lg:rounded-t-2xl max-lg:max-h-[70vh] max-lg:border-r-0 max-lg:border-t
  shadow-xl
">
  <div class="px-5 pt-5 pb-3 max-lg:pt-3">
    <div class="w-10 h-1 bg-cream-300 rounded-full mx-auto mb-3 lg:hidden"></div>
    <h1 class="font-heading text-xl font-bold text-ink-900 tracking-tight">Куда пойти?</h1>
    <p class="text-sm text-ink-400 mt-0.5">Случайное место на карте города</p>
  </div>

  <nav class="flex border-b border-cream-300 px-5 gap-1">
    {#each tabs as tab}
      <button
        class="flex-1 py-2.5 text-sm font-medium transition-colors relative
          {appState.activeTab === tab.id
            ? 'text-teal-600'
            : 'text-ink-400 hover:text-ink-600'}"
        onclick={() => appState.activeTab = tab.id}
      >
        <span class="mr-1">{tab.icon}</span>
        {tab.label}
        {#if appState.activeTab === tab.id}
          <span class="absolute bottom-0 left-2 right-2 h-0.5 bg-teal-600 rounded-full"></span>
        {/if}
      </button>
    {/each}
  </nav>

  <div class="flex-1 overflow-y-auto px-5 py-4">
    {#if appState.activeTab === 'zone'}
      <ZoneTab />
    {:else if appState.activeTab === 'people'}
      <PeopleTab />
    {:else}
      <GenerateTab onGenerate={handleGenerate} />
    {/if}
  </div>
</div>
