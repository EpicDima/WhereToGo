<script>
  import { distanceState, save } from './store.svelte.js';
  import { t } from '../../shared/i18n/index.svelte.js';
  import Label from '../../shared/ui/Label.svelte';

  let { onNext } = $props();

  function onMinChange(e) {
    distanceState.minDistance = Math.min(parseFloat(e.target.value), distanceState.maxDistance - 0.1);
    save();
  }

  function onMaxChange(e) {
    distanceState.maxDistance = Math.max(parseFloat(e.target.value), distanceState.minDistance + 0.1);
    save();
  }
</script>

<div class="space-y-4">
  <div>
    <div class="flex justify-between items-baseline mb-2">
      <Label>{t('notCloser')}</Label>
      <span class="text-[13px] font-bold text-ink tabular-nums">{distanceState.minDistance.toFixed(1)} {t('km')}</span>
    </div>
    <input type="range" min="0" max={Math.max(distanceState.maxDistance - 0.1, 0.1)} step="0.1" value={distanceState.minDistance} oninput={onMinChange} class="w-full" />
    <p class="hint">{t('minDistanceHint')}</p>
  </div>

  <div>
    <div class="flex justify-between items-baseline mb-2">
      <Label>{t('notFarther')}</Label>
      <span class="text-[13px] font-bold text-ink tabular-nums">{distanceState.maxDistance.toFixed(1)} {t('km')}</span>
    </div>
    <input type="range" min={Math.max(distanceState.minDistance + 0.1, 0.2)} max="30" step="0.5" value={distanceState.maxDistance} oninput={onMaxChange} class="w-full" />
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
  .hint {
    font-size: 10px;
    color: var(--color-ink-3);
    margin-top: 0.25rem;
  }
</style>
