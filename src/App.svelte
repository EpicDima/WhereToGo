<script>
  import MapView from './lib/widgets/map/MapView.svelte';
  import Sidebar from './lib/widgets/Sidebar.svelte';
  import ThemeToggle from './lib/widgets/ThemeToggle.svelte';
  import { appState } from './lib/shared/stores/app.svelte.js';
  import { t } from './lib/shared/i18n/index.svelte.js';

  $effect(() => {
    document.title = t('appTitle');
  });
</script>

<div class="relative w-full h-full" class:dark={appState.darkMode}>
  <MapView />
  <Sidebar />
  <ThemeToggle />
</div>
