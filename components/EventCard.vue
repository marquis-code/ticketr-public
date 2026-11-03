<template>
  <article class="group relative flex flex-col overflow-hidden rounded-[20px] border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
    <NuxtLink :to="link" class="absolute inset-0 z-10" :aria-label="`View ${event.title}`" />

    <div class="relative aspect-[16/10] overflow-hidden bg-ink/5">
      <img
        v-if="event.bannerUrl || event.carouselImages?.[0]"
        :src="event.bannerUrl || event.carouselImages[0]"
        :alt="event.title"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <div v-else class="h-full w-full bg-grid bg-paper flex items-center justify-center">
        <Ticket class="w-10 h-10 text-ink/20" />
      </div>
      <div class="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <span v-if="event.remaining === 0" class="chip-coral !bg-ink !text-paper">Sold out</span>
        <span v-else-if="event.remaining <= 20" class="chip-lime">Few left</span>
        <span v-else class="chip !bg-white/85 backdrop-blur !border-white/40">{{ event.remaining ?? '—' }} left</span>
        <span v-if="event.isPast" class="chip !bg-ink !text-paper">Past event</span>
      </div>
    </div>

    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <div class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
        <span>{{ formatDate(event.startDate, { weekday: 'short', day: 'numeric', month: 'short' }) }}</span>
        <span class="w-1 h-1 rounded-full bg-line-strong" />
        <span>{{ formatTime(event.startDate) }}</span>
      </div>

      <h3 class="font-display text-lg font-semibold leading-snug text-ink mt-2 line-clamp-2 group-hover:text-forest transition-colors">
        {{ event.title }}
      </h3>

      <div class="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
        <MapPin class="w-3.5 h-3.5 shrink-0" />
        <span class="truncate">{{ event.isVirtual ? 'Online event' : event.location }}</span>
      </div>

      <div class="mt-auto pt-4 flex items-end justify-between gap-3">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">From</p>
          <p class="font-display text-xl font-semibold text-ink">{{ fromPrice }}</p>
        </div>
        <span class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          Get tickets
          <ArrowUpRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>

      <div v-if="event.organizer" class="mt-3 pt-3 border-t border-line flex items-center gap-2">
        <img v-if="event.organizer.logoUrl" :src="event.organizer.logoUrl" alt="" class="w-5 h-5 rounded object-cover" />
        <span class="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted truncate">
          {{ event.organizer.name }}
        </span>
        <ShieldCheck class="w-3.5 h-3.5 text-forest ml-auto shrink-0" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ArrowUpRight, MapPin, ShieldCheck, Ticket } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    event: any;
    tenantSlug?: string | null;
  }>(),
  { tenantSlug: null },
);

const link = computed(() => {
  const tenant = props.tenantSlug || props.event.tenant?.slug || props.event.organizer?.slug;
  return tenant ? `/event/${props.event.slug}?tenant=${tenant}` : `/event/${props.event.slug}`;
});

const fromPrice = computed(() => {
  const tiers = props.event.tiers || [];
  if (!tiers.length) return '—';
  const lowest = Math.min(...tiers.map((t: any) => Number(t.price) || 0));
  return lowest === 0 ? 'Free' : formatMoney(lowest);
});
</script>
