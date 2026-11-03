<template>
  <div class="bg-paper">
    <!-- ============================= HERO ============================= -->
    <section class="relative overflow-hidden border-b border-line">
      <div class="absolute inset-0 bg-grid opacity-70 pointer-events-none" />
      <div class="absolute -top-40 -right-24 w-[520px] h-[520px] rounded-full bg-lime/25 blur-[120px] pointer-events-none" />

      <div class="shell relative pt-12 pb-14 sm:pt-16 sm:pb-20">
        <div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          <div class="animate-float-in">
            <span class="chip-ink !py-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
              {{ tenant ? `${tenant.name} · Official storefront` : 'Verified ticketing' }}
            </span>

            <h1 class="mt-5 font-display text-[2.6rem] leading-[0.98] sm:text-6xl lg:text-[4.2rem] font-semibold tracking-[-0.04em] text-ink">
              <template v-if="tenant">
                Get into<br />
                <span class="italic text-forest">{{ tenant.name }}</span><br />
                events.
              </template>
              <template v-else>
                Live events,<br />
                <span class="relative inline-block">
                  honestly
                  <span class="absolute left-0 -bottom-1.5 h-[7px] w-full bg-lime rounded-full -z-10" />
                </span><br />
                ticketed.
              </template>
            </h1>

            <p class="mt-5 text-[15px] sm:text-base text-muted max-w-md leading-relaxed">
              <template v-if="tenant">
                Official tickets for {{ tenant.name }}. One QR per seat, face-value resale, and a private wallet that always has your pass.
              </template>
              <template v-else>
                A ticketing platform where every pass is single-use, every price is transparent, and resale is capped at face value. No screenshots, no fake fees.
              </template>
            </p>

            <div class="mt-7 flex flex-col sm:flex-row gap-2.5 max-w-lg">
              <div class="relative flex-1">
                <Search class="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  v-model="searchInput"
                  type="search"
                  placeholder="Search events, venues, campuses"
                  aria-label="Search events"
                  class="input !rounded-full !pl-11 !py-3.5 shadow-card"
                  @keyup.enter="applySearch"
                />
              </div>
              <button class="btn-primary !rounded-full px-6" type="button" @click="applySearch">
                Find tickets
              </button>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-semibold text-ink/65">
              <span class="flex items-center gap-1.5"><ShieldCheck class="w-4 h-4 text-forest" /> Single-use QR</span>
              <span class="flex items-center gap-1.5"><RefreshCcw class="w-4 h-4 text-forest" /> Face-value resale</span>
              <span class="flex items-center gap-1.5"><Wallet class="w-4 h-4 text-forest" /> Private wallet</span>
            </div>
          </div>

          <!-- Featured event card -->
          <div v-if="featured" class="relative animate-float-in" style="animation-delay: 90ms">
            <NuxtLink
              :to="eventLink(featured)"
              class="group block relative rounded-[26px] overflow-hidden border border-line bg-white shadow-pop"
            >
              <div class="relative aspect-[4/3] overflow-hidden bg-ink/5">
                <img
                  v-if="featured.bannerUrl || featured.carouselImages?.[0]"
                  :src="featured.bannerUrl || featured.carouselImages[0]"
                  :alt="featured.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div v-else class="w-full h-full bg-grid bg-paper flex items-center justify-center">
                  <Ticket class="w-12 h-12 text-ink/20" />
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                <div class="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-paper">
                  <div class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-paper/80">
                    <CalendarDays class="w-3.5 h-3.5" />
                    {{ formatDate(featured.startDate, { weekday: 'short', day: 'numeric', month: 'short' }) }}
                    <span class="w-1 h-1 rounded-full bg-paper/40" />
                    {{ formatTime(featured.startDate) }}
                  </div>
                  <h2 class="font-display text-2xl sm:text-3xl font-semibold leading-tight mt-2 line-clamp-2">
                    {{ featured.title }}
                  </h2>
                  <div class="mt-3 flex items-center justify-between gap-3">
                    <span class="text-[13px] text-paper/80 flex items-center gap-1.5 min-w-0">
                      <MapPin class="w-3.5 h-3.5 shrink-0" />
                      <span class="truncate">{{ featured.isVirtual ? 'Online' : featured.location }}</span>
                    </span>
                    <span class="chip-lime !text-[10px]">{{ fromPrice(featured) }}</span>
                  </div>
                </div>
              </div>
            </NuxtLink>

            <div class="absolute -left-3 -bottom-4 sm:-left-5 sm:-bottom-5 bg-white border border-line rounded-2xl shadow-lift px-4 py-3 flex items-center gap-3 max-w-[240px]">
              <span class="w-9 h-9 rounded-xl bg-lime flex items-center justify-center shrink-0">
                <ScanLine class="w-4 h-4 text-ink" />
              </span>
              <div class="min-w-0">
                <p class="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Gate verified</p>
                <p class="text-[13px] font-semibold text-ink leading-tight">
                  {{ featured.remaining ?? 0 }} seats left
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================= EVENTS ============================= -->
    <section id="events" class="shell py-12 sm:py-16 scroll-mt-24">
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">Now on sale</p>
          <h2 class="font-display text-3xl sm:text-4xl font-semibold text-ink mt-1.5">
            {{ tenant ? 'Upcoming at ' + tenant.name : 'Upcoming events' }}
          </h2>
          <p class="text-sm text-muted mt-2">
            {{ resultLabel }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="tag in visibleTags"
            :key="tag"
            type="button"
            class="chip transition"
            :class="activeTag === tag ? '!bg-ink !text-paper !border-ink' : 'hover:!border-ink/30'"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
          <button
            type="button"
            class="chip transition"
            :class="includePast ? '!bg-ink !text-paper !border-ink' : 'hover:!border-ink/30'"
            @click="includePast = !includePast"
          >
            Include past
          </button>
        </div>
      </div>

      <div v-if="pending">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="n in 6" :key="n" class="surface overflow-hidden">
            <div class="skeleton aspect-[16/10] !rounded-none" />
            <div class="p-5 space-y-3">
              <div class="skeleton h-3 w-1/3" />
              <div class="skeleton h-5 w-4/5" />
              <div class="skeleton h-3 w-2/3" />
              <div class="skeleton h-10 w-full !rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="surface p-8 sm:p-12 text-center max-w-lg mx-auto">
        <span class="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mx-auto mb-4">
          <WifiOff class="w-6 h-6" />
        </span>
        <h3 class="font-display text-xl font-semibold text-ink">We couldn’t load events</h3>
        <p class="text-sm text-muted mt-2">{{ errorMessage(error?.value ?? error) }}</p>
        <button class="btn-primary btn-sm mt-5" type="button" @click="refresh()">Try again</button>
      </div>

      <UiEmpty
        v-else-if="!events.length"
        :title="searchQuery ? 'No events match that search' : 'No events on sale yet'"
        :message="searchQuery ? 'Try a different keyword or clear your filters.' : 'New events will appear here as soon as organizers publish them.'"
      >
        <template #icon><CalendarX class="w-6 h-6" /></template>
        <template #action>
          <button v-if="searchQuery || activeTag" class="btn-secondary btn-sm" type="button" @click="clearFilters">
            Clear filters
          </button>
        </template>
      </UiEmpty>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <EventCard v-for="event in events" :key="event._id" :event="event" :tenant-slug="tenantSlug" />
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-10">
        <button class="btn-secondary btn-sm" :disabled="page <= 1" type="button" @click="changePage(page - 1)">
          <ArrowLeft class="w-4 h-4" /> Previous
        </button>
        <span class="px-3 text-[13px] font-semibold text-muted">Page {{ page }} of {{ totalPages }}</span>
        <button class="btn-secondary btn-sm" :disabled="page >= totalPages" type="button" @click="changePage(page + 1)">
          Next <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </section>

    <!-- ============================= TRUST ============================= -->
    <section id="trust" class="border-y border-line bg-white scroll-mt-24">
      <div class="shell py-14 sm:py-20">
        <div class="max-w-2xl">
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">The problem we fix</p>
          <h2 class="font-display text-3xl sm:text-4xl font-semibold text-ink mt-2">
            Ticketing leaks trust at four points. We close all four.
          </h2>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-9">
          <article v-for="(pillar, i) in pillars" :key="pillar.title" class="surface p-5 sm:p-6 flex flex-col">
            <div class="flex items-center justify-between">
              <span class="w-10 h-10 rounded-xl bg-paper border border-line flex items-center justify-center text-forest">
                <component :is="pillar.icon" class="w-5 h-5" />
              </span>
              <span class="font-display text-3xl font-semibold text-line-strong">0{{ i + 1 }}</span>
            </div>
            <h3 class="font-display text-lg font-semibold text-ink mt-4">{{ pillar.title }}</h3>
            <p class="text-[13.5px] leading-relaxed text-muted mt-2">{{ pillar.body }}</p>
          </article>
        </div>

        <div class="mt-5 surface overflow-hidden">
          <div class="grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch">
            <div v-for="(step, i) in steps" :key="step.title" class="p-5 sm:p-6 relative">
              <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Step {{ i + 1 }}</p>
              <h4 class="font-display text-base font-semibold text-ink mt-1">{{ step.title }}</h4>
              <p class="text-[13px] text-muted mt-1.5 leading-relaxed">{{ step.body }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================= HOW / PRICING ============================= -->
    <section id="how-it-works" class="shell py-14 sm:py-20 scroll-mt-24">
      <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">For organizers</p>
          <h2 class="font-display text-3xl sm:text-4xl font-semibold text-ink mt-2 leading-tight">
            Sell out the room.<br />Keep the record straight.
          </h2>
          <p class="text-[15px] text-muted mt-4 max-w-md leading-relaxed">
            Live sales, honest inventory, an approval queue for bank transfers, and a gate scanner that refuses duplicates. Your revenue and your attendees, reconciled in one place.
          </p>

          <ul class="mt-6 space-y-3">
            <li v-for="item in organizerPoints" :key="item" class="flex items-start gap-3">
              <span class="w-5 h-5 rounded-full bg-lime flex items-center justify-center shrink-0 mt-0.5">
                <Check class="w-3 h-3 text-ink" />
              </span>
              <span class="text-sm text-ink/80">{{ item }}</span>
            </li>
          </ul>

          <div class="flex flex-wrap gap-2.5 mt-7">
            <NuxtLink :to="`${adminUrl}/signup`" class="btn-primary">
              Start selling <ArrowUpRight class="w-4 h-4" />
            </NuxtLink>
            <NuxtLink :to="adminUrl" class="btn-secondary">Open organizer console</NuxtLink>
          </div>
        </div>

        <!-- Console preview -->
        <div id="pricing" class="surface-ink p-4 sm:p-6 relative overflow-hidden scroll-mt-24">
          <div class="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-lime/20 blur-[80px]" />
          <div class="relative">
            <div class="flex items-center justify-between border-b border-white/10 pb-4">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-lime flex items-center justify-center">
                  <Ticket class="w-4 h-4 text-ink" />
                </span>
                <div>
                  <p class="text-[10px] uppercase tracking-[0.16em] text-paper/50 font-bold">Live event pulse</p>
                  <p class="text-sm font-semibold text-paper">Dinner & Awards Night</p>
                </div>
              </div>
              <span class="chip-lime !text-[10px]">Selling now</span>
            </div>

            <div class="grid grid-cols-3 gap-3 mt-4">
              <div class="rounded-xl bg-white/[0.06] border border-white/10 p-3">
                <p class="text-[9px] uppercase tracking-[0.14em] text-paper/50 font-bold">Gross</p>
                <p class="font-display text-lg font-semibold text-paper mt-1">₦4.82m</p>
              </div>
              <div class="rounded-xl bg-white/[0.06] border border-white/10 p-3">
                <p class="text-[9px] uppercase tracking-[0.14em] text-paper/50 font-bold">Sold</p>
                <p class="font-display text-lg font-semibold text-paper mt-1">612</p>
              </div>
              <div class="rounded-xl bg-white/[0.06] border border-white/10 p-3">
                <p class="text-[9px] uppercase tracking-[0.14em] text-paper/50 font-bold">Checked in</p>
                <p class="font-display text-lg font-semibold text-paper mt-1">78%</p>
              </div>
            </div>

            <div class="mt-4 rounded-xl bg-white/[0.06] border border-white/10 p-4">
              <div class="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-paper/50 font-bold">
                <span>Sell-through</span><span>88%</span>
              </div>
              <div class="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                <div class="h-full w-[88%] rounded-full bg-lime" />
              </div>
              <div class="grid grid-cols-2 gap-3 mt-4 text-[12px]">
                <div class="flex items-center justify-between"><span class="text-paper/60">VVIP</span><span class="text-paper font-semibold">120/120</span></div>
                <div class="flex items-center justify-between"><span class="text-paper/60">VIP</span><span class="text-paper font-semibold">340/400</span></div>
                <div class="flex items-center justify-between"><span class="text-paper/60">Regular</span><span class="text-paper font-semibold">152/200</span></div>
                <div class="flex items-center justify-between"><span class="text-paper/60">Tables</span><span class="text-paper font-semibold">18/24</span></div>
              </div>
            </div>

            <div class="mt-4 flex items-center gap-2 text-[11px] text-paper/60">
              <ShieldCheck class="w-4 h-4 text-lime" />
              <span>Inventory reconciled · 0 double scans · 0 orphaned payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================= CTA ============================= -->
    <section class="shell pb-16 sm:pb-24">
      <div class="relative overflow-hidden rounded-[26px] bg-lime px-6 py-10 sm:px-12 sm:py-14">
        <div class="absolute inset-0 bg-grid opacity-40" />
        <div class="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 class="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight max-w-lg">
              Bring your next event to a platform that respects the ticket.
            </h2>
            <p class="text-sm text-ink/70 mt-3 max-w-md">
              Set up in minutes. Transparent fees. Live reconciliation. No spreadsheet archaeology after the gate closes.
            </p>
          </div>
          <div class="flex flex-wrap gap-2.5">
            <NuxtLink :to="`${adminUrl}/signup`" class="btn-primary">Create your event</NuxtLink>
            <NuxtLink to="/my-tickets" class="btn-secondary !bg-white/60">Find my tickets</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CalendarX,
  Check,
  MapPin,
  RefreshCcw,
  ScanLine,
  Search,
  ShieldCheck,
  Ticket,
  Wallet,
  WifiOff,
  LockKeyhole,
  ReceiptText,
  Users,
} from 'lucide-vue-next';

definePageMeta({ layout: 'default' });

const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();
const reqUrl = useRequestURL();

const adminUrl = computed(() => {
  const configured = String(config.public.adminUrl || '');
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (isLocal && !configured.includes(host)) return '/admin';
  }
  return configured || '/admin';
});

const tenantSlug = computed(() => {
  if (typeof route.query.tenant === 'string' && route.query.tenant) return route.query.tenant;
  const host = reqUrl.hostname;
  if (host && host !== 'localhost' && host !== '127.0.0.1' && !/^\d+\./.test(host)) {
    const parts = host.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'admin' && !parts[0].startsWith('admin-')) {
      return parts[0];
    }
  }
  return null;
});

const page = ref(1);
const limit = 12;
const activeTag = ref('');
const includePast = ref(false);
const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '');
const searchInput = ref(searchQuery.value);

const apiUrl = computed(() => {
  const params = new URLSearchParams({
    page: String(page.value),
    limit: String(limit),
    includePast: String(includePast.value),
  });
  if (searchQuery.value) params.set('search', searchQuery.value);
  if (activeTag.value) params.set('tag', activeTag.value);

  return tenantSlug.value
    ? `${config.public.apiBase}/events/tenant/${tenantSlug.value}?${params.toString()}`
    : `${config.public.apiBase}/events/public/all?${params.toString()}`;
});

const { data, pending, error, refresh } = await useFetch<any>(apiUrl, {
  key: `storefront-${tenantSlug.value || 'global'}`,
  watch: [page, activeTag, includePast, searchQuery],
});

const tenant = computed(() => data.value?.tenant || null);
const events = computed<any[]>(() => data.value?.events?.data || []);
const metadata = computed(() => data.value?.events?.metadata || {});
const totalPages = computed(() => Math.max(1, metadata.value.lastPage || 1));
const featured = computed(() => events.value.find((event: any) => event.bannerUrl || event.carouselImages?.length) || events.value[0] || null);

const tags = computed<string[]>(() => {
  const apiTags = metadata.value.tags || [];
  if (apiTags.length) return apiTags.slice(0, 7);
  const fromEvents = new Set<string>();
  events.value.forEach((event: any) => (event.tags || []).forEach((tag: string) => fromEvents.add(tag)));
  return Array.from(fromEvents).slice(0, 7);
});

const visibleTags = computed(() => tags.value);

const resultLabel = computed(() => {
  const total = metadata.value.total ?? events.value.length;
  if (searchQuery.value) return `${total} result${total === 1 ? '' : 's'} for “${searchQuery.value}”`;
  if (activeTag.value) return `${total} event${total === 1 ? '' : 's'} tagged ${activeTag.value}`;
  return `${total} event${total === 1 ? '' : 's'} on sale${tenant.value ? ` at ${tenant.value.name}` : ''}`;
});

function eventLink(event: any) {
  const slug = tenantSlug.value || event.tenant?.slug || event.organizer?.slug;
  return slug ? `/event/${event.slug}?tenant=${slug}` : `/event/${event.slug}`;
}

function fromPrice(event: any) {
  const tiers = event.tiers || [];
  if (!tiers.length) return 'See prices';
  const lowest = Math.min(...tiers.map((t: any) => Number(t.price) || 0));
  return lowest === 0 ? 'Free entry' : `From ${formatMoney(lowest)}`;
}

function applySearch() {
  searchQuery.value = searchInput.value.trim();
  page.value = 1;
}

function toggleTag(tag: string) {
  activeTag.value = activeTag.value === tag ? '' : tag;
  page.value = 1;
}

function clearFilters() {
  activeTag.value = '';
  searchQuery.value = '';
  searchInput.value = '';
  includePast.value = false;
  page.value = 1;
}

function changePage(next: number) {
  if (next < 1 || next > totalPages.value) return;
  page.value = next;
  if (typeof document !== 'undefined') {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

watch(
  () => route.query.q,
  (q) => {
    if (typeof q === 'string' && q !== searchQuery.value) {
      searchQuery.value = q;
      searchInput.value = q;
      page.value = 1;
    }
  },
);

const pillars = [
  {
    icon: ScanLine,
    title: 'Counterfeit entry',
    body: 'Every pass carries a unique server-signed QR. Check-in is atomic, so a screenshot can never be admitted twice.',
  },
  {
    icon: RefreshCcw,
    title: 'Scalped resale',
    body: 'Transfers rotate the QR and invalidate the old one. Resale is listed in-platform and capped at face value.',
  },
  {
    icon: ReceiptText,
    title: 'Hidden fees',
    body: 'The price you see is the price you pay. Platform fees are itemised before payment — never bolted on at the gateway.',
  },
  {
    icon: LockKeyhole,
    title: 'Leaked tickets',
    body: 'Tickets live behind a private wallet link sent only to the buyer. Public email lookups reveal nothing.',
  },
];

const steps = [
  { title: 'Pick your seat', body: 'Live availability from issued tickets and active holds.' },
  { title: 'Pay transparently', body: 'Card or verified bank transfer, with an itemised total.' },
  { title: 'Scan once', body: 'One QR, one entry. Duplicates are refused at the gate.' },
];

const organizerPoints = [
  'Live inventory that accounts for holds, couples and tables',
  'Manual-transfer approvals with duplicate bank-reference checks',
  'A scanner that works offline and syncs when the network returns',
  'Revenue, fees, payouts and attendance in one quiet dashboard',
];

useSeoMeta({
  title: computed(() => (tenant.value ? `${tenant.value.name} tickets | Ticketr` : 'Ticketr — live events, honestly ticketed')),
  description: computed(() =>
    tenant.value
      ? `Official tickets for ${tenant.value.name}. Verified QR entry, transparent pricing and face-value resale.`
      : 'Discover live events with verified single-use tickets, transparent fees and face-value resale.',
  ),
  ogTitle: computed(() => (tenant.value ? `${tenant.value.name} tickets` : 'Ticketr — live events, honestly ticketed')),
  ogDescription: 'Verified QR entry, transparent pricing and face-value resale.',
  ogImage: computed(() => featured.value?.bannerUrl || tenant.value?.logoUrl || undefined),
  twitterCard: 'summary_large_image',
});
</script>
