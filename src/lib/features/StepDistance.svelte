<script>
  import { appState, saveSettings } from '../shared/stores/app.svelte.js';
  import { t } from '../shared/i18n/index.svelte.js';

  let { onNext } = $props();

  function onMinChange(e) {
    appState.minDistance = Math.min(parseFloat(e.target.value), appState.maxDistance - 0.1);
    saveSettings();
  }

  function onMaxChange(e) {
    appState.maxDistance = Math.max(parseFloat(e.target.value), appState.minDistance + 0.1);
    saveSettings();
  }
</script>

<div class="space-y-4">
  <div>
    <div class="flex justify-between items-baseline mb-2">
      <span class="label">{t('notCloser')}</span>
      <span class="text-[13px] font-bold text-ink tabular-nums">{appState.minDistance.toFixed(1)} {t('km')}</span>
    </div>
    <input type="range" min="0" max={Math.max(appState.maxDistance - 0.1, 0.1)} step="0.1" value={appState.minDistance} oninput={onMinChange} class="w-full" />
    <p class="hint">{t('minDistanceHint')}</p>
  </div>

  <div>
    <div class="flex justify-between items-baseline mb-2">
      <span class="label">{t('notFarther')}</span>
      <span class="text-[13px] font-bold text-ink tabular-nums">{appState.maxDistance.toFixed(1)} {t('km')}</span>
    </div>
    <input type="range" min={Math.max(appState.minDistance + 0.1, 0.2)} max="30" step="0.5" value={appState.maxDistance} oninput={onMaxChange} class="w-full" />
    <p class="hint">{t('maxDistanceHint')}</p>
  </div>

  <button
    class="w-full py-3 rounded-xl text-[14px] font-bold btn-primary active:scale-[0.97] transition-all mt-2"
    onclick={onNext}
  >
    {t('next')}
  </button>
</div>

<style>
  .label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-ink-3);
  }

  .hint {
    font-size: 10px;
    color: var(--color-ink-3);
    margin-top: 0.25rem;
  }
</style>
