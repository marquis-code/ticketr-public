<template>
  <div class="space-y-5">
    <!-- Header -->
    <section class="surface p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{{ todayLabel }}</p>
        <h2 class="font-display text-2xl sm:text-3xl font-semibold text-ink mt-1">
          {{ greeting }}, {{ firstName }}.
        </h2>
        <p class="text-[13px] text-muted mt-1">
          <template v-if="pendingPayments.count">
            {{ pendingPayments.count }} payment{{ pendingPayments.count === 1 ? '' : 's' }} waiting for review.
          </template>
          <template v-else-if="upcomingEvents.length">
            Next up: {{ upcomingEvents[0].title }} — {{ countdownLabel(upcomingEvents[0].startDate) }}.
          </template>
          <template v-else>
            Publish an event to start selling tickets.
          </template>
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/admin/events/create" class="btn-primary btn-sm">
          <Plus class="w-4 h-4" /> Create event
        </NuxtLink>
        <NuxtLink to="/admin/orders?tab=review" class="btn-secondary btn-sm">
          <ClipboardCheck class="w-4 h-4" /> Review queue
          <span v-if="pendingPayments.count" class="ml-1 rounded-full bg-coral text-white text-[10px] px-1.5 py-0.5 font-bold">
            {{ pendingPayments.count }}
          </span>
        </NuxtLink>
      </div>
    </section>

    <!-- Error -->
    <div v-if="error" class="surface p-4 border-coral/30 bg-coral/5 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-coral shrink-0 mt-0.5" />
      <div class="min-w-0">
        <p class="text-sm font-semibold text-ink">Dashboard could not fully load</p>
        <p class="text-xs text-muted mt-0.5">{{ error }}</p>
      </div>
      <button class="btn-secondary btn-sm shrink-0 ml-auto" type="button" @click="load">Retry</button>
    </div>

    <!-- KPIs -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <template v-if="loading">
        <div v-for="n in 4" :key="n" class="stat">
          <div class="skeleton h-3 w-20" />
          <div class="skeleton h-8 w-28 mt-2" />
          <div class="skeleton h-3 w-24 mt-2" />
        </div>
      </template>
      <template v-else>
        <div class="stat">
          <p class="stat-label">Gross revenue</p>
          <p class="stat-value">{{ formatCompactMoney(analytics?.totalRevenue) }}</p>
          <p class="text-[11px] text-muted">{{ formatMoney(analytics?.totalRevenue) }} collected</p>
          <p v-if="analytics?.refundedAmount" class="text-[10.5px] text-coral">{{ formatMoney(analytics.refundedAmount) }} refunded</p>
        </div>
        <div class="stat">
          <p class="stat-label">Net payout</p>
          <p class="stat-value">{{ formatCompactMoney(analytics?.netPayout) }}</p>
          <p class="text-[11px] text-muted">After {{ formatMoney(analytics?.platformFees) }} platform fees</p>
        </div>
        <div class="stat">
          <p class="stat-label">Tickets issued</p>
          <p class="stat-value">{{ analytics?.totalTicketsSold || 0 }}</p>
          <p class="text-[11px] text-muted">{{ analytics?.checkedInTickets || 0 }} checked in · {{ analytics?.checkInRate || 0 }}%</p>
        </div>
        <div class="stat">
          <p class="stat-label">Needs review</p>
          <p class="stat-value" :class="pendingPayments.count ? '!text-coral' : ''">{{ pendingPayments.count || 0 }}</p>
          <p class="text-[11px] text-muted">{{ formatMoney(pendingPayments.amount) }} pending</p>
        </div>
      </template>
    </section>

    <div class="grid lg:grid-cols-[1.6fr_1fr] gap-4 sm:gap-5">
      <!-- Revenue chart -->
      <section class="surface p-5 sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Last 30 days</p>
            <h3 class="font-display text-xl font-semibold text-ink mt-0.5">Revenue trend</h3>
          </div>
          <div class="text-right">
            <p class="font-display text-xl font-semibold text-ink">{{ formatCompactMoney(last30Revenue) }}</p>
            <p class="text-[10px] text-muted">{{ last30Orders }} paid order{{ last30Orders === 1 ? '' : 's' }}</p>
          </div>
        </div>

        <div v-if="loading" class="skeleton h-48 mt-5" />
        <div v-else-if="!salesSeries.length" class="h-48 mt-5 rounded-xl border border-dashed border-line flex flex-col items-center justify-center text-center px-4">
          <TrendingUp class="w-6 h-6 text-muted/50" />
          <p class="text-sm font-semibold text-ink mt-2">No paid orders in this window</p>
          <p class="text-xs text-muted">Your revenue trend appears after the first sale.</p>
        </div>
        <div v-else class="mt-5">
          <svg viewBox="0 0 640 180" class="w-full h-44" role="img" aria-label="Revenue over the last 30 days">
            <defs>
              <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#11483A" stop-opacity="0.22" />
                <stop offset="100%" stop-color="#11483A" stop-opacity="0" />
              </linearGradient>
            </defs>
            <line v-for="(tick, i) in 4" :key="i" x1="0" :y1="20 + i * 40" x2="640" :y2="20 + i * 40" stroke="#E4E4DA" stroke-dasharray="3 5" />
            <path :d="areaPath" fill="url(#revenue-fill)" />
            <path :d="linePath" fill="none" stroke="#11483A" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
            <circle
              v-for="(point, index) in chartPoints"
              :key="index"
              :cx="point.x"
              :cy="point.y"
              r="3"
              fill="#F6F5EF"
              stroke="#11483A"
              stroke-width="2"
            >
              <title>{{ formatDate(salesSeries[index]?.date) }} — {{ formatMoney(salesSeries[index]?.revenue) }}</title>
            </circle>
          </svg>
          <div class="flex justify-between text-[10px] font-semibold text-muted mt-1">
            <span>{{ formatDate(salesSeries[0]?.date, { day: 'numeric', month: 'short' }) }}</span>
            <span>{{ formatDate(salesSeries[salesSeries.length - 1]?.date, { day: 'numeric', month: 'short' }) }}</span>
          </div>
        </div>
      </section>

      <!-- Action queue -->
      <section class="surface p-5 sm:p-6 flex flex-col">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Action queue</p>
            <h3 class="font-display text-xl font-semibold text-ink mt-0.5">Payments to verify</h3>
          </div>
          <NuxtLink to="/admin/orders?tab=review" class="text-[11px] font-semibold text-forest hover:underline">View all</NuxtLink>
        </div>

        <div v-if="loading" class="mt-4 space-y-2">
          <div v-for="n in 3" :key="n" class="skeleton h-16" />
        </div>
        <div v-else-if="!reviewOrders.length" class="mt-4 flex-1 rounded-xl border border-dashed border-line flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 class="w-6 h-6 text-forest/60" />
          <p class="text-sm font-semibold text-ink mt-2">Queue is clear</p>
          <p class="text-xs text-muted px-4">No bank transfers are waiting for review.</p>
        </div>
        <div v-else class="mt-4 space-y-2">
          <NuxtLink
            v-for="order in reviewOrders"
            :key="order._id"
            to="/admin/orders?tab=review"
            class="block rounded-xl border border-line p-3 hover:border-ink/25 transition"
          >
            <div class="flex items-center justify-between gap-2">
              <p class="text-[13px] font-semibold text-ink truncate">{{ order.customerName }}</p>
              <span class="text-[13px] font-bold text-ink shrink-0">{{ formatMoney(order.totalAmount) }}</span>
            </div>
            <div class="flex items-center justify-between gap-2 mt-1">
              <p class="text-[11px] text-muted truncate">{{ order.eventId?.title || 'Event' }}</p>
              <span class="mono text-[10px] text-muted shrink-0">{{ relativeTime(order.createdAt) }}</span>
            </div>
          </NuxtLink>
        </div>

        <div class="mt-4 pt-4 border-t border-line">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-muted">Check-in rate</span>
            <span class="font-semibold text-ink">{{ analytics?.checkInRate || 0 }}%</span>
          </div>
          <div class="mt-2 h-2 rounded-full bg-paper overflow-hidden">
            <div class="h-full rounded-full bg-forest" :style="{ width: `${Math.min(100, analytics?.checkInRate || 0)}%` }" />
          </div>
          <div class="flex items-center justify-between text-[11px] mt-3">
            <span class="text-muted">Sell-through</span>
            <span class="font-semibold text-ink">{{ analytics?.sellThrough || 0 }}%</span>
          </div>
          <div class="mt-2 h-2 rounded-full bg-paper overflow-hidden">
            <div class="h-full rounded-full bg-lime" :style="{ width: `${Math.min(100, analytics?.sellThrough || 0)}%` }" />
          </div>
        </div>
      </section>
    </div>

    <div class="grid lg:grid-cols-[1.5fr_1fr] gap-4 sm:gap-5">
      <!-- Recent orders -->
      <section class="surface overflow-hidden">
        <div class="px-5 py-4 border-b border-line flex items-center justify-between gap-3">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Money in</p>
            <h3 class="font-display text-xl font-semibold text-ink mt-0.5">Recent orders</h3>
          </div>
          <NuxtLink to="/admin/orders" class="btn-ghost btn-sm">All orders <ArrowRight class="w-3.5 h-3.5" /></NuxtLink>
        </div>

        <div v-if="loading" class="p-5 space-y-2">
          <div v-for="n in 4" :key="n" class="skeleton h-12" />
        </div>
        <UiEmpty
          v-else-if="!recentOrders.length"
          title="No orders yet"
          message="Paid and pending orders will show up here in real time."
          class="!py-10"
        >
          <template #icon><ReceiptText class="w-6 h-6" /></template>
        </UiEmpty>
        <div v-else class="divide-y divide-line">
          <div v-for="order in recentOrders" :key="order.id" class="px-5 py-3 flex items-center gap-3">
            <span class="w-8 h-8 rounded-full bg-ink text-lime flex items-center justify-center text-[10px] font-bold shrink-0">
              {{ initials(order.customerName) }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-[13px] font-semibold text-ink truncate">{{ order.customerName }}</p>
              <p class="text-[11px] text-muted truncate">{{ order.event?.title || 'Event' }} · {{ relativeTime(order.createdAt) }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-[13px] font-semibold text-ink">{{ formatMoney(order.totalAmount) }}</p>
              <UiBadge :value="order.status" class="!text-[9px] !px-2 !py-0.5 mt-0.5" />
            </div>
          </div>
        </div>
      </section>

      <!-- Upcoming events -->
      <section class="surface p-5 sm:p-6">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Pipeline</p>
            <h3 class="font-display text-xl font-semibold text-ink mt-0.5">Upcoming events</h3>
          </div>
          <NuxtLink to="/admin/events" class="text-[11px] font-semibold text-forest hover:underline">Manage</NuxtLink>
        </div>

        <div v-if="loading" class="mt-4 space-y-2">
          <div v-for="n in 3" :key="n" class="skeleton h-16" />
        </div>
        <UiEmpty
          v-else-if="!upcomingEvents.length"
          title="Nothing on the calendar"
          message="Create an event and publish it to start selling."
          class="!py-8"
        >
          <template #icon><CalendarDays class="w-6 h-6" /></template>
          <template #action>
            <NuxtLink to="/admin/events/create" class="btn-primary btn-sm">Create event</NuxtLink>
          </template>
        </UiEmpty>
        <div v-else class="mt-4 space-y-2.5">
          <NuxtLink
            v-for="event in upcomingEvents"
            :key="event._id"
            :to="`/admin/events/${event._id}/edit`"
            class="flex items-center gap-3 rounded-xl border border-line p-2.5 hover:border-ink/25 transition group"
          >
            <img v-if="event.bannerUrl" :src="event.bannerUrl" alt="" class="w-11 h-11 rounded-lg object-cover border border-line shrink-0" />
            <span v-else class="w-11 h-11 rounded-lg bg-paper border border-line flex items-center justify-center shrink-0">
              <Ticket class="w-4 h-4 text-muted" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-[13px] font-semibold text-ink truncate group-hover:text-forest transition">{{ event.title }}</p>
              <p class="text-[11px] text-muted truncate">{{ formatDate(event.startDate, { day: 'numeric', month: 'short' }) }} · {{ event.location }}</p>
            </div>
            <ArrowUpRight class="w-4 h-4 text-muted shrink-0" />
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Plus,
  ReceiptText,
  Ticket,
  TrendingUp,
} from 'lucide-vue-next';

definePageMeta({ layout: 'admin', middleware: [] });

const { state, hydrate } = useAuth();
const pendingBadge = useState<number>('pending-approvals', () => 0);

const loading = ref(true);
const error = ref('');
const analytics = ref<any>(null);
const eventsData = ref<any[]>([]);
const reviewOrders = ref<any[]>([]);

const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
);
const firstName = computed(() => (state.user?.name || 'there').split(' ')[0]);
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
});

const pendingPayments = computed(() => analytics.value?.pendingPayments || { count: 0, amount: 0 });
const recentOrders = computed(() => analytics.value?.recentOrders || []);
const salesSeries = computed<any[]>(() => analytics.value?.salesOverTime || []);
const upcomingEvents = computed<any[]>(() => analytics.value?.upcomingEvents || []);

const last30Revenue = computed(() => salesSeries.value.reduce((sum, d) => sum + (d.revenue || 0), 0));
const last30Orders = computed(() => salesSeries.value.reduce((sum, d) => sum + (d.orders || 0), 0));

const chartPoints = computed(() => {
  const series = salesSeries.value;
  if (!series.length) return [];
  const max = Math.max(...series.map((d) => Number(d.revenue) || 0), 1);
  const width = 640;
  const height = 160;
  const step = series.length > 1 ? width / (series.length - 1) : width;
  return series.map((point, index) => ({
    x: series.length > 1 ? index * step : width / 2,
    y: 20 + height - ((Number(point.revenue) || 0) / max) * height,
  }));
});

const linePath = computed(() => {
  const points = chartPoints.value;
  if (!points.length) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
});

const areaPath = computed(() => {
  const points = chartPoints.value;
  if (!points.length) return '';
  return `${linePath.value} L${points[points.length - 1].x.toFixed(1)},180 L${points[0].x.toFixed(1)},180 Z`;
});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [analyticsRes, eventsRes, ordersRes] = await Promise.allSettled([
      apiRequest<any>('/analytics/tenant'),
      apiRequest<any>('/events/admin/my-events?limit=5&page=1'),
      apiRequest<any>('/orders/tenant?status=AWAITING_APPROVAL&limit=3&page=1'),
    ]);

    if (analyticsRes.status === 'fulfilled') {
      analytics.value = analyticsRes.value;
    } else {
      error.value = errorMessage(analyticsRes.reason);
    }

    if (eventsRes.status === 'fulfilled') {
      eventsData.value = eventsRes.value?.data || [];
    }

    if (ordersRes.status === 'fulfilled') {
      reviewOrders.value = ordersRes.value?.data || [];
      const stats = ordersRes.value?.metadata?.statistics || {};
      pendingBadge.value = stats.totalPending || reviewOrders.value.length || 0;
      if (!analytics.value) {
        analytics.value = { pendingPayments: { count: stats.totalPending || 0, amount: 0 } };
      }
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  hydrate();
  load();
});

useSeoMeta({ title: 'Overview', robots: 'noindex, nofollow' });
</script>
