<script>
  import { appState, addUserLocation, removeUserLocation, updateUserLocationName } from '../stores/app.svelte.js';
  import { t } from '../i18n/index.svelte.js';

  let { onNext } = $props();
</script>

<div class="space-y-3">
  <p class="text-[12px] text-ink-3">
    {t('peopleHint')}
  </p>

  {#if appState.userLocations.length === 0}
    <div class="rounded-xl border border-border border-dashed p-5 text-center">
      <p class="text-[13px] text-ink-3">{t('nobodyYet')}</p>
      <p class="text-[11px] text-ink-4 mt-1">{t('tapMapOrGps')}</p>
    </div>
  {:else}
    <div class="space-y-1.5">
      {#each appState.userLocations as loc, i}
        <div class="flex items-center gap-2 rounded-xl px-3 py-2.5 border border-border">
          <div class="w-5 h-5 rounded-full bg-ink text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</div>
          <div class="flex-1 min-w-0">
            <input
              class="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-4 font-medium"
              value={loc.name}
              oninput={(e) => updateUserLocationName(i, e.target.value)}
              placeholder={t('namePlaceholder')}
            />
            <span class="text-[10px] text-ink-4 font-mono">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</span>
          </div>
          <button
            class="w-7 h-7 rounded-lg text-ink-3 hover:text-red-500 hover:bg-red-500/10 border border-border flex items-center justify-center transition-colors shrink-0"
            onclick={() => removeUserLocation(i)}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <button
    class="w-full py-2 rounded-xl text-[12px] font-medium text-ink-2 hover:bg-panel-hover border border-border transition-colors"
    onclick={() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => addUserLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
          () => {}
        );
      }
    }}
  >
    GPS
  </button>

  <button
    class="w-full py-3 rounded-xl text-[14px] font-bold btn-primary active:scale-[0.97] transition-all"
    onclick={onNext}
  >
    {appState.userLocations.length === 0 ? t('skip') : t('next')}
  </button>
</div>
