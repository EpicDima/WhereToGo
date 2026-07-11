<script>
  import { appState, setPresetCity, setZonePreset, saveSettings } from '../stores/app.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';

  let { onNext } = $props();

  let hasPreset = $derived(appState.presetKey && CITY_PRESETS[appState.presetKey]);
</script>

<div class="space-y-3">
  <!-- City selection -->
  <div>
    <span class="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Город</span>
    <div class="flex gap-1.5 flex-wrap">
      {#each Object.entries(CITY_PRESETS) as [key, city]}
        <button
          class="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all
            {appState.presetKey === key
              ? 'btn-primary'
              : 'text-ink hover:bg-panel-hover border border-border'}"
          onclick={() => setPresetCity(key)}
        >
          {city.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Zone presets -->
  {#if hasPreset}
    <div>
      <span class="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Зона</span>
      <div class="space-y-1.5">
        {#each Object.entries(CITY_PRESETS[appState.presetKey].zones) as [key, zone]}
          <button
            class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] transition-all
              {appState.zonePreset === key
                ? 'bg-accent text-white font-semibold shadow-md shadow-accent-glow'
                : 'text-ink font-medium border border-border hover:bg-panel-hover'}"
            onclick={() => { appState.drawingMode = false; setZonePreset(key); }}
          >
            {zone.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Custom draw -->
  <button
    class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] transition-all
      {appState.drawingMode
        ? 'bg-accent text-white font-semibold shadow-md shadow-accent-glow'
        : appState.zonePreset === 'custom'
          ? 'bg-accent/10 text-accent font-semibold ring-1 ring-accent/20'
          : 'text-ink font-medium border border-border hover:bg-panel-hover'}"
    onclick={() => {
      appState.drawingMode = !appState.drawingMode;
      if (appState.drawingMode) appState.zonePreset = 'custom';
    }}
  >
    {appState.drawingMode ? 'Рисуем — кликайте на карту...' : 'Нарисовать свою зону'}
  </button>

  <button
    class="w-full py-3 rounded-xl text-[14px] font-bold btn-primary active:scale-[0.97] transition-all mt-2"
    onclick={onNext}
    disabled={appState.zoneCoordinates.length < 3}
  >
    Далее
  </button>
</div>
