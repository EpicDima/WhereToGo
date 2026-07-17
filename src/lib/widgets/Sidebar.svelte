<script>
  import { onMount } from 'svelte';
  import { appState, nextStep, prevStep, restart } from '../shared/stores/app.svelte.js';
  import { zoneState } from '../features/zone/store.svelte.js';
  import { t } from '../shared/i18n/index.svelte.js';
  import { uiState } from '../shared/stores/ui.svelte.js';
  import { handleGenerate as generate } from '../features/result/generate.js';
  import StepZone from '../features/zone/StepZone.svelte';
  import StepPeople from '../features/people/StepPeople.svelte';
  import StepPreferences from '../features/preferences/StepPreferences.svelte';
  import StepDistance from '../features/distance/StepDistance.svelte';
  import StepResult from '../features/result/StepResult.svelte';

  let errorMsg = $state('');

  const stepKeys = ['stepZone', 'stepPeople', 'stepDistance', 'stepPreferences', 'stepResult'];

  let sheetHeight = $state(0);
  let isDragging = $state(false);
  let dragStartY = 0;
  let dragStartHeight = 0;

  const SNAP_COLLAPSED = 130;
  let snapHalf = 400;
  let snapFull = 700;

  onMount(() => {
    updateSnaps();
    if (uiState.isMobile) sheetHeight = snapHalf;
    const onResize = () => { if (uiState.isMobile) updateSnaps(); };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  });

  $effect(() => {
    if (uiState.isMobile) { updateSnaps(); sheetHeight = snapHalf; }
  });

  function updateSnaps() {
    snapHalf = Math.round(window.innerHeight * 0.45);
    snapFull = Math.round(window.innerHeight * 0.85);
  }

  $effect(() => {
    uiState.mobileSheetHeight = uiState.isMobile ? sheetHeight : 0;
    if (uiState.isMobile) {
      document.documentElement.style.setProperty('--sheet-height', `${sheetHeight}px`);
    } else {
      document.documentElement.style.removeProperty('--sheet-height');
    }
  });
  $effect(() => {
    const step = appState.step;
    if (!uiState.isMobile) return;
    if (step === 1 || step === 3) return;
    if (sheetHeight < snapHalf) sheetHeight = snapHalf;
  });

  function onHandleDown(e) {
    if (!uiState.isMobile || e.target.closest('button')) return;
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
    errorMsg = '';
    const error = await generate();
    if (error) errorMsg = error;
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
  {uiState.isMobile && !isDragging ? 'sheet-snap' : ''}"
  style={uiState.isMobile ? `height: ${sheetHeight}px` : ''}
>
  <!-- Header -->
  <div class="px-5 pt-4 pb-2 max-lg:pt-2 shrink-0"
    onpointerdown={onHandleDown}
    onpointermove={onHandleMove}
    onpointerup={onHandleUp}
    onpointercancel={onHandleUp}
    style:touch-action={uiState.isMobile ? 'none' : undefined}
    style:cursor={uiState.isMobile ? (isDragging ? 'grabbing' : 'grab') : undefined}
  >
    <div class="w-10 h-1 bg-ink-4/40 rounded-full mx-auto mb-2 lg:hidden"></div>
    <div class="flex items-center justify-between">
      <h1 class="font-heading text-lg font-bold text-ink tracking-tight">{t('appTitle')}</h1>
    </div>
    <span class="text-[12px] text-ink-3">{zoneState.presetKey ? t(`city.${zoneState.presetKey}`) : zoneState.city.name}</span>
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
          {t('back')}
        </button>
      {:else}
        <span></span>
      {/if}
      {#if appState.step > 0 && appState.step < 4}
        <button class="text-[11px] text-ink-3 hover:text-accent transition-colors font-medium" onclick={restart}>
          {t('restart')}
        </button>
      {/if}
    </div>
    <h2 class="text-[15px] font-bold text-ink mt-1">{t(stepKeys[appState.step])}</h2>
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
      <StepResult onRestart={restart} onRegenerate={handleGenerate} {errorMsg} />
    {/if}
  </div>
</div>

<style>
  :global(.sheet-snap) {
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
