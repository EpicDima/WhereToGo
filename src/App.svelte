<script>
  import MapView from './lib/components/MapView.svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import ThemeToggle from './lib/components/ThemeToggle.svelte';
  import { appState } from './lib/stores/app.svelte.js';
</script>

<div class="relative w-full h-full" class:dark={appState.darkMode}>
  <MapView />
  <Sidebar />
  <ThemeToggle />
</div>
