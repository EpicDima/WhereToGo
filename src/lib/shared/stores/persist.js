const STORAGE_KEY = 'where-to-go-settings';

let saved = null;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) saved = JSON.parse(raw);
} catch {}

export { saved };

const slices = [];

export function registerSlice(getState) {
  slices.push(getState);
}

export function save() {
  try {
    const state = {};
    for (const fn of slices) Object.assign(state, fn());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
