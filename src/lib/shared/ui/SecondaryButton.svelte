<script>
  let { onclick, disabled = false, children } = $props();
</script>

<button class="secondary-btn" {onclick} {disabled}>
  {@render children()}
</button>

<style>
  .secondary-btn {
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.75rem;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-ink-2);
    border: 1px solid var(--color-border);
    transition: all 0.15s;
  }
  .secondary-btn:hover {
    background: var(--color-panel-hover);
  }
</style>
