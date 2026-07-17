<script>
  let { onclick, active = false } = $props();
</script>

<button class="close-btn" class:on-active={active} {onclick}>
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
</button>

<style>
  .close-btn {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    color: var(--color-ink-3);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .close-btn:hover {
    color: var(--color-red);
    background: color-mix(in srgb, var(--color-red) 10%, transparent);
  }
  .close-btn.on-active {
    color: rgba(255, 255, 255, 0.7);
    border-color: rgba(255, 255, 255, 0.2);
  }
  .close-btn.on-active:hover {
    color: white;
    background: rgba(255, 255, 255, 0.15);
  }
</style>
