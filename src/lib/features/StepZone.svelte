<script>
  import { appState, setPresetCity, setZonePreset, toggleDistrict, saveSettings, saveCustomZone, loadCustomZone, deleteCustomZone } from '../shared/stores/app.svelte.js';
  import { t } from '../shared/i18n/index.svelte.js';
  import { CITY_PRESETS } from '../shared/utils/presets.js';
  import { MINSK_DISTRICTS } from '../shared/utils/districts.js';
  import Chip from '../shared/ui/Chip.svelte';
  import CloseButton from '../shared/ui/CloseButton.svelte';

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
  <div>
    <span class="label">{t('city')}</span>
    <div class="flex flex-wrap gap-1.5">
      {#each Object.entries(CITY_PRESETS) as [key, city]}
        <Chip active={appState.presetKey === key} onclick={() => setPresetCity(key)}>
          {t(`city.${key}`)}
        </Chip>
      {/each}
    </div>
  </div>

  {#if hasPreset}
    <div>
      <span class="label">{t('zone')}</span>
      <div class="space-y-1.5">
        {#each Object.entries(CITY_PRESETS[appState.presetKey].zones) as [key, zone]}
          <button
            class="zone-item"
            class:active={appState.zonePreset === key && !appState.drawingMode}
            onclick={() => { appState.drawingMode = false; setZonePreset(key); }}
          >
            {t(`zone.${key}`)}
          </button>
        {/each}

        {#each appState.customZones as zone, i}
          {@const active = appState.zonePreset === 'custom' && !appState.drawingMode && JSON.stringify(appState.zoneCoordinates) === JSON.stringify(zone.coordinates)}
          <div
            class="zone-item flex items-center gap-2 cursor-pointer"
            class:active
            onclick={() => loadCustomZone(i)}
            role="button"
            tabindex="0"
          >
            <span class="flex-1">{zone.name}</span>
            <CloseButton {active} onclick={(e) => { e.stopPropagation(); deleteCustomZone(i); }} />
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
            <button class="save-btn" onclick={() => showSaveInput = true}>
              {t('saveZone')}
            </button>
          {/if}
        {/if}

        <button
          class="zone-item"
          class:active={appState.drawingMode}
          class:highlighted={!appState.drawingMode && appState.zonePreset === 'custom' && !isZoneSaved}
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

  {#if hasPreset}
    <div>
      <span class="label">{t('districts')}</span>
      <div class="flex flex-wrap gap-1.5">
        {#each Object.keys(MINSK_DISTRICTS) as name}
          <Chip active={appState.selectedDistricts.includes(name)} onclick={() => toggleDistrict(name)}>
            {t(`district.${name}`)}
          </Chip>
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

<style>
  .label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-ink-3);
    margin-bottom: 0.5rem;
  }

  .zone-item {
    width: 100%;
    text-align: left;
    padding: 0.625rem 0.875rem;
    border-radius: 0.75rem;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid var(--color-border);
    transition: all 0.15s;
    color: var(--color-ink);
  }
  .zone-item:hover {
    background: var(--color-panel-hover);
  }
  .zone-item.active {
    background: var(--color-accent);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px var(--color-accent-glow);
  }
  .zone-item.active:hover {
    background: var(--color-accent);
  }
  .zone-item.highlighted {
    background: rgba(232, 88, 74, 0.1);
    color: var(--color-accent);
    border-color: rgba(232, 88, 74, 0.2);
  }
  .zone-item.highlighted:hover {
    background: rgba(232, 88, 74, 0.15);
  }

  .save-btn {
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.75rem;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-ink-2);
    border: 1px solid var(--color-border);
    transition: all 0.15s;
  }
  .save-btn:hover {
    background: var(--color-panel-hover);
  }
</style>
