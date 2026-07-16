<script>
  let { active = false, onclick, children } = $props();
</script>

<button class="chip" class:active {onclick}>
  {@render children()}
</button>

<style>
  .chip {
    padding: 6px 10px;
    border-radius: 0.5rem;
    font-size: 11px;
    font-weight: 500;
    border: 1px solid var(--color-border);
    transition: all 0.15s;
    color: var(--color-ink);
  }
  .chip:hover {
    background: var(--color-panel-hover);
  }
  .chip.active {
    background: var(--color-accent);
    color: white;
    border-color: transparent;
    box-shadow: 0 1px 3px var(--color-accent-glow);
  }
  .chip.active:hover {
    background: var(--color-accent);
  }
</style>
