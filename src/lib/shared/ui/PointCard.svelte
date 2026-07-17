<script>
  import CloseButton from './CloseButton.svelte';

  let { variant = 'default', badge = '', name, lat, lng, placeholder = '', onrename, ondelete } = $props();
</script>

<div class="card" class:green={variant === 'green'} class:red={variant === 'red'}>
  {#if badge}<div class="badge" class:badge-green={variant === 'green'} class:badge-red={variant === 'red'}>{badge}</div>{/if}
  <div class="content">
    <input class="name-input" value={name} oninput={(e) => onrename(e.target.value)} {placeholder} />
    <span class="coord">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
  </div>
  <CloseButton onclick={ondelete} />
</div>

<style>
  .card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.75rem;
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--color-border);
  }
  .card.green {
    border-color: rgba(34, 197, 94, 0.25);
    background: rgba(34, 197, 94, 0.05);
  }
  .card.red {
    border-color: rgba(239, 68, 68, 0.25);
    background: rgba(239, 68, 68, 0.05);
  }

  .badge {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: white;
    background: var(--color-accent);
  }
  .badge-green { background: #22c55e; }
  .badge-red { background: #ef4444; }

  .content {
    flex: 1;
    min-width: 0;
  }

  .name-input {
    width: 100%;
    background: transparent;
    font-size: 13px;
    color: var(--color-ink);
    outline: none;
    font-weight: 500;
  }
  .name-input::placeholder {
    color: var(--color-ink-4);
  }

  .coord {
    font-size: 10px;
    color: var(--color-ink-4);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
</style>
