<script>
  import { appState, removeAttractionPoint, removeRepulsionPoint, updateAttractionPointName, updateRepulsionPointName, saveSettings } from '../stores/app.svelte.js';
  import { t } from '../i18n/index.svelte.js';

  let { onGenerate, errorMsg = '' } = $props();

  function setMode(mode) {
    appState.preferenceMode = mode;
  }

  function onAttractionRadiusChange(e) {
    appState.attractionRadius = parseFloat(e.target.value);
    saveSettings();
  }

  function onRepulsionRadiusChange(e) {
    appState.repulsionRadius = parseFloat(e.target.value);
    saveSettings();
  }
</script>

<div class="space-y-4">
  <!-- Mode toggle -->
  <div>
    <span class="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-2">{t('mode')}</span>
    <div class="flex gap-1.5">
      <button
        class="flex-1 px-3 py-2 rounded-xl text-[12px] font-medium border transition-all
          {appState.preferenceMode === 'attraction'
            ? 'bg-emerald-500 text-white border-transparent shadow-sm'
            : 'text-ink border-border hover:bg-panel-hover'}"
        onclick={() => setMode('attraction')}
      >
        {t('attract')}
      </button>
      <button
        class="flex-1 px-3 py-2 rounded-xl text-[12px] font-medium border transition-all
          {appState.preferenceMode === 'repulsion'
            ? 'bg-red-500 text-white border-transparent shadow-sm'
            : 'text-ink border-border hover:bg-panel-hover'}"
        onclick={() => setMode('repulsion')}
      >
        {t('repulse')}
      </button>
    </div>
    <p class="text-[10px] text-ink-3 mt-1.5">
      {appState.preferenceMode === 'attraction'
        ? t('attractHint')
        : t('repulseHint')}
    </p>
  </div>

  <!-- Attraction points -->
  {#if appState.attractionPoints.length > 0}
    <div>
      <div class="flex justify-between items-baseline mb-2">
        <span class="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">{t('attraction')}</span>
        <span class="text-[11px] text-ink-4">{appState.attractionPoints.length}</span>
      </div>
      <div class="space-y-1.5">
        {#each appState.attractionPoints as pt, i}
          <div class="flex items-center gap-2 rounded-xl px-3 py-2.5 border border-emerald-500/25 bg-emerald-500/5">
            <div class="w-5 h-5 rounded-full bg-emerald-500 shrink-0"></div>
            <div class="flex-1 min-w-0">
              <input
                class="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-4 font-medium"
                value={pt.name}
                oninput={(e) => updateAttractionPointName(i, e.target.value)}
                placeholder={t('pointPlaceholder')}
              />
              <span class="text-[10px] text-ink-4 font-mono">{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</span>
            </div>
            <button
              class="w-7 h-7 rounded-lg text-ink-3 hover:text-red-500 hover:bg-red-500/10 border border-border flex items-center justify-center transition-colors text-[12px] shrink-0"
              onclick={() => removeAttractionPoint(i)}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
        {/each}
      </div>
      <div class="mt-2.5">
        <div class="flex justify-between items-baseline mb-1">
          <span class="text-[10px] text-ink-3">{t('influence')}</span>
          <span class="text-[11px] font-bold text-ink tabular-nums">{appState.attractionRadius.toFixed(1)} {t('km')}</span>
        </div>
        <input type="range" min="0.1" max="5" step="0.1" value={appState.attractionRadius} oninput={onAttractionRadiusChange} class="w-full" />
        <p class="text-[10px] text-ink-4 mt-0.5">{t('attractRadiusHint')}</p>
      </div>
    </div>
  {/if}

  <!-- Repulsion points -->
  {#if appState.repulsionPoints.length > 0}
    <div>
      <div class="flex justify-between items-baseline mb-2">
        <span class="text-[11px] font-semibold text-red-500 uppercase tracking-wider">{t('repulsion')}</span>
        <span class="text-[11px] text-ink-4">{appState.repulsionPoints.length}</span>
      </div>
      <div class="space-y-1.5">
        {#each appState.repulsionPoints as pt, i}
          <div class="flex items-center gap-2 rounded-xl px-3 py-2.5 border border-red-500/25 bg-red-500/5">
            <div class="w-5 h-5 rounded-full bg-red-500 shrink-0"></div>
            <div class="flex-1 min-w-0">
              <input
                class="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-4 font-medium"
                value={pt.name}
                oninput={(e) => updateRepulsionPointName(i, e.target.value)}
                placeholder={t('pointPlaceholder')}
              />
              <span class="text-[10px] text-ink-4 font-mono">{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</span>
            </div>
            <button
              class="w-7 h-7 rounded-lg text-ink-3 hover:text-red-500 hover:bg-red-500/10 border border-border flex items-center justify-center transition-colors text-[12px] shrink-0"
              onclick={() => removeRepulsionPoint(i)}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
        {/each}
      </div>
      <div class="mt-2.5">
        <div class="flex justify-between items-baseline mb-1">
          <span class="text-[10px] text-ink-3">{t('influence')}</span>
          <span class="text-[11px] font-bold text-ink tabular-nums">{appState.repulsionRadius.toFixed(1)} {t('km')}</span>
        </div>
        <input type="range" min="0.1" max="5" step="0.1" value={appState.repulsionRadius} oninput={onRepulsionRadiusChange} class="w-full" />
        <p class="text-[10px] text-ink-4 mt-0.5">{t('repulseRadiusHint')}</p>
      </div>
    </div>
  {/if}

  {#if appState.attractionPoints.length === 0 && appState.repulsionPoints.length === 0}
    <div class="text-center py-6 text-ink-4">
      <p class="text-[12px]">{t('tapToAddPoint')}</p>
      <p class="text-[10px] mt-1">{t('stepOptional')}</p>
    </div>
  {/if}

  {#if errorMsg}
    <div class="text-danger text-[12px] rounded-xl bg-danger/10 p-3">{errorMsg}</div>
  {/if}

  <button
    class="w-full py-3.5 rounded-xl text-[15px] font-bold transition-all mt-2
      {appState.isGenerating
        ? 'bg-accent/80 text-white cursor-wait'
        : 'bg-accent text-white hover:bg-accent-hover active:scale-[0.97] shadow-lg shadow-accent-glow'}"
    onclick={onGenerate}
    disabled={appState.isGenerating}
  >
    {#if appState.isGenerating}
      <span class="inline-flex items-center gap-2">
        <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4" />
        </svg>
        {t('generating')}
      </span>
    {:else}
      {t('generate')}
    {/if}
  </button>
</div>
