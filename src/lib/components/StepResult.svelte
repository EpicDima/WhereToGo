<script>
  import { appState } from '../stores/app.svelte.js';
  import { formatDistance, formatDuration } from '../utils/routing.js';
  import { haversineDistance } from '../utils/geo.js';

  let { onRestart, onRegenerate } = $props();

  let distancesToPoint = $derived(
    appState.generatedPoint && appState.userLocations.length > 0
      ? appState.userLocations.map(loc => haversineDistance(loc, appState.generatedPoint))
      : []
  );

  let origin = $derived(
    appState.userLocations.length > 0
      ? appState.userLocations[0]
      : null
  );
</script>

<div class="space-y-4">
  {#if appState.generatedPoint}
    <div class="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-3">
      <div>
        <div class="text-[15px] font-bold text-ink">Место найдено</div>
        <div class="text-[11px] text-ink-3 font-mono mt-1">
          {appState.generatedPoint.lat.toFixed(5)}, {appState.generatedPoint.lng.toFixed(5)}
        </div>
      </div>

      {#if distancesToPoint.length > 0}
        <div class="space-y-1.5 pt-1">
          {#each distancesToPoint as dist, i}
            <div class="flex items-center gap-2 text-[12px] text-ink-2">
              <span class="w-5 h-5 rounded-full bg-ink text-white text-[10px] font-bold inline-flex items-center justify-center">{i + 1}</span>
              <span class="font-medium">{appState.userLocations[i].name}</span>
              <span class="text-ink-3">— {formatDistance(dist)} по прямой</span>
            </div>
          {/each}
        </div>
      {/if}

      {#if appState.routeData}
        <div class="flex gap-4 text-[13px] font-medium text-ink-2 bg-white/60 rounded-lg px-3 py-2">
          <span>🚶 {formatDistance(appState.routeData.properties.distanceKm)}</span>
          <span>⏱ {formatDuration(appState.routeData.properties.timeSec)}</span>
        </div>
      {/if}

      <div class="flex gap-2 pt-1">
        {#if origin}
          <a
            href="https://www.google.com/maps/dir/?api=1&origin={origin.lat},{origin.lng}&destination={appState.generatedPoint.lat},{appState.generatedPoint.lng}&travelmode=walking"
            target="_blank"
            rel="noreferrer"
            class="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-center text-ink-2 hover:bg-panel-hover border border-border transition-colors"
          >
            Google Maps
          </a>
          <a
            href="https://yandex.ru/maps/?rtext={origin.lat},{origin.lng}~{appState.generatedPoint.lat},{appState.generatedPoint.lng}&rtt=pd"
            target="_blank"
            rel="noreferrer"
            class="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-center text-ink-2 hover:bg-panel-hover border border-border transition-colors"
          >
            Яндекс Карты
          </a>
        {:else}
          <a
            href="https://www.google.com/maps?q={appState.generatedPoint.lat},{appState.generatedPoint.lng}"
            target="_blank"
            rel="noreferrer"
            class="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-center text-ink-2 hover:bg-panel-hover border border-border transition-colors"
          >
            Google Maps
          </a>
          <a
            href="https://yandex.ru/maps/?pt={appState.generatedPoint.lng},{appState.generatedPoint.lat}&z=15"
            target="_blank"
            rel="noreferrer"
            class="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-center text-ink-2 hover:bg-panel-hover border border-border transition-colors"
          >
            Яндекс Карты
          </a>
        {/if}
      </div>
    </div>
  {:else if appState.isGenerating}
    <div class="text-center py-8">
      <svg class="animate-spin w-8 h-8 mx-auto text-accent" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4" />
      </svg>
      <p class="text-[13px] text-ink-3 mt-3">Ищем место...</p>
    </div>
  {/if}

  <button
    class="w-full py-3 rounded-xl text-[14px] font-bold bg-ink text-white hover:bg-ink/90 active:scale-[0.97] transition-all"
    onclick={onRestart}
  >
    Начать заново
  </button>
</div>
