<script>
  import { appState, saveSettings } from '../stores/app.svelte.js';

  let { onGenerate, errorMsg = '' } = $props();

  $effect(() => {
    if (appState.minDistance >= appState.maxDistance) {
      appState.minDistance = Math.max(0, appState.maxDistance - 0.5);
    }
    saveSettings();
  });

  function onMinChange(e) {
    const val = parseFloat(e.target.value);
    appState.minDistance = Math.min(val, appState.maxDistance - 0.1);
  }

  function onMaxChange(e) {
    const val = parseFloat(e.target.value);
    appState.maxDistance = Math.max(val, appState.minDistance + 0.1);
  }
</script>

<div class="space-y-4">
  <div>
    <div class="flex justify-between items-baseline mb-2">
      <span
        class="text-[11px] font-semibold text-ink-3 uppercase tracking-wider cursor-help"
        title="Минимальное расстояние от участников до случайной точки (по прямой). Чтобы не попасть слишком близко к текущей позиции."
      >
        Не ближе
      </span>
      <span class="text-[13px] font-bold text-ink tabular-nums">{appState.minDistance.toFixed(1)} км</span>
    </div>
    <input
      type="range" min="0" max={appState.maxDistance - 0.1} step="0.1"
      value={appState.minDistance}
      oninput={onMinChange}
      class="w-full"
    />
    <p class="text-[10px] text-ink-4 mt-1">Исключить зону в радиусе {appState.minDistance.toFixed(1)} км от участников</p>
  </div>

  <div>
    <div class="flex justify-between items-baseline mb-2">
      <span
        class="text-[11px] font-semibold text-ink-3 uppercase tracking-wider cursor-help"
        title="Максимальное расстояние от участников до случайной точки (по прямой). Чтобы не попасть на край города без возможности добраться."
      >
        Не дальше
      </span>
      <span class="text-[13px] font-bold text-ink tabular-nums">{appState.maxDistance.toFixed(1)} км</span>
    </div>
    <input
      type="range" min={appState.minDistance + 0.1} max="30" step="0.5"
      value={appState.maxDistance}
      oninput={onMaxChange}
      class="w-full"
    />
    <p class="text-[10px] text-ink-4 mt-1">Точка будет не дальше {appState.maxDistance.toFixed(1)} км от участников</p>
  </div>

  <button
    class="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] transition-colors
      {appState.showRouting ? 'bg-accent/10 text-accent font-semibold' : 'text-ink-2 hover:bg-panel-hover'}"
    onclick={() => { appState.showRouting = !appState.showRouting; saveSettings(); }}
    title="Построить пешеходный маршрут от первого участника до случайной точки"
  >
    <span>Показать маршрут на карте</span>
    <span class="w-8 h-[18px] rounded-full relative transition-colors {appState.showRouting ? 'bg-accent' : 'bg-ink-4/40'}">
      <span class="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-all {appState.showRouting ? 'left-[16px]' : 'left-[2px]'}"></span>
    </span>
  </button>

  {#if errorMsg}
    <div class="text-danger text-[12px] rounded-xl bg-danger/8 p-3 leading-relaxed">
      {errorMsg}
    </div>
  {/if}

  <button
    class="w-full py-3.5 rounded-xl text-[15px] font-bold transition-all
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
        Ищем...
      </span>
    {:else}
      Куда пойти?
    {/if}
  </button>
</div>
