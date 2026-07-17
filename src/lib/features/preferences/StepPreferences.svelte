<script>
  import { appState } from '../../shared/stores/app.svelte.js';
  import { preferencesState, removeAttractionPoint, removeRepulsionPoint, updateAttractionPointName, updateRepulsionPointName, setPreferenceMode, setAttractionRadius, setRepulsionRadius } from './store.svelte.js';
  import { t } from '../../shared/i18n/index.svelte.js';
  import PointCard from '../../shared/ui/PointCard.svelte';
  import Label from '../../shared/ui/Label.svelte';
  import Spinner from '../../shared/ui/Spinner.svelte';

  let { onGenerate, errorMsg = '' } = $props();
</script>

<div class="space-y-4">
  <div>
    <Label>{t('mode')}</Label>
    <div class="flex gap-1.5">
      <button
        class="mode-btn"
        class:mode-attract={preferencesState.preferenceMode === 'attraction'}
        onclick={() => setPreferenceMode('attraction')}
      >
        {t('attract')}
      </button>
      <button
        class="mode-btn"
        class:mode-repulse={preferencesState.preferenceMode === 'repulsion'}
        onclick={() => setPreferenceMode('repulsion')}
      >
        {t('repulse')}
      </button>
    </div>
    <p class="text-[10px] text-ink-3 mt-1.5">
      {preferencesState.preferenceMode === 'attraction' ? t('attractHint') : t('repulseHint')}
    </p>
  </div>

  {#if preferencesState.attractionPoints.length > 0}
    <div>
      <div class="flex justify-between items-baseline mb-2">
        <Label color="green">{t('attraction')}</Label>
        <span class="text-[11px] text-ink-4">{preferencesState.attractionPoints.length}</span>
      </div>
      <div class="space-y-1.5">
        {#each preferencesState.attractionPoints as pt, i}
          <PointCard
            variant="green"
            name={pt.name}
            lat={pt.lat}
            lng={pt.lng}
            placeholder={t('pointPlaceholder')}
            onRename={(v) => updateAttractionPointName(i, v)}
            onDelete={() => removeAttractionPoint(i)}
          />
        {/each}
      </div>
      <div class="mt-2.5">
        <div class="flex justify-between items-baseline mb-1">
          <span class="text-[10px] text-ink-3">{t('influence')}</span>
          <span class="text-[13px] font-bold text-ink tabular-nums">{preferencesState.attractionRadius.toFixed(1)} {t('km')}</span>
        </div>
        <input type="range" min="0.1" max="5" step="0.1" value={preferencesState.attractionRadius} oninput={(e) => setAttractionRadius(parseFloat(e.target.value))} class="w-full" />
        <p class="text-[10px] text-ink-4 mt-0.5">{t('attractRadiusHint')}</p>
      </div>
    </div>
  {/if}

  {#if preferencesState.repulsionPoints.length > 0}
    <div>
      <div class="flex justify-between items-baseline mb-2">
        <Label color="red">{t('repulsion')}</Label>
        <span class="text-[11px] text-ink-4">{preferencesState.repulsionPoints.length}</span>
      </div>
      <div class="space-y-1.5">
        {#each preferencesState.repulsionPoints as pt, i}
          <PointCard
            variant="red"
            name={pt.name}
            lat={pt.lat}
            lng={pt.lng}
            placeholder={t('pointPlaceholder')}
            onRename={(v) => updateRepulsionPointName(i, v)}
            onDelete={() => removeRepulsionPoint(i)}
          />
        {/each}
      </div>
      <div class="mt-2.5">
        <div class="flex justify-between items-baseline mb-1">
          <span class="text-[10px] text-ink-3">{t('influence')}</span>
          <span class="text-[13px] font-bold text-ink tabular-nums">{preferencesState.repulsionRadius.toFixed(1)} {t('km')}</span>
        </div>
        <input type="range" min="0.1" max="5" step="0.1" value={preferencesState.repulsionRadius} oninput={(e) => setRepulsionRadius(parseFloat(e.target.value))} class="w-full" />
        <p class="text-[10px] text-ink-4 mt-0.5">{t('repulseRadiusHint')}</p>
      </div>
    </div>
  {/if}

  {#if preferencesState.attractionPoints.length === 0 && preferencesState.repulsionPoints.length === 0}
    <div class="text-center py-6 text-ink-4">
      <p class="text-[12px]">{t('tapToAddPoint')}</p>
      <p class="text-[10px] text-ink-3 mt-1">{t('stepOptional')}</p>
    </div>
  {/if}

  {#if errorMsg}
    <div class="text-danger text-[12px] rounded-xl bg-danger/10 p-3">{errorMsg}</div>
  {/if}

  <button
    class="generate-btn mt-2"
    class:generating={appState.isGenerating}
    onclick={onGenerate}
    disabled={appState.isGenerating}
  >
    {#if appState.isGenerating}
      <span class="inline-flex items-center gap-2">
        <Spinner size={16} />
        {t('generating')}
      </span>
    {:else}
      {t('generate')}
    {/if}
  </button>
</div>

<style>
  .mode-btn {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border-radius: 0.75rem;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid var(--color-border);
    transition: all 0.15s;
    color: var(--color-ink);
  }
  .mode-btn:hover {
    background: var(--color-panel-hover);
  }
  .mode-attract {
    background: var(--color-green);
    color: white;
    border-color: transparent;
    box-shadow: 0 1px 3px color-mix(in srgb, var(--color-green) 30%, transparent);
  }
  .mode-attract:hover {
    background: var(--color-green);
  }
  .mode-repulse {
    background: var(--color-red);
    color: white;
    border-color: transparent;
    box-shadow: 0 1px 3px color-mix(in srgb, var(--color-red) 30%, transparent);
  }
  .mode-repulse:hover {
    background: var(--color-red);
  }

  .generate-btn {
    width: 100%;
    padding: 0.75rem 0;
    border-radius: 0.75rem;
    font-size: 14px;
    font-weight: 700;
    background: var(--color-accent);
    color: white;
    transition: all 0.15s;
    box-shadow: 0 4px 12px var(--color-accent-glow);
  }
  .generate-btn:hover {
    background: var(--color-accent-hover);
  }
  .generate-btn:active {
    transform: scale(0.97);
  }
  .generate-btn.generating {
    background: rgba(232, 88, 74, 0.8);
    cursor: wait;
  }
</style>
