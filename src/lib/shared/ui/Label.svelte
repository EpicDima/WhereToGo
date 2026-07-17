<script>
  let { color, children } = $props();
</script>

<span class="label" class:color-green={color === 'green'} class:color-red={color === 'red'}>
  {@render children()}
</span>

<style>
  .label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-ink-3);
    margin-bottom: 0.5rem;
  }
  .label.color-green { color: #22c55e; }
  .label.color-red { color: #ef4444; }
</style>
