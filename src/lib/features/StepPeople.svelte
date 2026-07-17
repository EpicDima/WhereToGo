<script>
  import { peopleState, addUserLocation, removeUserLocation, updateUserLocationName } from './people.svelte.js';
  import { t } from '../shared/i18n/index.svelte.js';
  import PointCard from '../shared/ui/PointCard.svelte';

  let { onNext } = $props();
</script>

<div class="space-y-3">
  <p class="text-[12px] text-ink-3">
    {t('peopleHint')}
  </p>

  {#if peopleState.userLocations.length === 0}
    <div class="empty-state">
      <p class="text-[13px] text-ink-3">{t('nobodyYet')}</p>
      <p class="text-[11px] text-ink-4 mt-1">{t('tapMapOrGps')}</p>
    </div>
  {:else}
    <div class="space-y-1.5">
      {#each peopleState.userLocations as loc, i}
        <PointCard
          badge={String(i + 1)}
          name={loc.name}
          lat={loc.lat}
          lng={loc.lng}
          placeholder={t('namePlaceholder')}
          onrename={(v) => updateUserLocationName(i, v)}
          ondelete={() => removeUserLocation(i)}
        />
      {/each}
    </div>
  {/if}

  <button
    class="gps-btn"
    onclick={() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => addUserLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
          () => {}
        );
      }
    }}
  >
    GPS
  </button>

  <button
    class="w-full py-3 rounded-xl text-[14px] font-bold btn-primary active:scale-[0.97] transition-all"
    onclick={onNext}
  >
    {peopleState.userLocations.length === 0 ? t('skip') : t('next')}
  </button>
</div>

<style>
  .empty-state {
    border-radius: 0.75rem;
    border: 1px dashed var(--color-border);
    padding: 1.25rem;
    text-align: center;
  }

  .gps-btn {
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.75rem;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-ink-2);
    border: 1px solid var(--color-border);
    transition: all 0.15s;
  }
  .gps-btn:hover {
    background: var(--color-panel-hover);
  }
</style>
