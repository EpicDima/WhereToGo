const mq = typeof window !== 'undefined' ? window.matchMedia('(max-width: 1023px)') : null;

export const uiState = $state({
  mobileSheetHeight: 0,
  isMobile: mq?.matches ?? false,
});

if (mq) mq.addEventListener('change', (e) => uiState.isMobile = e.matches);
