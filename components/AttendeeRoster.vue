<template>
  <div class="space-y-4">
    <!-- Event header + stats -->
    <section v-if="eventInfo" class="surface p-4 sm:p-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Attendee roster</p>
          <h2 class="font-display text-xl font-semibold text-ink truncate">{{ eventInfo.title }}</h2>
          <p class="text-[12px] text-muted">{{ formatDate(eventInfo.startDate, { weekday: 'short', day: 'numeric', month: 'long' }) }} · {{ eventInfo.location }}</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button class="btn-secondary btn-sm" type="button" :disabled="exporting" @click="exportCsv">
            <Download class="w-3.5 h-3.5" /> Export
          </button>
          <button class="btn-secondary btn-sm" type="button" @click="load">
            <RefreshCcw class="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        <div class="rounded-xl bg-paper border border-line px-3 py-2">
          <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Issued</p>
          <p class="num text-lg font-bold text-ink">{{ stats.totalTickets || 0 }}</p>
        </div>
        <div class="rounded-xl bg-paper border border-line px-3 py-2">
          <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Checked in</p>
          <p class="num text-lg font-bold text-forest">{{ stats.checkedInCount || 0 }}</p>
        </div>
        <div class="rounded-xl bg-paper border border-line px-3 py-2">
          <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Not yet in</p>
          <p class="num text-lg font-bold text-ink">{{ stats.pendingCount || 0 }}</p>
        </div>
        <div class="rounded-xl bg-paper border border-line px-3 py-2">
          <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Check-in rate</p>
          <p class="num text-lg font-bold text-ink">{{ stats.checkInRate || 0 }}%</p>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <section class="surface p-3 flex flex-col sm:flex-row gap-2">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input v-model="search" type="search" placeholder="Search name, email or ticket code" class="input !pl-10 !py-2.5" />
      </div>
      <select v-model="status" class="input sm:w-40 !py-2.5">
        <option value="ALL">All statuses</option>
        <option value="ISSUED">Not checked in</option>
        <option value="CHECKED_IN">Checked in</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <select v-if="(stats.availableDepartments || []).length > 1" v-model="department" class="input sm:w-40 !py-2.5">
        <option v-for="dept in stats.availableDepartments" :key="dept" :value="dept">
          {{ dept === 'ALL' ? 'All departments' : dept }}
        </option>
      </select>
    </section>

    <div v-if="error" class="surface p-4 border-coral/30 bg-coral/5 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-coral shrink-0 mt-0.5" />
      <p class="text-sm text-ink flex-1">{{ error }}</p>
      <button class="btn-secondary btn-sm" type="button" @click="load">Retry</button>
    </div>

    <!-- Table -->
    <section class="table-wrap">
      <div v-if="loading" class="p-5 space-y-2.5">
        <div v-for="n in 6" :key="n" class="skeleton h-12" />
      </div>
      <UiEmpty
        v-else-if="!attendees.length"
        :title="search || status !== 'ALL' ? 'No attendees match these filters' : 'No tickets issued yet'"
        :message="search || status !== 'ALL' ? 'Try a different search or clear the filters.' : 'Issued tickets will appear here in real time.'"
        class="!py-12"
      >
        <template #icon><Users class="w-6 h-6" /></template>
      </UiEmpty>
      <table v-else class="table min-w-[860px]">
        <thead>
          <tr>
            <th>Attendee</th>
            <th>Ticket</th>
            <th>Tier</th>
            <th>Department</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in attendees" :key="ticket._id">
            <td>
              <div class="min-w-0">
                <p class="text-[13px] font-semibold text-ink truncate">{{ cleanAttendeeName(ticket.attendeeName) || 'Guest' }}</p>
                <p class="text-[11px] text-muted truncate max-w-[220px]">{{ ticket.attendeeEmail }}</p>
              </div>
            </td>
            <td>
              <button type="button" class="mono text-[11px] font-semibold text-ink hover:text-forest inline-flex items-center gap-1" title="Copy ticket code" @click="copyCode(ticket.ticketNumber)">
                {{ ticket.ticketNumber }}
                <Copy class="w-3 h-3 text-muted" />
              </button>
            </td>
            <td class="text-[12px] text-ink">{{ ticket.tierId?.name || '—' }}</td>
            <td>
              <span v-if="ticket.departmentCode" class="chip-muted !text-[9px] !px-2">{{ ticket.departmentCode }}</span>
              <span v-else class="text-muted text-[12px]">—</span>
            </td>
            <td>
              <UiBadge :value="ticket.status" dot />
              <p v-if="ticket.checkedInAt" class="text-[10px] text-muted mt-0.5">{{ formatTime(ticket.checkedInAt) }}</p>
            </td>
            <td>
              <div class="flex items-center justify-end gap-1">
                <button
                  v-if="ticket.status === 'ISSUED'"
                  class="btn-ghost btn-sm"
                  type="button"
                  title="Check in this attendee"
                  :disabled="rowBusy === ticket._id"
                  @click="checkIn(ticket)"
                >
                  <UserCheck class="w-4 h-4" />
                </button>
                <button class="btn-ghost btn-sm" type="button" title="Change tier" @click="openTier(ticket)">
                  <ArrowLeftRight class="w-4 h-4" />
                </button>
                <button class="btn-ghost btn-sm" type="button" title="Resend ticket email" :disabled="rowBusy === ticket._id" @click="resend(ticket)">
                  <Send class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="lastPage > 1" class="flex items-center justify-between gap-3">
      <p class="text-[12px] text-muted">Page {{ page }} of {{ lastPage }} · {{ total }} tickets</p>
      <div class="flex gap-2">
        <button class="btn-secondary btn-sm" type="button" :disabled="page <= 1" @click="changePage(page - 1)">Previous</button>
        <button class="btn-secondary btn-sm" type="button" :disabled="page >= lastPage" @click="changePage(page + 1)">Next</button>
      </div>
    </div>

    <!-- Tier modal -->
    <UiModal :open="!!tierTarget" title="Move ticket to another tier" eyebrow="Organizer action" size="sm" @close="tierTarget = null">
      <div v-if="tierTarget" class="space-y-3">
        <div class="rounded-xl bg-paper border border-line p-3 text-[12px]">
          <p class="font-semibold text-ink">{{ cleanAttendeeName(tierTarget.attendeeName) }}</p>
          <p class="mono text-[10.5px] text-muted">{{ tierTarget.ticketNumber }} · currently {{ tierTarget.tierId?.name }}</p>
        </div>
        <div>
          <label class="label">New tier</label>
          <select v-model="newTierId" class="input">
            <option value="">Select a tier…</option>
            <option v-for="tier in availableTiers" :key="tier._id" :value="tier._id" :disabled="tier.remaining <= 0 || tier._id === tierTarget.tierId?._id">
              {{ tier.name }} — {{ formatMoney(tier.price) }} ({{ tier.remaining }} left)
            </option>
          </select>
        </div>
        <div class="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900 leading-relaxed">
          The ticket’s QR is rotated and re-emailed. Any price difference is recorded on the order but is not charged automatically — collect it separately.
        </div>
        <p v-if="tierError" class="field-error">{{ tierError }}</p>
      </div>
      <template #footer>
        <button class="btn-primary" type="button" :disabled="!newTierId || tierChanging" @click="changeTier">
          {{ tierChanging ? 'Moving…' : 'Move ticket' }}
        </button>
        <button class="btn-secondary" type="button" @click="tierTarget = null">Cancel</button>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, ArrowLeftRight, Copy, Download, RefreshCcw, Search, Send, UserCheck, Users } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const props = defineProps<{ eventId: string }>();

const attendees = ref<any[]>([]);
const eventInfo = ref<any>(null);
const stats = ref<any>({});
const loading = ref(true);
const error = ref('');
const page = ref(1);
const limit = 20;
const lastPage = ref(1);
const total = ref(0);
const search = ref('');
const status = ref('ALL');
const department = ref('ALL');
const rowBusy = ref<string | null>(null);
const exporting = ref(false);

const tierTarget = ref<any>(null);
const newTierId = ref('');
const tierChanging = ref(false);
const tierError = ref('');
const availableTiers = ref<any[]>([]);

let timer: ReturnType<typeof setTimeout> | null = null;
watch([search, status, department], () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    page.value = 1;
    load();
  }, 350);
});

watch(
  () => props.eventId,
  () => {
    page.value = 1;
    load();
  },
);

async function load() {
  if (!props.eventId) return;
  loading.value = true;
  error.value = '';
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      limit: String(limit),
      status: status.value,
      departmentCode: department.value,
    });
    if (search.value.trim()) params.set('search', search.value.trim());
    const data = await apiRequest<any>(`/events/${props.eventId}/attendees?${params.toString()}`);
    attendees.value = data?.attendees?.data || [];
    stats.value = data?.attendees?.metadata?.statistics || {};
    lastPage.value = data?.attendees?.metadata?.lastPage || 1;
    total.value = data?.attendees?.metadata?.total || attendees.value.length;
    eventInfo.value = data?.event || eventInfo.value;
  } catch (err) {
    error.value = errorMessage(err);
    attendees.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadTiers() {
  try {
    const data = await apiRequest<any>(`/events/${props.eventId}`);
    availableTiers.value = (data?.tiers || []).filter((tier: any) => tier.isActive !== false);
  } catch {
    availableTiers.value = [];
  }
}

function changePage(next: number) {
  if (next < 1 || next > lastPage.value) return;
  page.value = next;
  load();
}

async function copyCode(code: string) {
  const ok = await copyText(code);
  toast[ok ? 'success' : 'error'](ok ? 'Ticket code copied' : 'Could not copy');
}

async function checkIn(ticket: any) {
  if (!confirm(`Check in ${cleanAttendeeName(ticket.attendeeName)} now? This admits them at the gate.`)) return;
  rowBusy.value = ticket._id;
  try {
    const data = await apiRequest<any>('/tickets/verify-scan', {
      method: 'POST',
      body: { qrCodeHash: ticket.ticketNumber, eventId: props.eventId, commit: true },
    });
    if (data.valid) {
      toast.success('Checked in');
      await load();
    } else {
      toast.error(data.message || 'This ticket could not be checked in');
    }
  } catch (err) {
    toast.error(errorMessage(err));
  } finally {
    rowBusy.value = null;
  }
}

async function resend(ticket: any) {
  rowBusy.value = ticket._id;
  try {
    await apiRequest(`/tickets/${ticket._id}/resend-email`, { method: 'POST', body: {} });
    toast.success('Ticket re-sent');
  } catch (err) {
    toast.error(errorMessage(err));
  } finally {
    rowBusy.value = null;
  }
}

function openTier(ticket: any) {
  tierTarget.value = ticket;
  newTierId.value = '';
  tierError.value = '';
  if (!availableTiers.value.length) loadTiers();
}

async function changeTier() {
  tierError.value = '';
  tierChanging.value = true;
  try {
    await apiRequest(`/tickets/${tierTarget.value._id}/change-tier`, {
      method: 'POST',
      body: { newTierId: newTierId.value },
    });
    toast.success('Ticket moved and re-emailed');
    tierTarget.value = null;
    await load();
  } catch (err) {
    tierError.value = errorMessage(err);
  } finally {
    tierChanging.value = false;
  }
}

async function exportCsv() {
  exporting.value = true;
  try {
    // Export every ticket matching the current filters (paged fetch).
    const all: any[] = [];
    let current = 1;
    let pages = 1;
    do {
      const params = new URLSearchParams({
        page: String(current),
        limit: '200',
        status: status.value,
        departmentCode: department.value,
      });
      if (search.value.trim()) params.set('search', search.value.trim());
      const data = await apiRequest<any>(`/events/${props.eventId}/attendees?${params.toString()}`);
      all.push(...(data?.attendees?.data || []));
      pages = data?.attendees?.metadata?.lastPage || 1;
      current++;
    } while (current <= pages && current <= 25);

    const rows = [
      ['Name', 'Email', 'Ticket', 'Tier', 'Department', 'Status', 'Checked in at', 'Transfers'],
      ...all.map((ticket) => [
        cleanAttendeeName(ticket.attendeeName),
        ticket.attendeeEmail,
        ticket.ticketNumber,
        ticket.tierId?.name || '',
        ticket.departmentCode || '',
        ticket.status,
        ticket.checkedInAt ? new Date(ticket.checkedInAt).toISOString() : '',
        ticket.transferCount || 0,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticketr-attendees-${props.eventId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    toast.error(errorMessage(err, 'Export failed'));
  } finally {
    exporting.value = false;
  }
}

onMounted(load);
</script>
