<script>
  import { appState, setThemeMode } from '../stores/app.svelte.js';
  import { t, i18n, setLocale } from '../i18n/index.svelte.js';

  const themeCycle = ['system', 'light', 'dark'];

  function cycleTheme() {
    const i = themeCycle.indexOf(appState.themeMode);
    setThemeMode(themeCycle[(i + 1) % themeCycle.length]);
  }

  const themeIcons = {
    system: '<rect x="4" y="3" width="12" height="9" rx="1.5"/><path d="M10 12v3.5M7 15.5h6"/>',
    light: '<circle cx="10" cy="10" r="3"/><path d="M10 3v2M10 15v2M3 10h2M15 10h2M15.5 4.5l-1.5 1.5M4.5 4.5l1.5 1.5M15.5 15.5l-1.5-1.5M4.5 15.5l1.5-1.5"/>',
    dark: '<path d="M17 12.5A7 7 0 1 1 7.5 3a5.5 5.5 0 0 0 9.5 9.5z"/>',
  };
  const themeKeys = { system: 'themeSystem', light: 'themeLight', dark: 'themeDark' };
</script>

<div class="fixed top-4 right-4 z-30 flex gap-1.5">
  <button
    class="glass rounded-full border border-border shadow-lg w-10 h-10 flex items-center justify-center text-[12px] font-bold transition-all text-ink-3 hover:text-ink hover:bg-panel-hover uppercase"
    onclick={() => setLocale(i18n.locale === 'ru' ? 'en' : 'ru')}
    title={t('switchLang')}
  >
    {i18n.locale === 'ru' ? 'en' : 'ру'}
  </button>
  <button
    class="glass rounded-full border border-border shadow-lg w-10 h-10 flex items-center justify-center transition-all text-ink-3 hover:text-ink hover:bg-panel-hover"
    onclick={cycleTheme}
    title={t(themeKeys[appState.themeMode])}
  >
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      {@html themeIcons[appState.themeMode]}
    </svg>
  </button>
</div>
