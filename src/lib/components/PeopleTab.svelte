<script>
  import { appState, addUserLocation, removeUserLocation, updateUserLocationName } from '../stores/app.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';
</script>

<div class="space-y-5">
  <div class="text-sm text-ink-600">
    Кликните на карту, чтобы добавить участника. Маркеры можно перетаскивать.
  </div>

  {#if appState.userLocations.length === 0}
    <div class="bg-cream-200/60 rounded-xl p-6 text-center">
      <div class="text-3xl mb-2">📍</div>
      <p class="text-sm text-ink-400">Нажмите на карту, чтобы отметить своё местоположение</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each appState.userLocations as loc, i}
        <div class="flex items-center gap-3 bg-cream-200 rounded-lg px-3 py-2.5">
          <div class="w-7 h-7 rounded-full bg-ink-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
            {i + 1}
          </div>
          <input
            class="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
            value={loc.name}
            oninput={(e) => updateUserLocationName(i, e.target.value)}
            placeholder="Имя"
          />
          <span class="text-xs text-ink-400 shrink-0">
            {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
          </span>
          <button
            class="text-red-600 hover:text-red-600/80 text-lg leading-none shrink-0"
            onclick={() => removeUserLocation(i)}
            title="Удалить"
          >
            ×
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <button
    class="w-full py-2.5 rounded-lg text-sm font-medium bg-cream-200 text-ink-600 hover:bg-cream-300 transition-colors"
    onclick={() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => addUserLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
          () => {
            const city = CITY_PRESETS[appState.selectedCity];
            addUserLocation({ lng: city.center[0], lat: city.center[1] });
          }
        );
      }
    }}
  >
    📍 Моё местоположение (GPS)
  </button>
</div>
