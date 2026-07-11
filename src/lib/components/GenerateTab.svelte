<script>
  import { appState } from '../stores/app.svelte.js';

  let { onGenerate } = $props();
</script>

<div class="space-y-5">
  <div>
    <span class="block text-xs font-medium text-ink-400 uppercase tracking-wider mb-3">
      Мин. расстояние: {appState.minDistance.toFixed(1)} км
    </span>
    <input
      type="range"
      min="0"
      max="5"
      step="0.1"
      bind:value={appState.minDistance}
      class="w-full accent-teal-600"
    />
    <div class="flex justify-between text-xs text-ink-400 mt-1">
      <span>0 км</span>
      <span>5 км</span>
    </div>
  </div>

  <div>
    <span class="block text-xs font-medium text-ink-400 uppercase tracking-wider mb-3">
      Макс. расстояние: {appState.maxDistance.toFixed(1)} км
    </span>
    <input
      type="range"
      min="1"
      max="30"
      step="0.5"
      bind:value={appState.maxDistance}
      class="w-full accent-teal-600"
    />
    <div class="flex justify-between text-xs text-ink-400 mt-1">
      <span>1 км</span>
      <span>30 км</span>
    </div>
  </div>

  {#if appState.userLocations.length === 0}
    <div class="text-xs text-ink-400 bg-cream-200/60 rounded-lg p-3">
      Совет: добавьте участников во вкладке «Люди», чтобы расстояние считалось от них. Иначе — от центра города.
    </div>
  {/if}

  <button
    class="w-full py-4 rounded-xl text-base font-semibold transition-all
      {appState.isGenerating
        ? 'bg-teal-700 text-white cursor-wait'
        : 'bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98] shadow-lg shadow-teal-600/20'}"
    onclick={onGenerate}
    disabled={appState.isGenerating}
  >
    {#if appState.isGenerating}
      <span class="inline-flex items-center gap-2">
        <span class="animate-spin">⟳</span> Ищем место...
      </span>
    {:else}
      Куда пойти? 🎲
    {/if}
  </button>

  {#if appState.generatedPoint}
    <div class="bg-teal-600/10 rounded-xl p-4 ring-1 ring-teal-600/20">
      <div class="text-sm font-medium text-teal-700 mb-1">Точка найдена!</div>
      <div class="text-xs text-ink-600">
        {appState.generatedPoint.lat.toFixed(5)}, {appState.generatedPoint.lng.toFixed(5)}
      </div>
      <div class="flex gap-2 mt-3">
        <a
          href="https://www.google.com/maps?q={appState.generatedPoint.lat},{appState.generatedPoint.lng}"
          target="_blank"
          rel="noreferrer"
          class="flex-1 py-2 rounded-lg text-xs font-medium text-center bg-cream-200 text-ink-600 hover:bg-cream-300 transition-colors"
        >
          Открыть в Google Maps
        </a>
        <button
          class="flex-1 py-2 rounded-lg text-xs font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          onclick={onGenerate}
        >
          Ещё раз 🎲
        </button>
      </div>
    </div>
  {:else if appState.generatedPoint === null && !appState.isGenerating}
    <!-- nothing yet -->
  {/if}
</div>
