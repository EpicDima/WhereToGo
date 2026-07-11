<script>
  import { appState, setPresetCity, setZonePreset, saveSettings, saveCustomZone, loadCustomZone, deleteCustomZone } from '../stores/app.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';

  let { onNext } = $props();

  let hasPreset = $derived(appState.presetKey && CITY_PRESETS[appState.presetKey]);
  let showSaveInput = $state(false);
  let zoneName = $state('');

  function handleSave() {
    const name = zoneName.trim() || `Зона ${appState.customZones.length + 1}`;
    saveCustomZone(name);
    showSaveInput = false;
    zoneName = '';
  }
</script>

<div class="space-y-3">
  <!-- City selection -->
  <div>
    <span class="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Город</span>
    <div class="flex gap-1.5 flex-wrap">
      {#each Object.entries(CITY_PRESETS) as [key, city]}
        <button
          class="px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all
            {appState.presetKey === key
              ? 'btn-primary border-transparent'
              : 'text-ink hover:bg-panel-hover border-border'}"
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
            class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-medium border transition-all
              {appState.zonePreset === key && !appState.drawingMode
                ? 'bg-accent text-white border-transparent shadow-md shadow-accent-glow'
                : 'text-ink border-border hover:bg-panel-hover'}"
            onclick={() => { appState.drawingMode = false; setZonePreset(key); }}
          >
            {zone.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Saved custom zones -->
  {#if appState.customZones.length > 0}
    <div>
      <span class="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Мои зоны</span>
      <div class="space-y-1.5">
        {#each appState.customZones as zone, i}
          <div class="flex gap-1.5">
            <button
              class="flex-1 text-left px-3.5 py-2.5 rounded-xl text-[13px] font-medium border transition-all
                {appState.zonePreset === 'custom' && !appState.drawingMode && JSON.stringify(appState.zoneCoordinates) === JSON.stringify(zone.coordinates)
                  ? 'bg-accent text-white border-transparent shadow-md shadow-accent-glow'
                  : 'text-ink border-border hover:bg-panel-hover'}"
              onclick={() => loadCustomZone(i)}
            >
              {zone.name}
            </button>
            <button
              class="w-9 rounded-xl text-ink-3 hover:text-danger hover:bg-danger/10 border border-border flex items-center justify-center transition-colors"
              onclick={() => deleteCustomZone(i)}
            >×</button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Custom draw -->
  <button
    class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-medium border transition-all
      {appState.drawingMode
        ? 'bg-accent text-white border-transparent shadow-md shadow-accent-glow'
        : appState.zonePreset === 'custom' && !appState.drawingMode
          ? 'bg-accent/10 text-accent border-accent/20'
          : 'text-ink border-border hover:bg-panel-hover'}"
    onclick={() => {
      appState.drawingMode = !appState.drawingMode;
      if (appState.drawingMode) appState.zonePreset = 'custom';
    }}
  >
    {appState.drawingMode ? 'Рисуем — кликайте на карту...' : 'Нарисовать свою зону'}
  </button>

  <!-- Save custom zone -->
  {#if appState.zonePreset === 'custom' && appState.zoneCoordinates.length >= 3 && !appState.drawingMode}
    {#if showSaveInput}
      <div class="flex gap-1.5">
        <input
          class="flex-1 px-3 py-2 rounded-xl text-[13px] bg-transparent border border-border text-ink outline-none placeholder:text-ink-4"
          placeholder="Название зоны"
          bind:value={zoneName}
          onkeydown={(e) => { if (e.key === 'Enter') handleSave(); }}
        />
        <button class="px-3 py-2 rounded-xl text-[12px] font-medium btn-primary" onclick={handleSave}>
          OK
        </button>
      </div>
    {:else}
      <button
        class="w-full py-2 rounded-xl text-[12px] font-medium text-ink-2 hover:bg-panel-hover border border-border transition-colors"
        onclick={() => showSaveInput = true}
      >
        Сохранить зону
      </button>
    {/if}
  {/if}

  <button
    class="w-full py-3 rounded-xl text-[14px] font-bold btn-primary active:scale-[0.97] transition-all mt-2"
    onclick={onNext}
    disabled={appState.zoneCoordinates.length < 3}
  >
    Далее
  </button>
</div>
