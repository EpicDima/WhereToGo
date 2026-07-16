<script>
  import { onMount } from 'svelte';
  import { appState, nextStep, prevStep, restart, regenerate, setPresetCity } from '../stores/app.svelte.js';
  import { uiState } from '../stores/ui.svelte.js';
  import { CITY_PRESETS } from '../utils/presets.js';
  import { generateConstrainedPoint, generateConstrainedPointMulti, createPolygonFeature } from '../utils/geo.js';
  import { MINSK_DISTRICTS } from '../utils/districts.js';
  import StepZone from './StepZone.svelte';
  import StepPeople from './StepPeople.svelte';
  import StepPreferences from './StepPreferences.svelte';
  import StepDistance from './StepDistance.svelte';
  import StepResult from './StepResult.svelte';

  let errorMsg = $state('');

  const stepTitles = ['Выберите зону', 'Кто идёт?', 'Расстояние', 'Предпочтения', 'Результат'];

  let isMobile = $state(false);
  let sheetHeight = $state(0);
  let isDragging = $state(false);
  let dragStartY = 0;
  let dragStartHeight = 0;

  const SNAP_COLLAPSED = 130;
  let snapHalf = 400;
  let snapFull = 700;

  onMount(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    isMobile = mq.matches;
    updateSnaps();
    if (isMobile) sheetHeight = snapHalf;
    const handler = (e) => {
      isMobile = e.matches;
      if (isMobile) { updateSnaps(); sheetHeight = snapHalf; }
    };
    mq.addEventListener('change', handler);
    window.addEventListener('resize', () => { if (isMobile) updateSnaps(); });
    return () => mq.removeEventListener('change', handler);
  });

  function updateSnaps() {
    snapHalf = Math.round(window.innerHeight * 0.45);
    snapFull = Math.round(window.innerHeight * 0.85);
  }

  $effect(() => {
    uiState.mobileSheetHeight = isMobile ? sheetHeight : 0;
    if (isMobile) {
      document.documentElement.style.setProperty('--sheet-height', `${sheetHeight}px`);
    } else {
      document.documentElement.style.removeProperty('--sheet-height');
    }
  });
  $effect(() => {
    const step = appState.step;
    if (!isMobile) return;
    if (step === 1 || step === 3) return;
    if (sheetHeight < snapHalf) sheetHeight = snapHalf;
  });

  function onHandleDown(e) {
    if (!isMobile || e.target.closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging = true;
    dragStartY = e.clientY;
    dragStartHeight = sheetHeight;
  }

  function onHandleMove(e) {
    if (!isDragging) return;
    sheetHeight = Math.max(SNAP_COLLAPSED, Math.min(snapFull, dragStartHeight + (dragStartY - e.clientY)));
  }

  function onHandleUp() {
    if (!isDragging) return;
    const delta = sheetHeight - dragStartHeight;
    const snaps = [SNAP_COLLAPSED, snapHalf, snapFull];
    if (Math.abs(delta) > 40) {
      sheetHeight = delta > 0
        ? (snaps.find(s => s > dragStartHeight) ?? snaps[snaps.length - 1])
        : ([...snaps].reverse().find(s => s < dragStartHeight) ?? snaps[0]);
    } else {
      sheetHeight = snaps.reduce((a, b) => Math.abs(b - sheetHeight) < Math.abs(a - sheetHeight) ? b : a);
    }
    isDragging = false;
  }

  async function handleGenerate() {
    appState.isGenerating = true;
    regenerate();
    errorMsg = '';

    const useDistricts = appState.selectedDistricts.length > 0;
    let polygons = [];
    let zoneBounds = null;

    const zonePoly = createPolygonFeature(
      appState.zoneCoordinates.map(c => [c[0], c[1]])
    );

    if (useDistricts) {
      polygons = appState.selectedDistricts
        .map(name => MINSK_DISTRICTS[name])
        .filter(Boolean)
        .map(coords => createPolygonFeature(coords))
        .filter(Boolean);
      zoneBounds = zonePoly;
    } else {
      if (zonePoly) polygons = [zonePoly];
    }

    if (polygons.length === 0) {
      errorMsg = 'Зона не задана.';
      appState.isGenerating = false;
      return;
    }

    const locations = appState.userLocations.length > 0
      ? appState.userLocations
      : [{ lng: appState.city.center[0], lat: appState.city.center[1] }];

    const preferences = {
      attractionPoints: appState.attractionPoints,
      repulsionPoints: appState.repulsionPoints,
      attractionRadius: appState.attractionRadius,
      repulsionRadius: appState.repulsionRadius,
    };

    await new Promise(r => setTimeout(r, 300));

    const point = polygons.length === 1 && !zoneBounds
      ? generateConstrainedPoint(polygons[0], locations, appState.minDistance, appState.maxDistance, preferences)
      : generateConstrainedPointMulti(polygons, locations, appState.minDistance, appState.maxDistance, preferences, 3000, zoneBounds);

    if (!point) {
      errorMsg = 'Не удалось найти точку. Измените расстояния, зону или предпочтения.';
      appState.isGenerating = false;
      return;
    }

    appState.generatedPoint = point;
    appState.step = 4;
    appState.isGenerating = false;
  }
</script>

<div class="
  fixed z-20 flex flex-col
  top-4 left-4 bottom-4 w-[360px]
  glass rounded-2xl border border-border
  shadow-xl shadow-black/8
  max-lg:top-auto max-lg:left-0 max-lg:right-0 max-lg:bottom-0
  max-lg:w-full max-lg:rounded-t-2xl max-lg:rounded-b-none
  max-lg:border-0 max-lg:border-t max-lg:overflow-hidden
  {isMobile && !isDragging ? 'sheet-snap' : ''}"
  style={isMobile ? `height: ${sheetHeight}px` : ''}
>
  <!-- Header -->
  <div class="px-5 pt-4 pb-2 max-lg:pt-2 shrink-0"
    onpointerdown={onHandleDown}
    onpointermove={onHandleMove}
    onpointerup={onHandleUp}
    style:touch-action={isMobile ? 'none' : undefined}
    style:cursor={isMobile ? (isDragging ? 'grabbing' : 'grab') : undefined}
  >
    <div class="w-10 h-1 bg-ink-4/40 rounded-full mx-auto mb-2 lg:hidden"></div>
    <div class="flex items-center justify-between">
      <h1 class="font-heading text-lg font-bold text-ink tracking-tight">Куда пойти?</h1>
    </div>
    <span class="text-[12px] text-ink-3">{appState.city.name}</span>
  </div>

  <!-- Progress -->
  <div class="px-5 pb-2 shrink-0">
    <div class="flex gap-1.5">
      {#each [0, 1, 2, 3, 4] as i}
        <div class="flex-1 h-[3px] rounded-full transition-colors {i <= appState.step ? 'bg-accent' : 'bg-ink-4/20'}"></div>
      {/each}
    </div>
    <div class="flex items-center justify-between mt-2">
      {#if appState.step > 0}
        <button class="text-[11px] text-ink-3 hover:text-ink transition-colors" onclick={prevStep}>
          ← Назад
        </button>
      {:else}
        <span></span>
      {/if}
      {#if appState.step > 0 && appState.step < 4}
        <button class="text-[11px] text-ink-3 hover:text-accent transition-colors font-medium" onclick={restart}>
          Сначала
        </button>
      {/if}
    </div>
    <h2 class="text-[15px] font-bold text-ink mt-1">{stepTitles[appState.step]}</h2>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto px-5 py-2 min-h-0">
    {#if appState.step === 0}
      <StepZone onNext={nextStep} />
    {:else if appState.step === 1}
      <StepPeople onNext={nextStep} />
    {:else if appState.step === 2}
      <StepDistance onNext={nextStep} />
    {:else if appState.step === 3}
      <StepPreferences onGenerate={handleGenerate} {errorMsg} />
    {:else}
      <StepResult onRestart={restart} onRegenerate={handleGenerate} />
    {/if}
  </div>
</div>

<style>
  :global(.sheet-snap) {
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
