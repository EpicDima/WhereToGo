<script>
  import { appState } from '../stores/app.svelte.js';
  import { haversineDistance } from '../utils/geo.js';

  let { onRestart, onRegenerate } = $props();

  let address = $state('');
  let addressLoading = $state(false);
  let shared = $state(false);

  function formatDistance(km) {
    if (km < 1) return `${Math.round(km * 1000)} м`;
    return `${km.toFixed(1)} км`;
  }

  let distancesToPoint = $derived(
    appState.generatedPoint && appState.userLocations.length > 0
      ? appState.userLocations.map(loc => haversineDistance(loc, appState.generatedPoint))
      : []
  );

  $effect(() => {
    const pt = appState.generatedPoint;
    if (!pt) { address = ''; return; }
    addressLoading = true;
    address = '';
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pt.lat}&lon=${pt.lng}&zoom=18&accept-language=ru`)
      .then(r => r.json())
      .then(data => {
        if (appState.generatedPoint?.lat !== pt.lat || appState.generatedPoint?.lng !== pt.lng) return;
        const a = data.address;
        if (!a) { address = ''; return; }
        const road = a.road || a.pedestrian || a.footway || a.path || '';
        const house = a.house_number || '';
        const district = a.suburb || a.neighbourhood || a.city_district || '';
        const parts = [road, house].filter(Boolean).join(', ');
        address = [parts, district].filter(Boolean).join(' · ');
      })
      .catch(() => { address = ''; })
      .finally(() => { addressLoading = false; });
  });

  async function handleShare() {
    const pt = appState.generatedPoint;
    if (!pt) return;
    const loc = address || `${pt.lat.toFixed(5)}, ${pt.lng.toFixed(5)}`;
    const text = `Куда пойти? Сюда: ${loc}\n\nGoogle Maps: https://www.google.com/maps?q=${pt.lat},${pt.lng}\nЯндекс Карты: https://yandex.ru/maps/?pt=${pt.lng},${pt.lat}&z=15`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Куда пойти?', text });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(text);
    shared = true;
    setTimeout(() => shared = false, 2000);
  }
</script>

<div class="space-y-4">
  {#if appState.generatedPoint}
    <div class="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-2">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="text-[15px] font-bold text-ink">Место найдено</div>
          {#if addressLoading}
            <div class="text-[12px] text-ink-4 mt-1 animate-pulse">Определяем адрес...</div>
          {:else if address}
            <div class="text-[13px] text-ink-2 mt-1 leading-snug">{address}</div>
          {/if}
          <div class="text-[11px] text-ink-3 font-mono mt-1">
            {appState.generatedPoint.lat.toFixed(5)}, {appState.generatedPoint.lng.toFixed(5)}
          </div>
        </div>
        <button
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all
            {shared ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border text-ink-3 hover:bg-panel-hover hover:text-ink'}"
          onclick={handleShare}
          title={shared ? 'Скопировано!' : 'Поделиться'}
        >
          {#if shared}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5 6.5-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          {:else}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="12" cy="3" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="4" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="13" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M5.7 7L10.3 4M5.7 9l4.6 3" stroke="currentColor" stroke-width="1.5"/></svg>
          {/if}
        </button>
      </div>
    </div>

    <!-- Per-person distances + navigation -->
    {#if appState.userLocations.length > 0}
      <div class="space-y-2">
        {#each appState.userLocations as loc, i}
          <div class="rounded-xl border border-border p-3 space-y-2">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-btn text-btn-text text-[10px] font-bold inline-flex items-center justify-center">{i + 1}</span>
              <span class="text-[13px] font-medium text-ink">{loc.name}</span>
              <span class="text-[11px] text-ink-3 ml-auto">{formatDistance(distancesToPoint[i])}</span>
            </div>
            <div class="flex gap-1.5">
              <a
                href="https://www.google.com/maps/dir/?api=1&origin={loc.lat},{loc.lng}&destination={appState.generatedPoint.lat},{appState.generatedPoint.lng}&travelmode=walking"
                target="_blank" rel="noreferrer"
                class="flex-1 py-1.5 rounded-lg text-[11px] font-medium text-center text-ink-3 hover:bg-panel-hover border border-border transition-colors"
              >
                Google Maps
              </a>
              <a
                href="https://yandex.ru/maps/?rtext={loc.lat},{loc.lng}~{appState.generatedPoint.lat},{appState.generatedPoint.lng}&rtt=pd"
                target="_blank" rel="noreferrer"
                class="flex-1 py-1.5 rounded-lg text-[11px] font-medium text-center text-ink-3 hover:bg-panel-hover border border-border transition-colors"
              >
                Яндекс Карты
              </a>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="flex gap-2">
        <a
          href="https://www.google.com/maps?q={appState.generatedPoint.lat},{appState.generatedPoint.lng}"
          target="_blank" rel="noreferrer"
          class="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-center text-ink-2 hover:bg-panel-hover border border-border transition-colors"
        >
          Google Maps
        </a>
        <a
          href="https://yandex.ru/maps/?pt={appState.generatedPoint.lng},{appState.generatedPoint.lat}&z=15"
          target="_blank" rel="noreferrer"
          class="flex-1 py-2.5 rounded-lg text-[12px] font-semibold text-center text-ink-2 hover:bg-panel-hover border border-border transition-colors"
        >
          Яндекс Карты
        </a>
      </div>
    {/if}

    <!-- Actions -->
    <div class="flex gap-2 pt-1">
      <button
        class="flex-1 py-3 rounded-xl text-[14px] font-bold bg-accent text-white hover:bg-accent-hover active:scale-[0.97] transition-all shadow-md shadow-accent-glow"
        onclick={onRegenerate}
      >
        Другое место
      </button>
      <button
        class="flex-1 py-3 rounded-xl text-[14px] font-bold text-ink-2 hover:bg-panel-hover border border-border transition-all"
        onclick={onRestart}
      >
        Сначала
      </button>
    </div>
  {:else if appState.isGenerating}
    <div class="text-center py-8">
      <svg class="animate-spin w-8 h-8 mx-auto text-accent" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4" />
      </svg>
      <p class="text-[13px] text-ink-3 mt-3">Ищем место...</p>
    </div>
  {/if}
</div>
