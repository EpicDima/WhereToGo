<script>
  import { zoneState, setPresetCity, setZonePreset, toggleDistrict, saveCustomZone, loadCustomZone, deleteCustomZone } from './store.svelte.js';
  import { t } from '../../shared/i18n/index.svelte.js';
  import { CITY_PRESETS } from '../../shared/utils/presets.js';
  import { MINSK_DISTRICTS } from '../../shared/utils/districts.js';
  import Chip from '../../shared/ui/Chip.svelte';
  import CloseButton from '../../shared/ui/CloseButton.svelte';
  import Label from '../../shared/ui/Label.svelte';
  import SecondaryButton from '../../shared/ui/SecondaryButton.svelte';
  import PrimaryButton from '../../shared/ui/PrimaryButton.svelte';

  let { onNext } = $props();

  let hasPreset = $derived(zoneState.presetKey && CITY_PRESETS[zoneState.presetKey]);
  let isZoneSaved = $derived(zoneState.customZones.some(z => JSON.stringify(z.coordinates) === JSON.stringify(zoneState.zoneCoordinates)));
  let showSaveInput = $state(false);
  let zoneName = $state('');

  function handleSave() {
    const name = zoneName.trim() || `${t('zone')} ${zoneState.customZones.length + 1}`;
    saveCustomZone(name);
    showSaveInput = false;
    zoneName = '';
  }
</script>

<div class="space-y-4">
  <div>
    <Label>{t('city')}</Label>
    <div class="flex flex-wrap gap-1.5">
      {#each Object.entries(CITY_PRESETS) as [key, city]}
        <Chip active={zoneState.presetKey === key} onclick={() => setPresetCity(key)}>
          {t(`city.${key}`)}
        </Chip>
      {/each}
    </div>
  </div>

  {#if hasPreset}
    <div>
      <Label>{t('zone')}</Label>
      <div class="space-y-1.5">
        {#each Object.entries(CITY_PRESETS[zoneState.presetKey].zones) as [key, zone]}
          <button
            class="zone-item"
            class:active={zoneState.zonePreset === key && !zoneState.drawingMode}
            onclick={() => { zoneState.drawingMode = false; setZonePreset(key); }}
          >
            {t(`zone.${key}`)}
          </button>
        {/each}

        {#each zoneState.customZones as zone, i}
          {@const active = zoneState.zonePreset === 'custom' && !zoneState.drawingMode && JSON.stringify(zoneState.zoneCoordinates) === JSON.stringify(zone.coordinates)}
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

        {#if zoneState.zonePreset === 'custom' && zoneState.zoneCoordinates.length >= 3 && !zoneState.drawingMode && !isZoneSaved}
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
            <SecondaryButton onclick={() => showSaveInput = true}>
              {t('saveZone')}
            </SecondaryButton>
          {/if}
        {/if}

        <button
          class="zone-item"
          class:active={zoneState.drawingMode}
          class:highlighted={!zoneState.drawingMode && zoneState.zonePreset === 'custom' && !isZoneSaved}
          onclick={() => {
            zoneState.drawingMode = !zoneState.drawingMode;
            if (zoneState.drawingMode) {
              zoneState.selectedDistricts = [];
            }
          }}
        >
          {zoneState.drawingMode ? t('drawingHint') : t('drawZone')}
        </button>
      </div>
    </div>
  {/if}

  {#if hasPreset}
    <div>
      <Label>{t('districts')}</Label>
      <div class="flex flex-wrap gap-1.5">
        {#each Object.keys(MINSK_DISTRICTS) as name}
          <Chip active={zoneState.selectedDistricts.includes(name)} onclick={() => toggleDistrict(name)}>
            {t(`district.${name}`)}
          </Chip>
        {/each}
      </div>
    </div>
  {/if}

  <PrimaryButton
    class="mt-2"
    onclick={onNext}
    disabled={zoneState.zoneCoordinates.length < 3 && zoneState.selectedDistricts.length === 0}
  >
    {t('next')}
  </PrimaryButton>
</div>

<style>
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
    background: var(--color-accent-soft);
    color: var(--color-accent);
    border-color: var(--color-accent-glow);
  }
  .zone-item.highlighted:hover {
    background: var(--color-accent-soft);
  }

</style>
