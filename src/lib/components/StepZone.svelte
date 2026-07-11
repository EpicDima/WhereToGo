<script>
  import { appState, setZonePreset } from '../stores/app.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';

  let { onNext } = $props();
</script>

<div class="space-y-3">
  <div class="space-y-1.5">
    {#each Object.entries(CITY_PRESETS[appState.selectedCity].zones) as [key, zone]}
      <button
        class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] transition-all
          {appState.zonePreset === key
            ? 'bg-accent text-white font-semibold shadow-md shadow-accent-glow'
            : 'text-ink-2 hover:bg-panel-hover font-medium'}"
        onclick={() => setZonePreset(key)}
      >
        {zone.name}
      </button>
    {/each}

    <button
      class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] transition-all
        {appState.drawingMode
          ? 'bg-accent text-white font-semibold shadow-md shadow-accent-glow'
          : appState.zonePreset === 'custom'
            ? 'bg-accent/10 text-accent font-semibold ring-1 ring-accent/20'
            : 'text-ink-2 hover:bg-panel-hover font-medium'}"
      onclick={() => {
        appState.drawingMode = !appState.drawingMode;
        if (appState.drawingMode) appState.zonePreset = 'custom';
      }}
    >
      {appState.drawingMode ? 'Рисуем — кликайте на карту...' : 'Нарисовать свою зону'}
    </button>
  </div>

  <p class="text-[11px] text-ink-3 leading-relaxed">
    Зона — область, в которой появится случайная точка.
  </p>

  <button
    class="w-full py-3 rounded-xl text-[14px] font-bold bg-ink text-white hover:bg-ink/90 active:scale-[0.97] transition-all"
    onclick={onNext}
  >
    Далее
  </button>
</div>
