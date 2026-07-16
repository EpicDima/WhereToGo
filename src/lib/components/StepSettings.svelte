<script>
  import { appState, saveSettings } from '../stores/app.svelte.js';

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
      <span class="text-[11px] font-semibold text-ink-3 uppercase tracking-wider" title="Точка не будет ближе этого расстояния от участников">
        Не ближе
      </span>
      <span class="text-[13px] font-bold text-ink tabular-nums">{appState.minDistance.toFixed(1)} км</span>
    </div>
    <input type="range" min="0" max={Math.max(appState.maxDistance - 0.1, 0.1)} step="0.1" value={appState.minDistance} oninput={onMinChange} class="w-full" />
    <p class="text-[10px] text-ink-3 mt-1">Исключить зону в этом радиусе (фиолетовый круг на карте)</p>
  </div>

  <!-- Distance: max -->
  <div>
    <div class="flex justify-between items-baseline mb-2">
      <span class="text-[11px] font-semibold text-ink-3 uppercase tracking-wider" title="Точка не будет дальше этого расстояния от участников">
        Не дальше
      </span>
      <span class="text-[13px] font-bold text-ink tabular-nums">{appState.maxDistance.toFixed(1)} км</span>
    </div>
    <input type="range" min={Math.max(appState.minDistance + 0.1, 0.2)} max="30" step="0.5" value={appState.maxDistance} oninput={onMaxChange} class="w-full" />
    <p class="text-[10px] text-ink-3 mt-1">Максимальный радиус поиска (жёлтый круг на карте)</p>
  </div>

  <button
    class="w-full py-3 rounded-xl text-[14px] font-bold btn-primary active:scale-[0.97] transition-all mt-2"
    onclick={onNext}
  >
    Далее
  </button>
</div>
