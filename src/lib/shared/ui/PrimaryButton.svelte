<script>
  let { onclick, disabled = false, children, class: extraClass = '' } = $props();
</script>

<button class="primary-btn {extraClass}" {onclick} {disabled}>
  {@render children()}
</button>

<style>
  .primary-btn {
    width: 100%;
    padding: 0.75rem 0;
    border-radius: 0.75rem;
    font-size: 14px;
    font-weight: 700;
    background: var(--color-btn);
    color: var(--color-btn-text);
    transition: all 0.15s;
  }
  .primary-btn:hover {
    opacity: 0.88;
  }
  .primary-btn:active {
    transform: scale(0.97);
  }
</style>
