<template>
  <div class="space-y-5">
    <!-- KPIs -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="stat !py-4">
        <p class="stat-label">Gross revenue</p>
        <p class="font-display text-2xl font-semibold text-ink">{{ formatCompactMoney(stats.totalRevenue) }}</p>
        <p class="text-[10.5px] text-muted">{{ stats.totalPaidOrders || 0 }} paid orders</p>
        <p v-if="stats.refundedCount" class="text-[10.5px] text-coral">{{ stats.refundedCount }} refunded · {{ formatMoney(stats.refundedAmount) }}</p>
      </div>
      <div class="stat !py-4">
        <p class="stat-label">Outstanding</p>
        <p class="font-display text-2xl font-semibold text-ink">{{ formatCompactMoney(stats.outstandingBalance) }}</p>
        <p class="text-[10.5px] text-muted">Part-paid balances</p>
      </div>
      <div class="stat !py-4">
        <p class="stat-label">Needs review</p>
        <p class="font-display text-2xl font-semibold" :class="stats.totalPending ? 'text-coral' : 'text-ink'">{{ stats.totalPending || 0 }}</p>
        <p class="text-[10.5px] text-muted">Transfers to verify</p>
      </div>
      <div class="stat !py-4">
        <p class="stat-label">Total orders</p>
        <p class="font-display text-2xl font-semibold text-ink">{{ stats.totalOrders || 0 }}</p>
        <p class="text-[10.5px] text-muted">All time</p>
      </div>
    </section>

    <!-- Toolbar -->
    <section class="surface p-3 sm:p-4 space-y-3">
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="px-3.5 py-2 rounded-full text-[12.5px] font-semibold whitespace-nowrap transition"
          :class="currentTab === tab.value ? 'bg-ink text-paper' : 'text-ink/65 hover:bg-paper'"
          @click="setTab(tab.value)"
        >
          {{ tab.label }}
          <span v-if="tab.value === 'AWAITING_APPROVAL' && stats.totalPending" class="ml-1 text-[10px] font-bold bg-coral text-white rounded-full px-1.5 py-0.5">
            {{ stats.totalPending }}
          </span>
        </button>
      </div>

      <div class="flex flex-col sm:flex-row gap-2">
        <div class="relative flex-1">
          <Search class="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input v-model="search" type="search" placeholder="Search name, email, order or bank reference" class="input !pl-10 !py-2.5" />
        </div>
        <select v-model="department" class="input sm:w-44 !py-2.5">
          <option v-for="dept in stats.availableDepartments || ['ALL']" :key="dept" :value="dept">
            {{ dept === 'ALL' ? 'All departments' : dept }}
          </option>
        </select>
        <button class="btn-secondary btn-sm shrink-0" type="button" @click="exportCsv">
          <Download class="w-3.5 h-3.5" /> Export
        </button>
      </div>
    </section>

    <div v-if="error" class="surface p-4 border-coral/30 bg-coral/5 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-coral shrink-0 mt-0.5" />
      <p class="text-sm text-ink flex-1">{{ error }}</p>
      <button class="btn-secondary btn-sm" type="button" @click="load">Retry</button>
    </div>

    <!-- Table -->
    <section class="table-wrap">
      <div v-if="loading" class="p-5 space-y-3">
        <div v-for="n in 6" :key="n" class="skeleton h-14" />
      </div>

      <UiEmpty
        v-else-if="!orders.length"
        :title="search ? 'No orders match that search' : 'No orders in this view'"
        :message="search ? 'Try a name, email, order number or bank reference.' : 'Orders appear here the moment checkout starts.'"
        class="!py-12"
      >
        <template #icon><ReceiptText class="w-6 h-6" /></template>
        <template #action>
          <button v-if="search" class="btn-secondary btn-sm" type="button" @click="search = ''">Clear search</button>
        </template>
      </UiEmpty>

      <table v-else class="table min-w-[900px]">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Event</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Placed</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order._id">
            <td>
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-8 h-8 rounded-full bg-paper border border-line flex items-center justify-center text-[10px] font-bold text-ink shrink-0">
                  {{ initials(order.customerName) }}
                </span>
                <div class="min-w-0">
                  <p class="text-[13px] font-semibold text-ink truncate">{{ order.customerName }}</p>
                  <p class="text-[11px] text-muted truncate max-w-[190px]">{{ order.customerEmail }}</p>
                </div>
              </div>
            </td>
            <td class="max-w-[200px]">
              <p class="text-[12.5px] font-medium text-ink truncate">{{ order.eventId?.title || 'Event removed' }}</p>
              <p class="mono text-[10px] text-muted">{{ order.orderNumber }}</p>
            </td>
            <td class="whitespace-nowrap">
              <p class="text-[13px] font-semibold text-ink">{{ formatMoney(order.totalAmount) }}</p>
              <p v-if="order.amountRemaining > 0" class="text-[10.5px] text-amber-700">{{ formatMoney(order.amountRemaining) }} due</p>
            </td>
            <td>
              <span class="chip-muted !text-[9px] !px-2">{{ methodLabel(order.paymentMethod) }}</span>
            </td>
            <td class="whitespace-nowrap">
              <p class="text-[11.5px] text-ink">{{ relativeTime(order.createdAt) }}</p>
              <p class="text-[10px] text-muted">{{ formatDate(order.createdAt, { day: 'numeric', month: 'short' }) }}</p>
            </td>
            <td><UiBadge :value="order.status" dot /></td>
            <td>
              <div class="flex items-center justify-end gap-1">
                <button class="btn-ghost btn-sm" type="button" title="View order" @click="openDetail(order)">
                  <Eye class="w-4 h-4" />
                </button>
                <button
                  v-if="order.status === 'AWAITING_APPROVAL' || order.status === 'PENDING'"
                  class="btn-secondary btn-sm !py-1.5 !px-2.5 text-[11px]"
                  type="button"
                  @click="openVerify(order)"
                >
                  Verify
                </button>
                <button
                  v-else-if="order.status === 'PAID'"
                  class="btn-ghost btn-sm"
                  type="button"
                  title="Resend tickets"
                  :disabled="busy === order._id"
                  @click="resend(order)"
                >
                  <Send class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="lastPage > 1" class="flex items-center justify-between gap-3">
      <p class="text-[12px] text-muted">Page {{ page }} of {{ lastPage }} · {{ total }} orders</p>
      <div class="flex gap-2">
        <button class="btn-secondary btn-sm" type="button" :disabled="page <= 1" @click="changePage(page - 1)">Previous</button>
        <button class="btn-secondary btn-sm" type="button" :disabled="page >= lastPage" @click="changePage(page + 1)">Next</button>
      </div>
    </div>

    <!-- ========== Detail modal ========== -->
    <UiModal :open="!!detail" :title="detail?.customerName || 'Order'" :eyebrow="`Order ${detail?.orderNumber || ''}`" size="lg" @close="detail = null">
      <div v-if="detail" class="space-y-4">
        <div class="grid sm:grid-cols-3 gap-3">
          <div class="rounded-xl bg-paper border border-line p-3">
            <p class="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Total</p>
            <p class="font-display text-lg font-semibold text-ink">{{ formatMoney(detail.totalAmount) }}</p>
          </div>
          <div class="rounded-xl bg-paper border border-line p-3">
            <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Paid</p>
            <p class="font-display text-lg font-semibold text-ink">{{ formatMoney(detail.amountPaid) }}</p>
          </div>
          <div class="rounded-xl bg-paper border border-line p-3">
            <p class="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Status</p>
            <UiBadge :value="detail.status" dot class="mt-1" />
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-3 text-[12.5px]">
          <div class="rounded-xl border border-line p-3">
            <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-muted mb-1.5">Customer</p>
            <p class="font-semibold text-ink">{{ detail.customerName }}</p>
            <p class="text-muted">{{ detail.customerEmail }}</p>
            <p v-if="detail.customerPhone" class="text-muted">{{ detail.customerPhone }}</p>
            <p v-if="detail.departmentCode" class="chip-muted mt-2 !text-[9px]">{{ detail.departmentCode }}</p>
          </div>
          <div class="rounded-xl border border-line p-3">
            <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-muted mb-1.5">Payment</p>
            <p class="text-ink">Method: <span class="font-semibold">{{ methodLabel(detail.paymentMethod) }}</span></p>
            <p v-if="detail.bankReference" class="mono text-[11px] text-muted break-all">Bank ref: {{ detail.bankReference }}</p>
            <p v-if="detail.paystackReference" class="mono text-[11px] text-muted break-all">Gateway: {{ detail.paystackReference }}</p>
            <p class="text-muted mt-1">Placed {{ formatDateTime(detail.createdAt) }}</p>
          </div>
        </div>

        <div class="rounded-xl border border-line overflow-hidden">
          <p class="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted bg-paper border-b border-line">Items</p>
          <div v-for="item in detail.items || []" :key="item.tierId + item.tierName" class="px-3 py-2.5 flex items-center justify-between gap-3 border-b border-line/60 last:border-0 text-[12.5px]">
            <div>
              <p class="font-semibold text-ink">{{ item.quantity }}× {{ item.tierName }}</p>
              <p class="text-[11px] text-muted">{{ formatMoney(item.unitPrice) }} each</p>
            </div>
            <p class="font-semibold text-ink">{{ formatMoney(item.subtotal) }}</p>
          </div>
        </div>

        <div v-if="detail.proofOfPaymentUrl" class="rounded-xl border border-line overflow-hidden">
          <div class="px-3 py-2 bg-paper border-b border-line flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Proof of payment</p>
            <a :href="detail.proofOfPaymentUrl" target="_blank" rel="noopener" class="text-[11px] font-semibold text-forest hover:underline">Open original</a>
          </div>
          <div class="bg-paper/40 p-3">
            <img v-if="isImage(detail.proofOfPaymentUrl)" :src="detail.proofOfPaymentUrl" alt="Proof of payment" class="max-h-72 mx-auto rounded-lg border border-line" />
            <a v-else :href="detail.proofOfPaymentUrl" target="_blank" rel="noopener" class="btn-secondary btn-sm">Open receipt document</a>
          </div>
        </div>

        <div v-if="detail.status === 'REFUNDED'" class="rounded-xl bg-coral/5 border border-coral/20 p-3.5 text-[12px]">
          <p class="font-semibold text-coral">Refunded {{ formatMoney(detail.refundAmount) }}</p>
          <p class="text-muted mt-1">{{ detail.refundReason }}</p>
          <p v-if="detail.refundReference" class="mono text-[10.5px] text-muted mt-1">Ref: {{ detail.refundReference }} · {{ detail.refundMethod }}</p>
        </div>

        <div class="flex flex-wrap gap-2 pt-1">
          <button v-if="['PENDING', 'AWAITING_APPROVAL'].includes(detail.status)" class="btn-primary btn-sm" type="button" @click="openVerify(detail)">
            <BadgeCheck class="w-3.5 h-3.5" /> Verify payment
          </button>
          <button v-if="['PENDING', 'AWAITING_APPROVAL'].includes(detail.status)" class="btn-secondary btn-sm" type="button" @click="openReject(detail)">
            Reject
          </button>
          <button v-if="detail.status === 'PENDING'" class="btn-ghost btn-sm" type="button" @click="openRemind(detail)">
            <BellRing class="w-3.5 h-3.5" /> Send reminder
          </button>
          <button v-if="detail.status === 'PAID'" class="btn-secondary btn-sm" type="button" @click="resend(detail)">
            <Send class="w-3.5 h-3.5" /> Resend tickets
          </button>
          <button v-if="detail.status === 'PAID'" class="btn-danger btn-sm" type="button" @click="openRefund(detail)">
            <Undo2 class="w-3.5 h-3.5" /> Refund
          </button>
        </div>
      </div>
    </UiModal>

    <!-- ========== Verify modal ========== -->
    <UiModal :open="!!verifyTarget" title="Verify this payment" eyebrow="Manual approval" @close="verifyTarget = null">
      <div v-if="verifyTarget" class="space-y-3.5">
        <div class="rounded-xl bg-paper border border-line p-3.5 text-[12.5px]">
          <div class="flex justify-between"><span class="text-muted">Customer</span><span class="font-semibold text-ink">{{ verifyTarget.customerName }}</span></div>
          <div class="flex justify-between mt-1"><span class="text-muted">Order</span><span class="mono font-semibold text-ink">{{ verifyTarget.orderNumber }}</span></div>
          <div class="flex justify-between mt-1"><span class="text-muted">Amount</span><span class="font-semibold text-ink">{{ formatMoney(verifyTarget.totalAmount) }}</span></div>
        </div>

        <div>
          <label class="label">Bank reference / session ID <span class="text-coral">*</span></label>
          <input v-model.trim="verify.bankReference" type="text" class="input" placeholder="e.g. 20260914123456" />
          <p class="field-hint">Compulsory. Duplicate references are blocked automatically.</p>
        </div>
        <div>
          <label class="label">Verification note <span class="text-coral">*</span></label>
          <textarea v-model.trim="verify.reason" rows="2" class="input resize-y" placeholder="Matched against the GTBank statement at 14:32" />
        </div>
        <div>
          <label class="label">Receipt {{ verifyTarget.proofOfPaymentUrl ? '(optional — replace)' : '*' }}</label>
          <label class="flex items-center gap-2 rounded-xl border border-dashed border-line bg-paper/50 px-3 py-2.5 cursor-pointer hover:border-forest/40">
            <UploadCloud class="w-4 h-4 text-muted" />
            <span class="text-[12px] font-medium text-ink truncate">{{ verifyFile?.name || 'Choose receipt (JPG, PNG, PDF)' }}</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" class="sr-only" @change="onVerifyFile" />
          </label>
        </div>
        <p v-if="verifyError" class="field-error">{{ verifyError }}</p>
        <div class="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900">
          Approving issues tickets immediately and emails every attendee. This action is audit-logged.
        </div>
      </div>
      <template #footer>
        <button class="btn-primary" type="button" :disabled="verifying" @click="submitVerify">
          {{ verifying ? 'Approving…' : 'Approve & issue tickets' }}
        </button>
        <button class="btn-secondary" type="button" @click="verifyTarget = null">Cancel</button>
      </template>
    </UiModal>

    <!-- ========== Reject modal ========== -->
    <UiModal :open="!!rejectTarget" title="Reject this payment" eyebrow="Releases the seats" size="sm" @close="rejectTarget = null">
      <p class="text-sm text-muted">This cancels order <strong class="mono text-ink">{{ rejectTarget?.orderNumber }}</strong>, releases inventory and returns any promo use.</p>
      <div class="mt-3">
        <label class="label">Reason</label>
        <textarea v-model.trim="rejectReason" rows="2" class="input resize-y" placeholder="Payment not found on the statement" />
      </div>
      <p v-if="rejectError" class="field-error mt-2">{{ rejectError }}</p>
      <template #footer>
        <button class="btn-danger" type="button" :disabled="rejecting" @click="submitReject">{{ rejecting ? 'Rejecting…' : 'Reject payment' }}</button>
        <button class="btn-secondary" type="button" @click="rejectTarget = null">Cancel</button>
      </template>
    </UiModal>

    <!-- ========== Refund modal ========== -->
    <UiModal :open="!!refundTarget" title="Refund this order" eyebrow="Full refund" @close="refundTarget = null">
      <div v-if="refundTarget" class="space-y-3.5">
        <div class="rounded-xl bg-paper border border-line p-3.5 text-[12.5px]">
          <div class="flex justify-between"><span class="text-muted">Customer</span><span class="font-semibold text-ink">{{ refundTarget.customerName }}</span></div>
          <div class="flex justify-between mt-1"><span class="text-muted">Order</span><span class="mono font-semibold text-ink">{{ refundTarget.orderNumber }}</span></div>
          <div class="flex justify-between mt-1"><span class="text-muted">Refund amount</span><span class="font-semibold text-ink">{{ formatMoney(refundTarget.amountPaid || refundTarget.totalAmount) }}</span></div>
        </div>

        <div>
          <label class="label">Reason <span class="text-coral">*</span></label>
          <textarea v-model.trim="refundReason" rows="2" class="input resize-y" placeholder="e.g. Event cancelled — full refund requested" />
        </div>

        <label v-if="refundTarget.paymentMethod !== 'PAYSTACK'" class="flex items-start gap-2.5 text-[12px] text-ink cursor-pointer rounded-xl bg-amber-50 border border-amber-200 p-3">
          <input v-model="refundManual" type="checkbox" class="mt-0.5 w-4 h-4 rounded border-line text-forest focus:ring-forest" />
          <span>I confirm the bank refund of {{ formatMoney(refundTarget.amountPaid || refundTarget.totalAmount) }} has been sent to this buyer. This order was paid outside the gateway.</span>
        </label>

        <div class="rounded-xl bg-coral/5 border border-coral/20 p-3 text-[11.5px] text-ink leading-relaxed">
          Refunding cancels every unused ticket, returns upcoming inventory and removes the order from any un-settled payout. Tickets already used at the gate cannot be refunded.
        </div>
        <p v-if="refundError" class="field-error">{{ refundError }}</p>
      </div>
      <template #footer>
        <button class="btn-danger" type="button" :disabled="refunding" @click="submitRefund">
          {{ refunding ? 'Processing…' : 'Refund & cancel tickets' }}
        </button>
        <button class="btn-secondary" type="button" @click="refundTarget = null">Cancel</button>
      </template>
    </UiModal>

    <!-- ========== Reminder modal ========== -->
    <UiModal :open="!!remindTarget" title="Send payment reminder" eyebrow="Nudge the buyer" @close="remindTarget = null">
      <div class="space-y-3">
        <div>
          <label class="label">Subject</label>
          <input v-model.trim="reminder.subject" type="text" class="input" />
        </div>
        <div>
          <label class="label">Message</label>
          <textarea v-model.trim="reminder.message" rows="3" class="input resize-y" />
        </div>
        <p v-if="remindError" class="field-error">{{ remindError }}</p>
      </div>
      <template #footer>
        <button class="btn-primary" type="button" :disabled="reminding" @click="submitReminder">{{ reminding ? 'Sending…' : 'Send reminder' }}</button>
        <button class="btn-secondary" type="button" @click="remindTarget = null">Cancel</button>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  BadgeCheck,
  BellRing,
  Download,
  Eye,
  ReceiptText,
  Search,
  Send,
  Undo2,
  UploadCloud,
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const router = useRouter();
const pendingBadge = useState<number>('pending-approvals', () => 0);

const tabs = [
  { label: 'All', value: 'ALL' },
  { label: 'Needs review', value: 'AWAITING_APPROVAL' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Part-paid', value: 'PARTIALLY_PAID' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Refunded', value: 'REFUNDED' },
];

const currentTab = ref(typeof route.query.tab === 'string' && route.query.tab === 'review' ? 'AWAITING_APPROVAL' : 'ALL');
const orders = ref<any[]>([]);
const stats = ref<any>({});
const loading = ref(true);
const error = ref('');
const page = ref(1);
const limit = 20;
const lastPage = ref(1);
const total = ref(0);
const search = ref('');
const department = ref('ALL');
const busy = ref<string | null>(null);

const detail = ref<any>(null);
const refundTarget = ref<any>(null);
const refundReason = ref('');
const refundManual = ref(false);
const refundError = ref('');
const refunding = ref(false);
const verifyTarget = ref<any>(null);
const rejectTarget = ref<any>(null);
const remindTarget = ref<any>(null);
const verify = reactive({ bankReference: '', reason: '' });
const verifyFile = ref<File | null>(null);
const verifyError = ref('');
const verifying = ref(false);
const rejectReason = ref('');
const rejectError = ref('');
const rejecting = ref(false);
const reminder = reactive({ subject: '', message: '' });
const remindError = ref('');
const reminding = ref(false);

function methodLabel(method: string) {
  const map: Record<string, string> = {
    PAYSTACK: 'Paystack',
    MANUAL_TRANSFER: 'Bank transfer',
    INTERNAL_ISSUANCE: 'Complimentary',
    FREE: 'Free',
  };
  return map[method] || method || '—';
}

function isImage(url: string) {
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url || '');
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch([search, department], () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    load();
  }, 350);
});

function setTab(tab: string) {
  currentTab.value = tab;
  page.value = 1;
  const query = tab === 'AWAITING_APPROVAL' ? { tab: 'review' } : {};
  router.replace({ query });
  load();
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      limit: String(limit),
      status: currentTab.value,
      departmentCode: department.value,
    });
    if (search.value.trim()) params.set('search', search.value.trim());
    const data = await apiRequest<any>(`/orders/tenant?${params.toString()}`);
    orders.value = data?.data || [];
    stats.value = data?.metadata?.statistics || {};
    lastPage.value = data?.metadata?.lastPage || 1;
    total.value = data?.metadata?.total || orders.value.length;
    pendingBadge.value = stats.value.totalPending || 0;
  } catch (err) {
    error.value = errorMessage(err);
    orders.value = [];
  } finally {
    loading.value = false;
  }
}

function changePage(next: number) {
  if (next < 1 || next > lastPage.value) return;
  page.value = next;
  load();
}

function openDetail(order: any) {
  detail.value = order;
}

function openVerify(order: any) {
  verifyTarget.value = order;
  verify.bankReference = order.bankReference || '';
  verify.reason = '';
  verifyFile.value = null;
  verifyError.value = '';
}

function onVerifyFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    verifyError.value = 'Receipts must be under 10MB.';
    return;
  }
  verifyFile.value = file;
}

async function submitVerify() {
  verifyError.value = '';
  if (!verify.bankReference) {
    verifyError.value = 'A bank reference is required.';
    return;
  }
  if (!verify.reason) {
    verifyError.value = 'Add a verification note.';
    return;
  }
  if (!verifyFile.value && !verifyTarget.value.proofOfPaymentUrl) {
    verifyError.value = 'Attach the payment receipt.';
    return;
  }

  verifying.value = true;
  try {
    const form = new FormData();
    form.append('bankReference', verify.bankReference);
    form.append('reason', verify.reason);
    if (verifyFile.value) form.append('receipt', verifyFile.value);
    await apiRequest(`/orders/admin/${verifyTarget.value._id}/force-approve`, {
      method: 'PATCH',
      body: form,
    });
    toast.success('Payment verified — tickets issued');
    verifyTarget.value = null;
    detail.value = null;
    await load();
  } catch (err) {
    verifyError.value = errorMessage(err);
  } finally {
    verifying.value = false;
  }
}

function openRefund(order: any) {
  refundTarget.value = order;
  refundReason.value = '';
  refundManual.value = false;
  refundError.value = '';
}

async function submitRefund() {
  refundError.value = '';
  if (!refundReason.value) {
    refundError.value = 'Add a reason for the refund.';
    return;
  }
  if (refundTarget.value.paymentMethod !== 'PAYSTACK' && !refundManual.value) {
    refundError.value = 'Confirm that the manual refund has been sent.';
    return;
  }
  refunding.value = true;
  try {
    await apiRequest(`/orders/admin/${refundTarget.value._id}/refund`, {
      method: 'POST',
      body: { reason: refundReason.value, manual: refundManual.value },
    });
    toast.success('Order refunded and tickets cancelled');
    refundTarget.value = null;
    detail.value = null;
    await load();
  } catch (err) {
    refundError.value = errorMessage(err);
  } finally {
    refunding.value = false;
  }
}

function openReject(order: any) {
  rejectTarget.value = order;
  rejectReason.value = '';
  rejectError.value = '';
}

async function submitReject() {
  rejecting.value = true;
  rejectError.value = '';
  try {
    await apiRequest(`/orders/admin/${rejectTarget.value._id}/reject`, {
      method: 'PATCH',
      body: { reason: rejectReason.value },
    });
    toast.success('Payment rejected and inventory released');
    rejectTarget.value = null;
    detail.value = null;
    await load();
  } catch (err) {
    rejectError.value = errorMessage(err);
  } finally {
    rejecting.value = false;
  }
}

function openRemind(order: any) {
  remindTarget.value = order;
  reminder.subject = `Complete your ticket order ${order.orderNumber}`;
  reminder.message = `Hi ${order.customerName}, your seats for ${order.eventId?.title || 'the event'} are still reserved. Complete your payment to lock them in.`;
  remindError.value = '';
}

async function submitReminder() {
  reminding.value = true;
  remindError.value = '';
  try {
    await apiRequest(`/orders/admin/${remindTarget.value._id}/remind`, {
      method: 'POST',
      body: { customSubject: reminder.subject, customMessage: reminder.message },
    });
    toast.success('Reminder sent');
    remindTarget.value = null;
  } catch (err) {
    remindError.value = errorMessage(err);
  } finally {
    reminding.value = false;
  }
}

async function resend(order: any) {
  busy.value = order._id;
  try {
    await apiRequest(`/orders/admin/${order._id}/resend-tickets`, { method: 'POST' });
    toast.success('Tickets re-sent to the buyer');
  } catch (err) {
    toast.error(errorMessage(err));
  } finally {
    busy.value = null;
  }
}

function exportCsv() {
  if (!orders.value.length) return;
  const rows = [
    ['Order', 'Customer', 'Email', 'Event', 'Amount', 'Paid', 'Status', 'Method', 'Date'],
    ...orders.value.map((order) => [
      order.orderNumber,
      order.customerName,
      order.customerEmail,
      order.eventId?.title || '',
      order.totalAmount,
      order.amountPaid || 0,
      order.status,
      order.paymentMethod,
      new Date(order.createdAt).toISOString(),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ticketr-orders-page-${page.value}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

onMounted(load);
useSeoMeta({ title: 'Orders', robots: 'noindex, nofollow' });
</script>
