<template>
  <div class="space-y-5">
    <!-- Summary -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="stat">
        <p class="stat-label">Available to request</p>
        <p class="stat-value">{{ formatCompactMoney(summary.availableBalance) }}</p>
        <p class="text-[11px] text-muted">{{ summary.availableOrders || 0 }} settled orders</p>
      </div>
      <div class="stat">
        <p class="stat-label">In a pending payout</p>
        <p class="stat-value">{{ formatCompactMoney(summary.pendingPayoutAmount) }}</p>
        <p class="text-[11px] text-muted">{{ summary.pendingPayoutCount || 0 }} request(s)</p>
      </div>
      <div class="stat">
        <p class="stat-label">Paid to date</p>
        <p class="stat-value">{{ formatCompactMoney(summary.paidTotal) }}</p>
        <p class="text-[11px] text-muted">{{ summary.paidCount || 0 }} settled payout(s)</p>
      </div>
      <div class="stat">
        <p class="stat-label">Last settlement</p>
        <p class="stat-value !text-xl">{{ summary.lastPayout ? formatDate(summary.lastPayout.paidAt, { day: 'numeric', month: 'short' }) : '—' }}</p>
        <p class="text-[11px] text-muted truncate">{{ summary.lastPayout?.reference || 'No payout yet' }}</p>
      </div>
    </section>

    <section class="surface p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="max-w-xl">
        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Settlement</p>
        <h2 class="font-display text-xl font-semibold text-ink mt-0.5">Request a payout of your net revenue</h2>
        <p class="text-[12.5px] text-muted mt-1 leading-relaxed">
          Available balance is paid order revenue minus platform fees, refunded orders and any payout already requested.
          Ticketr settles to the remittance account in <NuxtLink to="/admin/settings?tab=payouts" class="font-semibold text-forest hover:underline">Settings → Payouts</NuxtLink>.
        </p>
      </div>
      <button class="btn-primary shrink-0" type="button" :disabled="summary.availableBalance <= 0" @click="requestOpen = true">
        <Banknote class="w-4 h-4" /> Request payout
      </button>
    </section>

    <div v-if="error" class="surface p-4 border-coral/30 bg-coral/5 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-coral shrink-0 mt-0.5" />
      <p class="text-sm text-ink flex-1">{{ error }}</p>
      <button class="btn-secondary btn-sm" type="button" @click="load">Retry</button>
    </div>

    <section class="table-wrap">
      <div class="px-5 py-4 border-b border-line flex items-center justify-between">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Ledger</p>
          <h3 class="font-display text-lg font-semibold text-ink">Payout history</h3>
        </div>
        <button class="btn-ghost btn-sm" type="button" @click="load">
          <RefreshCcw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" /> Refresh
        </button>
      </div>
      <div v-if="loading" class="p-5 space-y-2">
        <div v-for="n in 4" :key="n" class="skeleton h-12" />
      </div>
      <UiEmpty v-else-if="!payouts.length" title="No payouts yet" message="Request your first payout once orders are settled." class="!py-12">
        <template #icon><Banknote class="w-6 h-6" /></template>
      </UiEmpty>
      <table v-else class="table min-w-[720px]">
        <thead>
          <tr><th>Requested</th><th>Period</th><th>Orders</th><th>Amount</th><th>Status</th><th class="text-right">Reference</th></tr>
        </thead>
        <tbody>
          <tr v-for="payout in payouts" :key="payout._id">
            <td class="whitespace-nowrap text-[12px] text-ink">{{ formatDate(payout.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }) }}</td>
            <td class="text-[11px] text-muted whitespace-nowrap">
              {{ payout.periodStart ? formatDate(payout.periodStart, { day: 'numeric', month: 'short' }) : '—' }}
              <span v-if="payout.periodEnd"> → {{ formatDate(payout.periodEnd, { day: 'numeric', month: 'short' }) }}</span>
            </td>
            <td class="text-[12px] text-ink">{{ payout.orderCount || 0 }}</td>
            <td class="text-[13px] font-semibold text-ink">{{ formatMoney(payout.amount) }}</td>
            <td><UiBadge :value="payout.status" dot /></td>
            <td class="text-right">
              <div class="flex items-center justify-end gap-2">
                <span class="mono text-[10px] text-muted truncate max-w-[140px]">{{ payout.reference || '—' }}</span>
                <button v-if="['PENDING', 'PROCESSING'].includes(payout.status)" class="btn-ghost btn-sm text-coral" type="button" @click="cancelTarget = payout">Cancel</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Request -->
    <UiModal :open="requestOpen" title="Request a payout" eyebrow="Settlement request" @close="requestOpen = false">
      <div class="space-y-3.5">
        <div class="rounded-xl bg-paper border border-line p-4">
          <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Amount to settle</p>
          <p class="font-display text-2xl font-semibold text-ink mt-1">{{ formatMoney(summary.availableBalance) }}</p>
          <p class="text-[11px] text-muted mt-1">{{ summary.availableOrders || 0 }} orders · net of platform fees and refunds</p>
        </div>
        <div class="rounded-xl bg-forest/[0.05] border border-forest/15 p-3 text-[11.5px] text-ink leading-relaxed">
          Requesting moves these orders into a pending payout. Ticketr staff will settle to your remittance account and mark it paid with a bank reference. Refunds before settlement automatically reduce the payout.
        </div>
        <p v-if="requestError" class="field-error">{{ requestError }}</p>
      </div>
      <template #footer>
        <button class="btn-primary" type="button" :disabled="requesting" @click="requestPayout">
          {{ requesting ? 'Requesting…' : 'Request payout' }}
        </button>
        <button class="btn-secondary" type="button" @click="requestOpen = false">Cancel</button>
      </template>
    </UiModal>

    <!-- Cancel -->
    <UiModal :open="!!cancelTarget" title="Cancel this payout request?" eyebrow="Releases orders" size="sm" @close="cancelTarget = null">
      <p class="text-sm text-muted">The orders will become available again for a future payout request. No money moves.</p>
      <p v-if="cancelError" class="field-error mt-2">{{ cancelError }}</p>
      <template #footer>
        <button class="btn-danger" type="button" :disabled="cancelling" @click="cancelPayout">{{ cancelling ? 'Cancelling…' : 'Cancel payout' }}</button>
        <button class="btn-secondary" type="button" @click="cancelTarget = null">Keep request</button>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Banknote, RefreshCcw } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const loading = ref(true);
const error = ref('');
const summary = ref<any>({
  availableBalance: 0,
  availableOrders: 0,
  pendingPayoutAmount: 0,
  pendingPayoutCount: 0,
  paidTotal: 0,
  paidCount: 0,
  lastPayout: null,
});
const payouts = ref<any[]>([]);
const requestOpen = ref(false);
const requesting = ref(false);
const requestError = ref('');
const cancelTarget = ref<any>(null);
const cancelling = ref(false);
const cancelError = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const [summaryData, list] = await Promise.all([
      apiRequest<any>('/payouts/tenant/summary'),
      apiRequest<any>('/payouts/tenant?limit=100'),
    ]);
    summary.value = summaryData;
    payouts.value = list?.data || [];
  } catch (err) {
    error.value = errorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function requestPayout() {
  requestError.value = '';
  requesting.value = true;
  try {
    await apiRequest('/payouts/request', { method: 'POST' });
    toast.success('Payout requested');
    requestOpen.value = false;
    await load();
  } catch (err) {
    requestError.value = errorMessage(err);
  } finally {
    requesting.value = false;
  }
}

async function cancelPayout() {
  cancelError.value = '';
  cancelling.value = true;
  try {
    await apiRequest(`/payouts/${cancelTarget.value._id}/cancel`, { method: 'PATCH' });
    toast.success('Payout request cancelled');
    cancelTarget.value = null;
    await load();
  } catch (err) {
    cancelError.value = errorMessage(err);
  } finally {
    cancelling.value = false;
  }
}

onMounted(load);
useSeoMeta({ title: 'Payouts', robots: 'noindex, nofollow' });
</script>
