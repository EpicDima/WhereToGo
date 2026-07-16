<script>
  import { appState, saveSettings } from '../stores/app.svelte.js';
  import { t } from '../i18n/index.svelte.js';

  let { onNext } = $props();

  $effect(() => {
    if (appState.minDistance >= appState.maxDistance) {
      appState.minDistance = Math.max(0, appState.maxDistance - 0.5);
    }
    saveSettings();
  });

  function onMinChange(e) {
    appState.minDistance = Math.min(parseFloat(e.target.value), appState.maxDistance - 0.1);
  }

  function onMaxChange(e) {
    appState.maxDistance = Math.max(parseFloat(e.target.value), appState.minDistance + 0.1);
  }
</script>

<div class="space-y-4">
  <!-- Distance: min -->
  <div>
    <div class="flex justify-between items-baseline mb-2">
      <span class="text-[11px] font-semibold text-ink-3 uppercase tracking-wider">
        {t('notCloser')}
      </span>
      <span class="text-[13px] font-bold text-ink tabular-nums">{appState.minDistance.toFixed(1)} {t('km')}</span>
    </div>
    <input type="range" min="0" max={Math.max(appState.maxDistance - 0.1, 0.1)} step="0.1" value={appState.minDistance} oninput={onMinChange} class="w-full" />
    <p class="text-[10px] text-ink-3 mt-1">{t('minDistanceHint')}</p>
  </div>

  <!-- Distance: max -->
  <div>
    <div class="flex justify-between items-baseline mb-2">
      <span class="text-[11px] font-semibold text-ink-3 uppercase tracking-wider">
        {t('notFarther')}
      </span>
      <span class="text-[13px] font-bold text-ink tabular-nums">{appState.maxDistance.toFixed(1)} {t('km')}</span>
    </div>
    <input type="range" min={Math.max(appState.minDistance + 0.1, 0.2)} max="30" step="0.5" value={appState.maxDistance} oninput={onMaxChange} class="w-full" />
    <p class="text-[10px] text-ink-3 mt-1">{t('maxDistanceHint')}</p>
  </div>

  <button
    class="w-full py-3 rounded-xl text-[14px] font-bold btn-primary active:scale-[0.97] transition-all mt-2"
    onclick={onNext}
  >
    {t('next')}
  </button>
</div>
