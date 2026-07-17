import { saved, registerSlice, save } from './persist.js';

export const appState = $state({
  step: Math.min(saved?.step ?? 0, 3),
  themeMode: saved?.themeMode ?? 'system',
  darkMode: saved?.themeMode === 'dark' || (saved?.themeMode !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches),
  generatedPoint: null,
  isGenerating: false,
});

registerSlice(() => ({
  step: appState.step,
  themeMode: appState.themeMode,
}));

export function nextStep() {
  appState.step = Math.min(appState.step + 1, 4);
  save();
}

export function prevStep() {
  if (appState.step === 4) appState.generatedPoint = null;
  appState.step = Math.max(appState.step - 1, 0);
  save();
}

export function restart() {
  appState.generatedPoint = null;
  appState.step = 0;
  save();
}

export function clearResult() {
  appState.generatedPoint = null;
}

const systemThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
systemThemeMq.addEventListener('change', (e) => {
  if (appState.themeMode === 'system') appState.darkMode = e.matches;
});

export function setThemeMode(mode) {
  appState.themeMode = mode;
  appState.darkMode = mode === 'system' ? systemThemeMq.matches : mode === 'dark';
  save();
}
