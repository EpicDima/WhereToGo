<script>
  import { appState } from '../shared/stores/app.svelte.js';
  import { prefsState, removeAttractionPoint, removeRepulsionPoint, updateAttractionPointName, updateRepulsionPointName } from './preferences.svelte.js';
  import { save } from '../shared/stores/persist.js';
  import { t } from '../shared/i18n/index.svelte.js';
  import PointCard from '../shared/ui/PointCard.svelte';
  import Label from '../shared/ui/Label.svelte';
  import Spinner from '../shared/ui/Spinner.svelte';

  let { onGenerate, errorMsg = '' } = $props();

  function setMode(mode) {
    prefsState.preferenceMode = mode;
  }

  function onAttractionRadiusChange(e) {
    prefsState.attractionRadius = parseFloat(e.target.value);
    save();
  }

  function onRepulsionRadiusChange(e) {
    prefsState.repulsionRadius = parseFloat(e.target.value);
    save();
  }
</script>

<div class="space-y-4">
  <div>
    <Label>{t('mode')}</Label>
    <div class="flex gap-1.5">
      <button
        class="mode-btn"
        class:mode-attract={prefsState.preferenceMode === 'attraction'}
        onclick={() => setMode('attraction')}
      >
        {t('attract')}
      </button>
      <button
        class="mode-btn"
        class:mode-repulse={prefsState.preferenceMode === 'repulsion'}
        onclick={() => setMode('repulsion')}
      >
        {t('repulse')}
      </button>
    </div>
    <p class="hint mt-1.5">
      {prefsState.preferenceMode === 'attraction' ? t('attractHint') : t('repulseHint')}
    </p>
  </div>

  {#if prefsState.attractionPoints.length > 0}
    <div>
      <div class="flex justify-between items-baseline mb-2">
        <Label color="green">{t('attraction')}</Label>
        <span class="text-[11px] text-ink-4">{prefsState.attractionPoints.length}</span>
      </div>
      <div class="space-y-1.5">
        {#each prefsState.attractionPoints as pt, i}
          <PointCard
            variant="green"
            name={pt.name}
            lat={pt.lat}
            lng={pt.lng}
            placeholder={t('pointPlaceholder')}
            onrename={(v) => updateAttractionPointName(i, v)}
            ondelete={() => removeAttractionPoint(i)}
          />
        {/each}
      </div>
      <div class="mt-2.5">
        <div class="flex justify-between items-baseline mb-1">
          <span class="hint">{t('influence')}</span>
          <span class="text-[11px] font-bold text-ink tabular-nums">{prefsState.attractionRadius.toFixed(1)} {t('km')}</span>
        </div>
        <input type="range" min="0.1" max="5" step="0.1" value={prefsState.attractionRadius} oninput={onAttractionRadiusChange} class="w-full" />
        <p class="hint muted">{t('attractRadiusHint')}</p>
      </div>
    </div>
  {/if}

  {#if prefsState.repulsionPoints.length > 0}
    <div>
      <div class="flex justify-between items-baseline mb-2">
        <Label color="red">{t('repulsion')}</Label>
        <span class="text-[11px] text-ink-4">{prefsState.repulsionPoints.length}</span>
      </div>
      <div class="space-y-1.5">
        {#each prefsState.repulsionPoints as pt, i}
          <PointCard
            variant="red"
            name={pt.name}
            lat={pt.lat}
            lng={pt.lng}
            placeholder={t('pointPlaceholder')}
            onrename={(v) => updateRepulsionPointName(i, v)}
            ondelete={() => removeRepulsionPoint(i)}
          />
        {/each}
      </div>
      <div class="mt-2.5">
        <div class="flex justify-between items-baseline mb-1">
          <span class="hint">{t('influence')}</span>
          <span class="text-[11px] font-bold text-ink tabular-nums">{prefsState.repulsionRadius.toFixed(1)} {t('km')}</span>
        </div>
        <input type="range" min="0.1" max="5" step="0.1" value={prefsState.repulsionRadius} oninput={onRepulsionRadiusChange} class="w-full" />
        <p class="hint muted">{t('repulseRadiusHint')}</p>
      </div>
    </div>
  {/if}

  {#if prefsState.attractionPoints.length === 0 && prefsState.repulsionPoints.length === 0}
    <div class="text-center py-6 text-ink-4">
      <p class="text-[12px]">{t('tapToAddPoint')}</p>
      <p class="hint mt-1">{t('stepOptional')}</p>
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
  .hint {
    font-size: 10px;
    color: var(--color-ink-3);
  }
  .hint.muted {
    color: var(--color-ink-4);
    margin-top: 0.125rem;
  }

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
    background: #22c55e;
    color: white;
    border-color: transparent;
    box-shadow: 0 1px 3px rgba(34, 197, 94, 0.3);
  }
  .mode-attract:hover {
    background: #22c55e;
  }
  .mode-repulse {
    background: #ef4444;
    color: white;
    border-color: transparent;
    box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
  }
  .mode-repulse:hover {
    background: #ef4444;
  }

  .generate-btn {
    width: 100%;
    padding: 0.875rem;
    border-radius: 0.75rem;
    font-size: 15px;
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
