<script>
  import { peopleState, addUserLocation, removeUserLocation, updateUserLocationName } from './store.svelte.js';
  import { t } from '../../shared/i18n/index.svelte.js';
  import PointCard from '../../shared/ui/PointCard.svelte';
  import SecondaryButton from '../../shared/ui/SecondaryButton.svelte';

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

  <SecondaryButton
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
  </SecondaryButton>

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

</style>
