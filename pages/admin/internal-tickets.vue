<template>
  <div class="grid lg:grid-cols-[1.2fr_1fr] gap-4 items-start">
    <!-- Issue form -->
    <section class="surface p-5 sm:p-6 space-y-3.5">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">No payment</p>
        <h2 class="font-display text-xl font-semibold text-ink mt-0.5">Issue a complimentary ticket</h2>
        <p class="text-[12.5px] text-muted mt-1">For guests, speakers, sponsors and staff. Every issue is audit-logged with a reason and consumes real inventory.</p>
      </div>

      <div>
        <label class="label">Event</label>
        <select v-model="form.eventId" class="input" @change="onEventChange">
          <option value="">Select event…</option>
          <option v-for="event in events" :key="event._id" :value="event._id">{{ event.title }}</option>
        </select>
      </div>

      <div v-if="form.eventId">
        <label class="label">Tier</label>
        <select v-model="form.tierId" class="input">
          <option value="">Select tier…</option>
          <option v-for="tier in tiers" :key="tier._id" :value="tier._id" :disabled="tier.remaining <= 0">
            {{ tier.name }} — {{ formatMoney(tier.price) }} ({{ tier.remaining }} left)
          </option>
        </select>
      </div>

      <div class="grid sm:grid-cols-2 gap-3">
        <div>
          <label class="label">Attendee name</label>
          <input v-model.trim="form.customerName" type="text" class="input" placeholder="Full name" />
        </div>
        <div>
          <label class="label">Attendee email</label>
          <input v-model.trim="form.customerEmail" type="email" class="input" placeholder="guest@example.com" />
        </div>
      </div>
      <div>
        <label class="label">Department / association (optional)</label>
        <input v-model.trim="form.departmentCode" type="text" class="input" placeholder="e.g. SPEAKER" />
      </div>
      <div>
        <label class="label">Reason <span class="text-coral">*</span></label>
        <textarea v-model.trim="form.reason" rows="2" class="input resize-y" placeholder="e.g. Keynote speaker — approved by ops" />
      </div>

      <p v-if="error" class="field-error">{{ error }}</p>
      <button class="btn-primary w-full" type="button" :disabled="!canSubmit || submitting" @click="issue">
        <span v-if="submitting" class="w-4 h-4 border-2 border-paper/40 border-t-paper rounded-full animate-spin" />
        {{ submitting ? 'Issuing…' : 'Issue complimentary ticket' }}
      </button>
      <p class="text-[10.5px] text-muted text-center">The guest receives a real QR pass by email.</p>
    </section>

    <!-- Recent comps -->
    <section class="surface overflow-hidden">
      <div class="px-4 py-3 border-b border-line flex items-center justify-between">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Ledger</p>
          <p class="font-display text-base font-semibold text-ink">Recent complimentary issues</p>
        </div>
        <button class="btn-ghost btn-sm" type="button" @click="loadRecent">
          <RefreshCcw class="w-3.5 h-3.5" :class="{ 'animate-spin': loadingRecent }" />
        </button>
      </div>
      <div v-if="loadingRecent" class="p-4 space-y-2">
        <div v-for="n in 4" :key="n" class="skeleton h-12" />
      </div>
      <UiEmpty
        v-else-if="!recent.length"
        title="No comps issued"
        message="Issued complimentary tickets will appear here."
        class="!py-10"
      >
        <template #icon><Ticket class="w-6 h-6" /></template>
      </UiEmpty>
      <div v-else class="divide-y divide-line max-h-[460px] overflow-y-auto">
        <div v-for="order in recent" :key="order._id" class="px-4 py-3">
          <div class="flex items-center justify-between gap-2">
            <p class="text-[12.5px] font-semibold text-ink truncate">{{ order.customerName }}</p>
            <span class="mono text-[10px] text-muted shrink-0">{{ relativeTime(order.createdAt) }}</span>
          </div>
          <p class="text-[11px] text-muted truncate">{{ order.eventId?.title }} · {{ order.items?.[0]?.tierName }}</p>
          <p class="text-[10.5px] text-muted/80 truncate mt-0.5">{{ order.forceApproveReason }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RefreshCcw, Ticket } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const events = ref<any[]>([]);
const tiers = ref<any[]>([]);
const recent = ref<any[]>([]);
const loadingRecent = ref(true);
const submitting = ref(false);
const error = ref('');

const form = reactive({
  eventId: '',
  tierId: '',
  customerName: '',
  customerEmail: '',
  departmentCode: '',
  reason: '',
});

const canSubmit = computed(
  () =>
    form.eventId &&
    form.tierId &&
    form.customerName.length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.customerEmail) &&
    form.reason.length > 3,
);

async function loadEvents() {
  try {
    const data = await apiRequest<any>('/events/tenant?limit=100');
    events.value = data?.data || [];
    if (!form.eventId && events.value.length === 1) {
      form.eventId = events.value[0]._id;
      await onEventChange();
    }
  } catch (err) {
    toast.error(errorMessage(err, 'Could not load events.'));
  }
}

async function onEventChange() {
  form.tierId = '';
  tiers.value = [];
  if (!form.eventId) return;
  try {
    const data = await apiRequest<any>(`/events/${form.eventId}`);
    tiers.value = (data?.tiers || []).filter((tier: any) => tier.isActive !== false);
  } catch (err) {
    toast.error(errorMessage(err));
  }
}

async function loadRecent() {
  loadingRecent.value = true;
  try {
    const data = await apiRequest<any>('/orders/tenant?status=PAID&limit=100&page=1');
    const orders = data?.data || [];
    recent.value = orders.filter((order: any) => order.paymentMethod === 'INTERNAL_ISSUANCE');
  } catch {
    recent.value = [];
  } finally {
    loadingRecent.value = false;
  }
}

async function issue() {
  error.value = '';
  if (!canSubmit.value) {
    error.value = 'Complete every required field.';
    return;
  }
  submitting.value = true;
  try {
    await apiRequest('/orders/admin/internal-ticket', {
      method: 'POST',
      body: { ...form },
    });
    toast.success('Complimentary ticket issued and emailed');
    form.customerName = '';
    form.customerEmail = '';
    form.departmentCode = '';
    form.reason = '';
    await loadRecent();
    await onEventChange();
  } catch (err) {
    error.value = errorMessage(err);
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadEvents();
  loadRecent();
});
useSeoMeta({ title: 'Complimentary tickets', robots: 'noindex, nofollow' });
</script>
