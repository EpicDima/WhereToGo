<script>
  import { appState, setCity, setZonePreset } from '../stores/app.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';
</script>

<div class="space-y-5">
  <div>
    <label class="block text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">Город</label>
    <div class="grid grid-cols-3 gap-2">
      {#each Object.entries(CITY_PRESETS) as [key, city]}
        <button
          class="px-3 py-2 rounded-lg text-sm font-medium transition-all
            {appState.selectedCity === key
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-cream-200 text-ink-600 hover:bg-cream-300'}"
          onclick={() => setCity(key)}
        >
          {city.name}
        </button>
      {/each}
    </div>
  </div>

  <div>
    <label class="block text-xs font-medium text-ink-400 uppercase tracking-wider mb-2">Зона поиска</label>
    <div class="space-y-2">
      {#each Object.entries(CITY_PRESETS[appState.selectedCity].zones) as [key, zone]}
        <button
          class="w-full text-left px-4 py-3 rounded-lg text-sm transition-all
            {appState.zonePreset === key
              ? 'bg-teal-600/10 text-teal-600 ring-1 ring-teal-600/30'
              : 'bg-cream-200 text-ink-600 hover:bg-cream-300'}"
          onclick={() => setZonePreset(key)}
        >
          <span class="font-medium">{zone.name}</span>
        </button>
      {/each}
      <button
        class="w-full text-left px-4 py-3 rounded-lg text-sm transition-all
          {appState.zonePreset === 'custom'
            ? 'bg-teal-600/10 text-teal-600 ring-1 ring-teal-600/30'
            : 'bg-cream-200 text-ink-600 hover:bg-cream-300'}"
        onclick={() => {
          appState.drawingMode = !appState.drawingMode;
          appState.zonePreset = 'custom';
        }}
      >
        <span class="font-medium">
          {appState.drawingMode ? '✏️ Рисуем... (кликайте на карту)' : '✏️ Нарисовать свою зону'}
        </span>
      </button>
    </div>
  </div>

  <div class="text-xs text-ink-400 bg-cream-200/60 rounded-lg p-3">
    Зона определяет область, в которой будет выбрана случайная точка. Используйте пресет или нарисуйте свою зону на карте.
  </div>
</div>
