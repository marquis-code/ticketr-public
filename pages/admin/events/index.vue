<template>
  <div class="space-y-5">
    <!-- Toolbar -->
    <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div class="flex flex-1 flex-col sm:flex-row gap-2">
        <div class="relative flex-1">
          <Search class="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="search"
            type="search"
            placeholder="Search events by title, venue or tag"
            aria-label="Search events"
            class="input !pl-10 !py-2.5"
          />
        </div>
        <select v-model="statusFilter" class="input sm:w-44 !py-2.5" aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <NuxtLink to="/admin/events/create" class="btn-primary shrink-0">
        <Plus class="w-4 h-4" /> Create event
      </NuxtLink>
    </section>

    <!-- Summary -->
    <section class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="stat !py-4">
        <p class="stat-label">Events</p>
        <p class="font-display text-2xl font-semibold text-ink">{{ total }}</p>
      </div>
      <div class="stat !py-4">
        <p class="stat-label">Published</p>
        <p class="font-display text-2xl font-semibold text-ink">{{ statistics.activeEvents || 0 }}</p>
      </div>
      <div class="stat !py-4">
        <p class="stat-label">Tickets sold</p>
        <p class="font-display text-2xl font-semibold text-ink">{{ totalSold.toLocaleString() }}</p>
      </div>
      <div class="stat !py-4">
        <p class="stat-label">Revenue</p>
        <p class="font-display text-2xl font-semibold text-ink">{{ formatCompactMoney(totalRevenue) }}</p>
      </div>
    </section>

    <!-- Error -->
    <div v-if="error" class="surface p-4 border-coral/30 bg-coral/5 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-coral shrink-0 mt-0.5" />
      <p class="text-sm text-ink flex-1">{{ error }}</p>
      <button class="btn-secondary btn-sm" type="button" @click="load">Retry</button>
    </div>

    <!-- Table -->
    <section class="table-wrap">
      <div v-if="loading" class="p-5 space-y-3">
        <div v-for="n in 5" :key="n" class="skeleton h-14" />
      </div>

      <UiEmpty
        v-else-if="!filteredEvents.length"
        :title="search ? 'No events match that search' : 'No events yet'"
        :message="search ? 'Try a shorter keyword or clear the filter.' : 'Create your first event to start selling tickets.'"
        class="!py-12"
      >
        <template #icon><CalendarX class="w-6 h-6" /></template>
        <template #action>
          <NuxtLink v-if="!search" to="/admin/events/create" class="btn-primary btn-sm">Create event</NuxtLink>
          <button v-else class="btn-secondary btn-sm" type="button" @click="search = ''">Clear search</button>
        </template>
      </UiEmpty>

      <table v-else class="table min-w-[820px]">
        <thead>
          <tr>
            <th>Event</th>
            <th>Date</th>
            <th>Sold</th>
            <th>Revenue</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in filteredEvents" :key="event._id">
            <td>
              <div class="flex items-center gap-3 min-w-0">
                <img v-if="event.bannerUrl" :src="event.bannerUrl" alt="" class="w-11 h-11 rounded-lg object-cover border border-line shrink-0" />
                <span v-else class="w-11 h-11 rounded-lg bg-paper border border-line flex items-center justify-center shrink-0">
                  <Ticket class="w-4 h-4 text-muted" />
                </span>
                <div class="min-w-0">
                  <NuxtLink :to="`/admin/events/${event._id}/edit`" class="font-semibold text-ink hover:text-forest transition truncate block max-w-[260px]">
                    {{ event.title }}
                  </NuxtLink>
                  <p class="text-[11px] text-muted truncate max-w-[260px]">{{ event.location }}</p>
                </div>
              </div>
            </td>
            <td class="whitespace-nowrap">
              <p class="text-[13px] font-medium text-ink">{{ formatDate(event.startDate, { day: 'numeric', month: 'short' }) }}</p>
              <p class="text-[11px] text-muted">{{ formatTime(event.startDate) }}</p>
            </td>
            <td class="min-w-[140px]">
              <div class="flex items-center justify-between text-[11px] mb-1">
                <span class="font-semibold text-ink">{{ event.totalSold || 0 }}</span>
                <span class="text-muted">/ {{ event.totalCapacity || 0 }}</span>
              </div>
              <div class="h-1.5 rounded-full bg-paper overflow-hidden">
                <div class="h-full rounded-full" :class="sellThrough(event) > 85 ? 'bg-coral' : 'bg-forest'" :style="{ width: `${sellThrough(event)}%` }" />
              </div>
            </td>
            <td class="whitespace-nowrap">
              <p class="text-[13px] font-semibold text-ink">{{ formatMoney(event.revenue) }}</p>
              <p class="text-[11px] text-muted">{{ event.orderCount || 0 }} orders</p>
            </td>
            <td><UiBadge :value="event.status" dot /></td>
            <td>
              <div class="flex items-center justify-end gap-1">
                <NuxtLink :to="`/admin/events/${event._id}/attendees`" class="btn-ghost btn-sm" title="Attendees">
                  <Users class="w-4 h-4" />
                </NuxtLink>
                <NuxtLink :to="`/admin/scanner?eventId=${event._id}`" class="btn-ghost btn-sm" title="Open scanner">
                  <ScanLine class="w-4 h-4" />
                </NuxtLink>
                <NuxtLink :to="`/admin/events/${event._id}/edit`" class="btn-ghost btn-sm" title="Edit event">
                  <Pencil class="w-4 h-4" />
                </NuxtLink>
                <button class="btn-ghost btn-sm text-coral hover:bg-coral/5" type="button" title="Delete event" @click="askDelete(event)">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Pagination -->
    <div v-if="lastPage > 1" class="flex items-center justify-between gap-3">
      <p class="text-[12px] text-muted">Page {{ page }} of {{ lastPage }} · {{ total }} events</p>
      <div class="flex gap-2">
        <button class="btn-secondary btn-sm" type="button" :disabled="page <= 1" @click="changePage(page - 1)">Previous</button>
        <button class="btn-secondary btn-sm" type="button" :disabled="page >= lastPage" @click="changePage(page + 1)">Next</button>
      </div>
    </div>

    <!-- Delete modal -->
    <UiModal :open="!!deleteTarget" title="Delete this event?" eyebrow="Irreversible" size="sm" @close="deleteTarget = null">
      <p class="text-sm text-muted leading-relaxed">
        <strong class="text-ink">{{ deleteTarget?.title }}</strong> will be removed with its ticket tiers.
      </p>
      <div class="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-[12px] text-amber-900 leading-relaxed">
        Events with issued tickets or payments cannot be deleted — cancel them instead so the financial ledger stays intact.
      </div>
      <p v-if="deleteError" class="field-error mt-3">{{ deleteError }}</p>
      <template #footer>
        <button class="btn-danger" type="button" :disabled="deleting" @click="confirmDelete">
          {{ deleting ? 'Deleting…' : 'Delete event' }}
        </button>
        <button class="btn-secondary" type="button" @click="deleteTarget = null">Keep event</button>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, CalendarX, Pencil, Plus, ScanLine, Search, Ticket, Trash2, Users } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const loading = ref(true);
const error = ref('');
const events = ref<any[]>([]);
const total = ref(0);
const lastPage = ref(1);
const page = ref(1);
const limit = 15;
const search = ref('');
const statusFilter = ref('ALL');

const deleteTarget = ref<any>(null);
const deleting = ref(false);
const deleteError = ref('');

const statistics = ref<any>({});
const totalSold = computed(() => events.value.reduce((sum, event) => sum + (event.totalSold || 0), 0));
const totalRevenue = computed(() => events.value.reduce((sum, event) => sum + (event.revenue || 0), 0));

const filteredEvents = computed(() =>
  statusFilter.value === 'ALL'
    ? events.value
    : events.value.filter((event) => event.status === statusFilter.value),
);

function sellThrough(event: any) {
  if (!event.totalCapacity) return 0;
  return Math.min(100, Math.round(((event.totalSold || 0) / event.totalCapacity) * 100));
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch([search, statusFilter], () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    load();
  }, 350);
});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: String(limit) });
    if (search.value.trim()) params.set('search', search.value.trim());
    if (statusFilter.value !== 'ALL') params.set('status', statusFilter.value);
    const data = await apiRequest<any>(`/events/admin/my-events?${params.toString()}`);
    events.value = data?.data || [];
    total.value = data?.metadata?.total || events.value.length;
    lastPage.value = data?.metadata?.lastPage || 1;
    statistics.value = data?.metadata?.statistics || {};
  } catch (err) {
    error.value = errorMessage(err);
    events.value = [];
  } finally {
    loading.value = false;
  }
}

function changePage(next: number) {
  if (next < 1 || next > lastPage.value) return;
  page.value = next;
  load();
}

function askDelete(event: any) {
  deleteTarget.value = event;
  deleteError.value = '';
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  deleteError.value = '';
  try {
    await apiRequest(`/events/${deleteTarget.value._id}`, { method: 'DELETE' });
    toast.success('Event deleted');
    deleteTarget.value = null;
    await load();
  } catch (err) {
    deleteError.value = errorMessage(err);
  } finally {
    deleting.value = false;
  }
}

onMounted(load);
useSeoMeta({ title: 'Events', robots: 'noindex, nofollow' });
</script>
