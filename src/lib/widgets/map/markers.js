export function createUserMarkerEl(index, draggable) {
  const el = document.createElement('div');
  el.innerHTML = `<div class="user-marker-dot${draggable ? '' : ' static'}">${index + 1}</div>`;
  return el;
}

export function createAttractionMarkerEl() {
  const el = document.createElement('div');
  el.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" fill="#22C55E" stroke="white" stroke-width="2.5"/>
    <path d="M14 7.5l1.8 4.2h4.5l-3.6 2.8 1.3 4.3L14 16.2l-4 2.6 1.3-4.3-3.6-2.8h4.5z" fill="white"/>
  </svg>`;
  el.style.cursor = 'grab';
  return el;
}

export function createRepulsionMarkerEl() {
  const el = document.createElement('div');
  el.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" fill="#EF4444" stroke="white" stroke-width="2.5"/>
    <path d="M9.5 9.5l9 9M18.5 9.5l-9 9" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
  el.style.cursor = 'grab';
  return el;
}

export function createResultMarkerEl() {
  const el = document.createElement('div');
  el.innerHTML = `<svg width="36" height="44" viewBox="0 0 36 44" fill="none">
    <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" fill="#E8584A"/>
    <circle cx="18" cy="17" r="7" fill="white"/><circle cx="18" cy="17" r="3" fill="#E8584A"/>
  </svg>`;
  el.className = 'result-pin';
  return el;
}
