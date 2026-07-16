<script>
  import MapView from './lib/widgets/map/MapView.svelte';
  import Sidebar from './lib/widgets/Sidebar.svelte';
  import ThemeToggle from './lib/widgets/ThemeToggle.svelte';
  import { appState } from './lib/shared/stores/app.svelte.js';
</script>

<div class="relative w-full h-full" class:dark={appState.darkMode}>
  <MapView />
  <Sidebar />
  <ThemeToggle />
</div>
