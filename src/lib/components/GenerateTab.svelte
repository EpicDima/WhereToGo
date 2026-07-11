<script>
  import { appState, saveSettings } from '../stores/app.svelte.js';
  import { formatDistance, formatDuration } from '../utils/routing.js';
  import { haversineDistance } from '../utils/geo.js';

  let { onGenerate, errorMsg = '' } = $props();

  $effect(() => {
    appState.minDistance;
    appState.maxDistance;
    appState.showRouting;
    saveSettings();
  });

  let distancesToPoint = $derived(
    appState.generatedPoint && appState.userLocations.length > 0
      ? appState.userLocations.map(loc => haversineDistance(loc, appState.generatedPoint))
      : []
  );
</script>

<div class="space-y-4">
  <!-- Distance sliders -->
  <div>
    <div class="flex justify-between items-baseline mb-2">
      <span class="text-[11px] font-semibold text-ink-3 uppercase tracking-wider">Не ближе</span>
      <span class="text-[13px] font-bold text-ink tabular-nums">{appState.minDistance.toFixed(1)} км</span>
    </div>
    <input type="range" min="0" max="5" step="0.1" bind:value={appState.minDistance} class="w-full" />
  </div>

  <div>
    <div class="flex justify-between items-baseline mb-2">
      <span class="text-[11px] font-semibold text-ink-3 uppercase tracking-wider">Не дальше</span>
      <span class="text-[13px] font-bold text-ink tabular-nums">{appState.maxDistance.toFixed(1)} км</span>
    </div>
    <input type="range" min="1" max="30" step="0.5" bind:value={appState.maxDistance} class="w-full" />
  </div>

  <!-- Route toggle -->
  <button
    class="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] transition-colors
      {appState.showRouting ? 'bg-accent/10 text-accent font-semibold' : 'text-ink-2 hover:bg-panel-hover'}"
    onclick={() => appState.showRouting = !appState.showRouting}
  >
    <span>Показать маршрут</span>
    <span class="w-8 h-[18px] rounded-full relative transition-colors {appState.showRouting ? 'bg-accent' : 'bg-ink-4/40'}">
      <span class="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-all {appState.showRouting ? 'left-[16px]' : 'left-[2px]'}"></span>
    </span>
  </button>

  {#if appState.userLocations.length === 0}
    <p class="text-[11px] text-ink-3 leading-relaxed">
      Добавьте участников во вкладке «Люди» для расчёта расстояний. Иначе — от центра.
    </p>
  {/if}

  <!-- Main CTA -->
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

  <!-- Error -->
  {#if errorMsg}
    <div class="text-danger text-[12px] rounded-xl bg-danger/8 p-3 leading-relaxed">
      {errorMsg}
    </div>
  {/if}

  <!-- Result -->
  {#if appState.generatedPoint}
    <div class="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-3 animate-fadeIn">
      <div>
        <div class="text-[14px] font-bold text-ink">Место найдено</div>
        <div class="text-[11px] text-ink-3 font-mono mt-0.5">
          {appState.generatedPoint.lat.toFixed(5)}, {appState.generatedPoint.lng.toFixed(5)}
        </div>
      </div>

      {#if distancesToPoint.length > 0}
        <div class="space-y-1">
          {#each distancesToPoint as dist, i}
            <div class="flex items-center gap-2 text-[12px] text-ink-2">
              <span class="w-4 h-4 rounded-full bg-ink text-white text-[9px] font-bold inline-flex items-center justify-center">{i + 1}</span>
              {formatDistance(dist)} по прямой
            </div>
          {/each}
        </div>
      {/if}

      {#if appState.routeData}
        <div class="flex gap-4 text-[13px] text-ink-2 font-medium">
          <span>{formatDistance(appState.routeData.properties.distanceKm)} пешком</span>
          <span>{formatDuration(appState.routeData.properties.timeSec)}</span>
        </div>
      {/if}

      <div class="flex gap-2 pt-1">
        <a
          href="https://www.google.com/maps/dir/?api=1&destination={appState.generatedPoint.lat},{appState.generatedPoint.lng}&travelmode=walking"
          target="_blank"
          rel="noreferrer"
          class="flex-1 py-2 rounded-lg text-[12px] font-semibold text-center text-ink-2 hover:bg-panel-hover border border-border transition-colors"
        >
          Google
        </a>
        <a
          href="https://yandex.ru/maps/?rtext=~{appState.generatedPoint.lat},{appState.generatedPoint.lng}&rtt=pd"
          target="_blank"
          rel="noreferrer"
          class="flex-1 py-2 rounded-lg text-[12px] font-semibold text-center text-ink-2 hover:bg-panel-hover border border-border transition-colors"
        >
          Яндекс
        </a>
        <button
          class="flex-1 py-2 rounded-lg text-[12px] font-semibold bg-accent text-white hover:bg-accent-hover transition-colors"
          onclick={onGenerate}
        >
          Ещё раз
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  :global(.animate-fadeIn) {
    animation: fadeIn 0.3s ease-out;
  }
</style>
