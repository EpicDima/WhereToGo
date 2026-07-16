<script>
  import { appState, removeAttractionPoint, removeRepulsionPoint, updateAttractionPointName, updateRepulsionPointName, saveSettings } from '../stores/app.svelte.js';

  let { onNext } = $props();

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
    <span class="block text-[11px] font-semibold text-ink-3 uppercase tracking-wider mb-2">Режим</span>
    <div class="flex gap-1.5">
      <button
        class="flex-1 px-3 py-2 rounded-xl text-[12px] font-medium border transition-all
          {appState.preferenceMode === 'attraction'
            ? 'bg-emerald-500 text-white border-transparent shadow-sm'
            : 'text-ink border-border hover:bg-panel-hover'}"
        onclick={() => setMode('attraction')}
      >
        Интересно
      </button>
      <button
        class="flex-1 px-3 py-2 rounded-xl text-[12px] font-medium border transition-all
          {appState.preferenceMode === 'repulsion'
            ? 'bg-red-500 text-white border-transparent shadow-sm'
            : 'text-ink border-border hover:bg-panel-hover'}"
        onclick={() => setMode('repulsion')}
      >
        Избегать
      </button>
    </div>
    <p class="text-[10px] text-ink-3 mt-1.5">
      {appState.preferenceMode === 'attraction'
        ? 'Кликните на карту — место будет тяготеть к этим точкам'
        : 'Кликните на карту — место будет избегать этих точек'}
    </p>
  </div>

  <!-- Attraction points -->
  {#if appState.attractionPoints.length > 0}
    <div>
      <div class="flex justify-between items-baseline mb-2">
        <span class="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Притяжение</span>
        <span class="text-[11px] text-ink-4">{appState.attractionPoints.length}</span>
      </div>
      <div class="space-y-1">
        {#each appState.attractionPoints as pt, i}
          <div class="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-panel-hover transition-colors group">
            <div class="w-5 h-5 rounded-full bg-emerald-500 shrink-0"></div>
            <div class="flex-1 min-w-0">
              <input
                class="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-4 font-medium"
                value={pt.name}
                oninput={(e) => updateAttractionPointName(i, e.target.value)}
                placeholder="Название"
              />
              <span class="text-[10px] text-ink-4 font-mono">{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</span>
            </div>
            <button
              class="w-6 h-6 rounded-full text-ink-4 hover:text-red-500 hover:bg-red-500/10 text-sm flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onclick={() => removeAttractionPoint(i)}
            >×</button>
          </div>
        {/each}
      </div>
      <div class="mt-2">
        <div class="flex justify-between items-baseline mb-1">
          <span class="text-[10px] text-ink-3">Влияние</span>
          <span class="text-[11px] font-bold text-ink tabular-nums">{appState.attractionRadius.toFixed(1)} км</span>
        </div>
        <input type="range" min="0.3" max="5" step="0.1" value={appState.attractionRadius} oninput={onAttractionRadiusChange} class="w-full" />
        <p class="text-[10px] text-ink-4 mt-0.5">Чем ближе к точке, тем вероятнее результат (зелёный круг на карте)</p>
      </div>
    </div>
  {/if}

  <!-- Repulsion points -->
  {#if appState.repulsionPoints.length > 0}
    <div>
      <div class="flex justify-between items-baseline mb-2">
        <span class="text-[11px] font-semibold text-red-500 uppercase tracking-wider">Отталкивание</span>
        <span class="text-[11px] text-ink-4">{appState.repulsionPoints.length}</span>
      </div>
      <div class="space-y-1">
        {#each appState.repulsionPoints as pt, i}
          <div class="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-panel-hover transition-colors group">
            <div class="w-5 h-5 rounded-full bg-red-500 shrink-0"></div>
            <div class="flex-1 min-w-0">
              <input
                class="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-4 font-medium"
                value={pt.name}
                oninput={(e) => updateRepulsionPointName(i, e.target.value)}
                placeholder="Название"
              />
              <span class="text-[10px] text-ink-4 font-mono">{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</span>
            </div>
            <button
              class="w-6 h-6 rounded-full text-ink-4 hover:text-red-500 hover:bg-red-500/10 text-sm flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onclick={() => removeRepulsionPoint(i)}
            >×</button>
          </div>
        {/each}
      </div>
      <div class="mt-2">
        <div class="flex justify-between items-baseline mb-1">
          <span class="text-[10px] text-ink-3">Влияние</span>
          <span class="text-[11px] font-bold text-ink tabular-nums">{appState.repulsionRadius.toFixed(1)} км</span>
        </div>
        <input type="range" min="0.1" max="3" step="0.1" value={appState.repulsionRadius} oninput={onRepulsionRadiusChange} class="w-full" />
        <p class="text-[10px] text-ink-4 mt-0.5">Чем ближе к точке, тем менее вероятен результат (красный круг на карте)</p>
      </div>
    </div>
  {/if}

  {#if appState.attractionPoints.length === 0 && appState.repulsionPoints.length === 0}
    <div class="text-center py-6 text-ink-4">
      <p class="text-[12px]">Кликните на карту, чтобы добавить точку</p>
      <p class="text-[10px] mt-1">Шаг необязательный — можно пропустить</p>
    </div>
  {/if}

  <button
    class="w-full py-3 rounded-xl text-[14px] font-bold btn-primary active:scale-[0.97] transition-all mt-2"
    onclick={onNext}
  >
    Далее
  </button>
</div>
