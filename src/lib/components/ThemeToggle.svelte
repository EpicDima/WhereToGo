<script>
  import { appState, setThemeMode } from '../stores/app.svelte.js';
  import { t, i18n, setLocale } from '../i18n/index.svelte.js';
</script>

<div class="fixed top-4 right-4 z-30 flex gap-2">
  <button
    class="glass rounded-full border border-border shadow-lg w-9 h-9 flex items-center justify-center text-[12px] font-bold text-ink-3 hover:text-ink hover:bg-panel-hover transition-all uppercase"
    onclick={() => setLocale(i18n.locale === 'ru' ? 'en' : 'ru')}
    title={i18n.locale === 'ru' ? 'Switch to English' : 'Переключить на русский'}
  >
    {i18n.locale === 'ru' ? 'en' : 'ру'}
  </button>
  <div class="glass rounded-full border border-border shadow-lg flex p-1 gap-0.5">
    <button
      class="w-8 h-8 rounded-full flex items-center justify-center transition-all
        {appState.themeMode === 'light' ? 'bg-accent text-white' : 'text-ink-3 hover:text-ink hover:bg-panel-hover'}"
      onclick={() => setThemeMode('light')}
      title={t('themeLight')}
    >
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <circle cx="10" cy="10" r="3"/><path d="M10 3v2M10 15v2M3 10h2M15 10h2M15.5 4.5l-1.5 1.5M4.5 4.5l1.5 1.5M15.5 15.5l-1.5-1.5M4.5 15.5l1.5-1.5"/>
      </svg>
    </button>
    <button
      class="w-8 h-8 rounded-full flex items-center justify-center transition-all
        {appState.themeMode === 'system' ? 'bg-accent text-white' : 'text-ink-3 hover:text-ink hover:bg-panel-hover'}"
      onclick={() => setThemeMode('system')}
      title={t('themeSystem')}
    >
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="3" width="12" height="9" rx="1.5"/><path d="M10 12v3.5M7 15.5h6"/>
      </svg>
    </button>
    <button
      class="w-8 h-8 rounded-full flex items-center justify-center transition-all
        {appState.themeMode === 'dark' ? 'bg-accent text-white' : 'text-ink-3 hover:text-ink hover:bg-panel-hover'}"
      onclick={() => setThemeMode('dark')}
      title={t('themeDark')}
    >
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M17 12.5A7 7 0 1 1 7.5 3a5.5 5.5 0 0 0 9.5 9.5z"/>
      </svg>
    </button>
  </div>
</div>
