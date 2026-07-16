<script>
  import { appState, setPresetCity, setZonePreset, toggleDistrict, saveSettings, saveCustomZone, loadCustomZone, deleteCustomZone } from '../stores/app.svelte.js';
  import { t } from '../i18n/index.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';
  import { MINSK_DISTRICTS } from '../utils/districts.js';

  let { onNext } = $props();

  let hasPreset = $derived(appState.presetKey && CITY_PRESETS[appState.presetKey]);
  let isZoneSaved = $derived(appState.customZones.some(z => JSON.stringify(z.coordinates) === JSON.stringify(appState.zoneCoordinates)));
  let showSaveInput = $state(false);
  let zoneName = $state('');

  function handleSave() {
    const name = zoneName.trim() || `${t('zone')} ${appState.customZones.length + 1}`;
    saveCustomZone(name);
    showSaveInput = false;
    zoneName = '';
  }
</script>

<div class="space-y-3">
  <!-- City selection -->
  <div>
    <span class="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-2">{t('city')}</span>
    <div class="flex gap-1.5 flex-wrap">
      {#each Object.entries(CITY_PRESETS) as [key, city]}
        <button
          class="px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all
            {appState.presetKey === key
              ? 'btn-primary border-transparent'
              : 'text-ink hover:bg-panel-hover border-border'}"
          onclick={() => setPresetCity(key)}
        >
          {t(`city.${key}`)}
        </button>
      {/each}
    </div>
  </div>

  <!-- Zone presets + custom zones + draw -->
  {#if hasPreset}
    <div>
      <span class="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-2">{t('zone')}</span>
      <div class="space-y-1.5">
        {#each Object.entries(CITY_PRESETS[appState.presetKey].zones) as [key, zone]}
          <button
            class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-medium border transition-all
              {appState.zonePreset === key && !appState.drawingMode
                ? 'bg-accent text-white border-transparent shadow-md shadow-accent-glow'
                : 'text-ink border-border hover:bg-panel-hover'}"
            onclick={() => { appState.drawingMode = false; setZonePreset(key); }}
          >
            {t(`zone.${key}`)}
          </button>
        {/each}

        {#each appState.customZones as zone, i}
          {@const active = appState.zonePreset === 'custom' && !appState.drawingMode && JSON.stringify(appState.zoneCoordinates) === JSON.stringify(zone.coordinates)}
          <div
            class="flex items-center gap-2 rounded-xl px-3.5 py-2.5 border transition-all cursor-pointer
              {active
                ? 'bg-accent text-white border-transparent shadow-md shadow-accent-glow'
                : 'text-ink border-border hover:bg-panel-hover'}"
            onclick={() => loadCustomZone(i)}
            role="button"
            tabindex="0"
          >
            <span class="flex-1 text-[13px] font-medium">{zone.name}</span>
            <button
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0
                {active
                  ? 'text-white/70 hover:text-white hover:bg-white/15 border border-white/20'
                  : 'text-ink-3 hover:text-red-500 hover:bg-red-500/10 border border-border'}"
              onclick={(e) => { e.stopPropagation(); deleteCustomZone(i); }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
        {/each}

        {#if appState.zonePreset === 'custom' && appState.zoneCoordinates.length >= 3 && !appState.drawingMode && !isZoneSaved}
          {#if showSaveInput}
            <div class="flex gap-1.5">
              <input
                class="flex-1 px-3 py-2 rounded-xl text-[13px] bg-transparent border border-border text-ink outline-none placeholder:text-ink-4"
                placeholder={t('zoneName')}
                bind:value={zoneName}
                onkeydown={(e) => { if (e.key === 'Enter') handleSave(); }}
              />
              <button class="px-3 py-2 rounded-xl text-[12px] font-medium btn-primary" onclick={handleSave}>
                {t('ok')}
              </button>
            </div>
          {:else}
            <button
              class="w-full py-2 rounded-xl text-[12px] font-medium text-ink-2 hover:bg-panel-hover border border-border transition-colors"
              onclick={() => showSaveInput = true}
            >
              {t('saveZone')}
            </button>
          {/if}
        {/if}

        <button
          class="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-medium border transition-all
            {appState.drawingMode
              ? 'bg-accent text-white border-transparent shadow-md shadow-accent-glow'
              : appState.zonePreset === 'custom' && !isZoneSaved
                ? 'bg-accent/10 text-accent border-accent/20'
                : 'text-ink border-border hover:bg-panel-hover'}"
          onclick={() => {
            appState.drawingMode = !appState.drawingMode;
            if (appState.drawingMode) {
              appState.selectedDistricts = [];
            }
          }}
        >
          {appState.drawingMode ? t('drawingHint') : t('drawZone')}
        </button>
      </div>
    </div>
  {/if}

  <!-- Districts multi-select -->
  {#if hasPreset}
    <div>
      <span class="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-2">{t('districts')}</span>
      <div class="flex flex-wrap gap-1.5">
        {#each Object.keys(MINSK_DISTRICTS) as name}
          {@const selected = appState.selectedDistricts.includes(name)}
          <button
            class="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all
              {selected
                ? 'bg-accent text-white border-transparent shadow-sm shadow-accent-glow'
                : 'text-ink border-border hover:bg-panel-hover'}"
            onclick={() => toggleDistrict(name)}
          >
            {t(`district.${name}`)}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <button
    class="w-full py-3 rounded-xl text-[14px] font-bold btn-primary active:scale-[0.97] transition-all mt-2"
    onclick={onNext}
    disabled={appState.zoneCoordinates.length < 3 && appState.selectedDistricts.length === 0}
  >
    {t('next')}
  </button>
</div>
