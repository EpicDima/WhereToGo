<script>
  import { appState, saveSettings } from '../stores/app.svelte.js';
  import { POI_CATEGORIES } from '../utils/poi.js';

  let { onGenerate, errorMsg = '' } = $props();

  $effect(() => {
    if (appState.minDistance >= appState.maxDistance) {
      appState.minDistance = Math.max(0, appState.maxDistance - 0.5);
    }
    saveSettings();
  });

  function onMinChange(e) {
    appState.minDistance = Math.min(parseFloat(e.target.value), appState.maxDistance - 0.1);
  }

  function onMaxChange(e) {
    appState.maxDistance = Math.max(parseFloat(e.target.value), appState.minDistance + 0.1);
  }

  function togglePoi(cat) {
    if (appState.poiCategories.includes(cat)) {
      appState.poiCategories = appState.poiCategories.filter(c => c !== cat);
    } else {
      appState.poiCategories = [...appState.poiCategories, cat];
    }
    saveSettings();
  }
</script>

<div class="space-y-4">
  <!-- Distance: min -->
  <div>
    <div class="flex justify-between items-baseline mb-2">
      <span class="text-[11px] font-semibold text-ink-3 uppercase tracking-wider" title="Точка не будет ближе этого расстояния от участников">
        Не ближе
      </span>
      <span class="text-[13px] font-bold text-ink tabular-nums">{appState.minDistance.toFixed(1)} км</span>
    </div>
    <input type="range" min="0" max={Math.max(appState.maxDistance - 0.1, 0.1)} step="0.1" value={appState.minDistance} oninput={onMinChange} class="w-full" />
    <p class="text-[10px] text-ink-3 mt-1">Исключить зону в этом радиусе (фиолетовый круг на карте)</p>
  </div>

  <!-- Distance: max -->
  <div>
    <div class="flex justify-between items-baseline mb-2">
      <span class="text-[11px] font-semibold text-ink-3 uppercase tracking-wider" title="Точка не будет дальше этого расстояния от участников">
        Не дальше
      </span>
      <span class="text-[13px] font-bold text-ink tabular-nums">{appState.maxDistance.toFixed(1)} км</span>
    </div>
    <input type="range" min={Math.max(appState.minDistance + 0.1, 0.2)} max="30" step="0.5" value={appState.maxDistance} oninput={onMaxChange} class="w-full" />
    <p class="text-[10px] text-ink-3 mt-1">Максимальный радиус поиска (жёлтый круг на карте)</p>
  </div>

  <!-- POI attraction -->
  <div>
    <span class="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Притяжение к местам</span>
    <div class="flex flex-wrap gap-1.5">
      {#each Object.entries(POI_CATEGORIES) as [key, cat]}
        <button
          class="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all
            {appState.poiCategories.includes(key)
              ? 'bg-accent text-white'
              : 'text-ink-3 hover:bg-panel-hover border border-border'}"
          onclick={() => togglePoi(key)}
        >
          {cat.emoji} {cat.name}
        </button>
      {/each}
    </div>
    <p class="text-[10px] text-ink-3 mt-1.5">Точка с большей вероятностью появится рядом с этими местами</p>
  </div>

  <!-- Route toggle -->
  <button
    class="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] transition-colors
      {appState.showRouting ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-panel-hover'}"
    onclick={() => { appState.showRouting = !appState.showRouting; saveSettings(); }}
    title="Пешеходный маршрут от первого участника"
  >
    <span>Маршрут на карте</span>
    <span class="w-8 h-[18px] rounded-full relative transition-colors {appState.showRouting ? 'bg-accent' : 'bg-ink-4/40'}">
      <span class="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-all {appState.showRouting ? 'left-[16px]' : 'left-[2px]'}"></span>
    </span>
  </button>

  {#if errorMsg}
    <div class="text-danger text-[12px] rounded-xl bg-danger/10 p-3">{errorMsg}</div>
  {/if}

  <!-- Generate -->
  <button
    class="w-full py-3.5 rounded-xl text-[15px] font-bold transition-all
      {appState.isGenerating
        ? 'bg-accent/80 text-white cursor-wait'
        : 'bg-accent text-white hover:bg-accent-hover active:scale-[0.97] shadow-lg shadow-accent-glow'}"
    onclick={onGenerate}
    disabled={appState.isGenerating}
  >
    {#if appState.isGenerating}
      <span class="inline-flex items-center gap-2">
        <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4" />
        </svg>
        Ищем...
      </span>
    {:else}
      Куда пойти?
    {/if}
  </button>
</div>
