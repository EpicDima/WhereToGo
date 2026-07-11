<script>
  import { appState, addUserLocation, removeUserLocation, updateUserLocationName } from '../stores/app.svelte.js';

  let { onNext } = $props();
</script>

<div class="space-y-3">
  <p class="text-[12px] text-ink-3">
    Кликните на карту, чтобы отметить участников. Можно перетаскивать.
  </p>

  {#if appState.userLocations.length === 0}
    <div class="rounded-xl border border-border border-dashed p-5 text-center">
      <p class="text-[13px] text-ink-3">Пока никого нет</p>
      <p class="text-[11px] text-ink-4 mt-1">Нажмите на карту или используйте GPS</p>
    </div>
  {:else}
    <div class="space-y-1.5">
      {#each appState.userLocations as loc, i}
        <div class="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-panel-hover transition-colors group">
          <div class="w-6 h-6 rounded-full bg-ink text-white text-[11px] font-bold flex items-center justify-center shrink-0">
            {i + 1}
          </div>
          <div class="flex-1 min-w-0">
            <input
              class="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-4 font-medium"
              value={loc.name}
              oninput={(e) => updateUserLocationName(i, e.target.value)}
              placeholder="Имя"
            />
            <span class="text-[10px] text-ink-4 font-mono">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
          </div>
          <button
            class="w-6 h-6 rounded-full text-ink-4 hover:text-danger hover:bg-danger/10 text-sm flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onclick={() => removeUserLocation(i)}
          >
            ×
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <button
    class="w-full py-2.5 rounded-xl text-[13px] font-medium text-ink-2 hover:bg-panel-hover border border-border transition-colors"
    onclick={() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => addUserLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
          () => {}
        );
      }
    }}
  >
    Моё местоположение (GPS)
  </button>

  <button
    class="w-full py-3 rounded-xl text-[14px] font-bold bg-ink text-white hover:bg-ink/90 active:scale-[0.97] transition-all"
    onclick={onNext}
  >
    {appState.userLocations.length === 0 ? 'Пропустить' : 'Далее'}
  </button>
</div>
