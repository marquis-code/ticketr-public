<template>
  <div class="bg-paper min-h-[70vh]">
    <!-- ================= LOOKUP ================= -->
    <section v-if="!token" class="relative overflow-hidden border-b border-line">
      <div class="absolute inset-0 bg-grid opacity-60" />
      <div class="shell relative py-14 sm:py-20">
        <div class="max-w-2xl">
          <span class="chip-ink !py-1.5"><TicketCheck class="w-3.5 h-3.5" /> Ticket wallet</span>
          <h1 class="font-display text-4xl sm:text-5xl font-semibold text-ink leading-[1.02] tracking-[-0.035em] mt-5">
            Your tickets,<br />behind a private link.
          </h1>
          <p class="text-[15px] text-muted mt-4 max-w-md leading-relaxed">
            Enter the email you used at checkout. We’ll send a private wallet link — no public ticket search, so nobody can pull up your QR codes.
          </p>

          <form class="mt-7 surface p-2 flex flex-col sm:flex-row gap-2 shadow-lift max-w-xl" @submit.prevent="requestLink">
            <div class="relative flex-1">
              <Mail class="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                v-model.trim="email"
                type="email"
                required
                autocomplete="email"
                placeholder="you@example.com"
                aria-label="Email used at checkout"
                class="w-full bg-transparent border-0 pl-11 pr-4 py-3.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-0"
              />
            </div>
            <button type="submit" class="btn-primary shrink-0" :disabled="linkPending">
              <span v-if="linkPending" class="w-4 h-4 border-2 border-paper/40 border-t-paper rounded-full animate-spin" />
              <Send v-else class="w-4 h-4" />
              {{ linkPending ? 'Sending…' : 'Email my tickets' }}
            </button>
          </form>

          <p v-if="linkMessage" class="mt-4 text-sm font-medium text-forest bg-forest/5 border border-forest/15 rounded-xl px-4 py-3 max-w-xl">
            {{ linkMessage }}
          </p>
          <p v-if="linkError" class="mt-4 text-sm font-medium text-coral bg-coral/10 border border-coral/20 rounded-xl px-4 py-3 max-w-xl">
            {{ linkError }}
          </p>

          <NuxtLink v-if="devLink" :to="devLink" class="btn-accent btn-sm mt-4">
            Open demo wallet <ArrowRight class="w-4 h-4" />
          </NuxtLink>

          <div class="mt-8 grid sm:grid-cols-3 gap-3 max-w-xl">
            <div v-for="item in reassurance" :key="item.title" class="surface p-3.5">
              <component :is="item.icon" class="w-4 h-4 text-forest" />
              <p class="text-[12px] font-semibold text-ink mt-2">{{ item.title }}</p>
              <p class="text-[11px] text-muted mt-0.5 leading-snug">{{ item.body }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= WALLET ================= -->
    <section v-else class="shell py-8 sm:py-12">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <span class="chip-soft"><ShieldCheck class="w-3 h-3" /> Private wallet</span>
          <h1 class="font-display text-3xl sm:text-4xl font-semibold text-ink mt-3">Your tickets</h1>
          <p class="text-sm text-muted mt-1.5">
            {{ orders.length }} order{{ orders.length === 1 ? '' : 's' }} · {{ ticketCount }} pass{{ ticketCount === 1 ? '' : 'es' }}
          </p>
        </div>
        <div class="flex gap-2">
          <button class="btn-secondary btn-sm" type="button" @click="refreshWallet">
            <RefreshCcw class="w-4 h-4" :class="{ 'animate-spin': loading }" /> Refresh
          </button>
          <button class="btn-ghost btn-sm" type="button" @click="forgetWallet">
            <LogOut class="w-4 h-4" /> Lock wallet
          </button>
        </div>
      </div>

      <div v-if="loading" class="space-y-6">
        <div v-for="n in 2" :key="n" class="surface p-6">
          <div class="skeleton h-6 w-1/3 mb-3" />
          <div class="skeleton h-4 w-1/2" />
        </div>
      </div>

      <div v-else-if="error" class="surface max-w-lg mx-auto p-8 text-center">
        <span class="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mx-auto mb-4">
          <KeyRound class="w-6 h-6" />
        </span>
        <h2 class="font-display text-xl font-semibold text-ink">This link cannot open a wallet</h2>
        <p class="text-sm text-muted mt-2">{{ error }}</p>
        <button class="btn-primary mt-5" type="button" @click="forgetWallet">Request a new link</button>
      </div>

      <UiEmpty
        v-else-if="!orders.length"
        title="No tickets in this wallet yet"
        message="If you completed a purchase, your tickets may still be issuing. Refresh in a moment."
      >
        <template #icon><Ticket class="w-6 h-6" /></template>
        <template #action>
          <NuxtLink to="/" class="btn-primary btn-sm">Browse events</NuxtLink>
        </template>
      </UiEmpty>

      <div v-else class="space-y-8">
        <section v-for="order in orders" :key="order.orderId">
          <!-- Order header -->
          <div class="surface p-5 sm:p-6 mb-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-start gap-3 min-w-0">
                <img
                  v-if="order.event?.bannerUrl"
                  :src="order.event.bannerUrl"
                  alt=""
                  class="w-14 h-14 rounded-xl object-cover border border-line shrink-0"
                />
                <div v-else class="w-14 h-14 rounded-xl bg-paper border border-line flex items-center justify-center shrink-0">
                  <Ticket class="w-5 h-5 text-ink/40" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <UiBadge :value="order.status" dot />
                    <span class="mono text-[10px] text-muted">{{ order.orderNumber }}</span>
                  </div>
                  <h2 class="font-display text-xl font-semibold text-ink mt-1 truncate">{{ order.event?.title }}</h2>
                  <p class="text-[12.5px] text-muted mt-0.5">
                    {{ formatDate(order.event?.startDate, { weekday: 'long', day: 'numeric', month: 'long' }) }} · {{ formatTime(order.event?.startDate) }} · {{ order.event?.location }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button class="btn-ghost btn-sm" type="button" @click="addToCalendar(order)">
                  <CalendarPlus class="w-4 h-4" /> Calendar
                </button>
                <NuxtLink
                  v-if="order.event?.slug && order.tenant?.slug"
                  :to="`/event/${order.event.slug}?tenant=${order.tenant.slug}`"
                  class="btn-secondary btn-sm"
                >
                  Event page <ArrowUpRight class="w-3.5 h-3.5" />
                </NuxtLink>
              </div>
            </div>

            <div v-if="order.status === 'AWAITING_APPROVAL'" class="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p class="text-[12.5px] text-amber-900 font-medium">
                Your proof of payment is with the organizer. Tickets will appear here and in your inbox as soon as it is verified.
              </p>
            </div>
            <div v-else-if="order.status === 'PENDING'" class="mt-4 rounded-xl bg-paper border border-line px-4 py-3">
              <p class="text-[12.5px] text-ink font-medium">
                This order is still awaiting payment. Seats are held for a limited time — complete checkout on the event page to keep them.
              </p>
            </div>
            <div v-else-if="order.status === 'PARTIALLY_PAID' && order.amountRemaining > 0" class="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p class="text-[12.5px] text-amber-900 font-medium">
                Balance of {{ formatMoney(order.amountRemaining) }} outstanding. Tickets are issued once paid.
              </p>
              <button class="btn-primary btn-sm shrink-0" type="button" @click="payBalance(order)">Pay balance</button>
            </div>
            <div v-else-if="order.status === 'REFUNDED'" class="mt-4 rounded-xl bg-coral/5 border border-coral/20 px-4 py-3">
              <p class="text-[12.5px] text-coral font-medium">
                This order was refunded{{ order.refundAmount ? ` (${formatMoney(order.refundAmount)})` : '' }}. The tickets below are cancelled and cannot be used at the gate.
              </p>
              <p v-if="order.refundReference" class="mono text-[10.5px] text-muted mt-1">Refund ref: {{ order.refundReference }}</p>
            </div>
            <div v-else-if="order.status === 'CANCELLED' || order.status === 'FAILED'" class="mt-4 rounded-xl bg-coral/5 border border-coral/20 px-4 py-3">
              <p class="text-[12.5px] text-coral font-medium">
                This order was {{ order.status === 'CANCELLED' ? 'cancelled' : 'not completed' }}. No tickets were issued and any held seats were released.
              </p>
            </div>
            <div v-else-if="!order.tickets?.length" class="mt-4 rounded-xl bg-paper border border-line px-4 py-3">
              <p class="text-[12.5px] text-ink font-medium">Tickets are being issued. Refresh in a moment.</p>
            </div>
          </div>

          <div class="grid gap-4">
            <TicketPass
              v-for="ticket in order.tickets"
              :key="ticket.id"
              :ticket="ticket"
              :event="order.event"
              :wallet-token="token"
              @transfer="openTransfer(ticket, order)"
              @resale="openResale(ticket, order)"
            />
          </div>
        </section>

        <div class="surface p-4 flex items-start gap-3">
          <ShieldCheck class="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <p class="text-[12px] text-muted leading-relaxed">
            This wallet is private to your email. Never forward the link or share a screenshot of your QR — a used QR is refused at the gate, and transfers rotate the code.
          </p>
        </div>
      </div>
    </section>

    <!-- ================= MODALS ================= -->
    <UiModal :open="modal === 'transfer'" title="Transfer this ticket" eyebrow="Verified handover" @close="modal = null">
      <div v-if="activeTicket" class="space-y-4">
        <div class="rounded-xl bg-paper border border-line p-3.5 text-sm flex justify-between gap-3">
          <div class="min-w-0">
            <p class="font-semibold text-ink truncate">{{ activeTicket.tier }}</p>
            <p class="mono text-[11px] text-muted">{{ activeTicket.ticketNumber }}</p>
          </div>
          <span class="chip-muted shrink-0">{{ activeOrder?.event?.title }}</span>
        </div>
        <p class="text-sm text-muted leading-relaxed">
          We’ll rotate the QR immediately. Your old pass stops working and the new attendee gets a fresh one by email.
        </p>
        <div>
          <label class="label">New attendee name</label>
          <input v-model.trim="transfer.name" type="text" class="input" placeholder="Full name" />
        </div>
        <div>
          <label class="label">New attendee email</label>
          <input v-model.trim="transfer.email" type="email" class="input" placeholder="name@example.com" />
        </div>
        <p v-if="transferError" class="field-error">{{ transferError }}</p>
        <p v-if="activeTicket.transferCount" class="text-[11px] text-muted">
          This ticket has been transferred {{ activeTicket.transferCount }} time(s) already.
        </p>
      </div>
      <template #footer>
        <button class="btn-primary" type="button" :disabled="transferPending" @click="submitTransfer">
          {{ transferPending ? 'Transferring…' : 'Transfer ticket' }}
        </button>
        <button class="btn-secondary" type="button" @click="modal = null">Cancel</button>
      </template>
    </UiModal>

    <UiModal :open="modal === 'resale'" title="List for resale" eyebrow="Face-value resale" @close="modal = null">
      <div v-if="activeTicket" class="space-y-4">
        <div class="rounded-xl bg-paper border border-line p-3.5 text-sm flex justify-between gap-3">
          <div>
            <p class="font-semibold text-ink">{{ activeTicket.tier }}</p>
            <p class="mono text-[11px] text-muted">{{ activeTicket.ticketNumber }}</p>
          </div>
          <span class="chip-lime shrink-0">Capped at face value</span>
        </div>
        <div>
          <label class="label">Asking price</label>
          <input v-model.number="resale.price" type="number" min="1" :max="resaleCap" class="input" />
          <p class="field-hint">
            Maximum {{ formatMoney(resaleCap) }} for this tier. Ticketr verifies the buyer and rotates your QR when it sells.
          </p>
        </div>
        <p v-if="resaleError" class="field-error">{{ resaleError }}</p>
        <p class="text-[11px] text-muted">
          If it sells, 90% of the price is paid out after the event. Your ticket stays valid until a buyer completes payment.
        </p>
      </div>
      <template #footer>
        <button class="btn-primary" type="button" :disabled="resalePending" @click="submitResale">
          {{ resalePending ? 'Listing…' : 'List ticket' }}
        </button>
        <button class="btn-secondary" type="button" @click="modal = null">Cancel</button>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowRight,
  ArrowUpRight,
  CalendarPlus,
  KeyRound,
  LogOut,
  Mail,
  RefreshCcw,
  Send,
  ShieldCheck,
  Ticket,
  TicketCheck,
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'default' });

const config = useRuntimeConfig();
const route = useRoute();

const token = ref(typeof route.query.token === 'string' ? route.query.token : '');
if (typeof window !== 'undefined') {
  if (token.value) sessionStorage.setItem('ticketr_wallet_token', token.value);
  else token.value = sessionStorage.getItem('ticketr_wallet_token') || '';
}

const email = ref('');
const linkPending = ref(false);
const linkMessage = ref('');
const linkError = ref('');
const devLink = ref('');

const orders = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

const ticketCount = computed(() =>
  orders.value.reduce((sum, order) => sum + (order.tickets?.length || 0), 0),
);

const reassurance = [
  { icon: ShieldCheck, title: 'Single-use QR', body: 'Scanned once, then refused.' },
  { icon: RefreshCcw, title: 'Rotating transfers', body: 'Old codes are voided instantly.' },
  { icon: KeyRound, title: 'Private by default', body: 'No public ticket lookup.' },
];

async function requestLink() {
  linkPending.value = true;
  linkMessage.value = '';
  linkError.value = '';
  devLink.value = '';
  try {
    const data = await apiRequest<any>('/orders/wallet/request-link', {
      method: 'POST',
      auth: false,
      body: { email: email.value },
    });
    linkMessage.value = data?.message || 'If that email has tickets, a private link is on its way.';
    if (data?.devLink) devLink.value = data.devLink;
  } catch (err) {
    linkError.value = errorMessage(err, 'We could not send that link.');
  } finally {
    linkPending.value = false;
  }
}

async function loadWallet(showLoading = true) {
  if (!token.value) return;
  if (showLoading) loading.value = true;
  error.value = '';
  try {
    const data = await apiRequest<any[]>(`/orders/wallet/${encodeURIComponent(token.value)}`, { auth: false });
    orders.value = Array.isArray(data) ? data : [];
  } catch (err) {
    error.value = errorMessage(err, 'This wallet link is invalid or has expired.');
    orders.value = [];
  } finally {
    loading.value = false;
  }
}

function refreshWallet() {
  loadWallet();
}

function forgetWallet() {
  if (typeof window !== 'undefined') sessionStorage.removeItem('ticketr_wallet_token');
  token.value = '';
  orders.value = [];
  error.value = '';
  if (typeof window !== 'undefined') navigateTo('/my-tickets');
}

function addToCalendar(order: any) {
  if (!order?.event?.startDate) return;
  downloadCalendarFile({
    title: order.event.title,
    description: order.event.description,
    location: order.event.location,
    startDate: order.event.startDate,
    endDate: order.event.endDate,
    slug: order.event.slug,
  });
}

async function payBalance(order: any) {
  try {
    const res = await apiRequest<any>(`/orders/${order.orderId}/pay-balance`, {
      method: 'POST',
      auth: false,
      body: { callbackUrl: `${window.location.origin}/order/confirmation` },
    });
    if (res?.authorizationUrl) window.location.href = res.authorizationUrl;
  } catch (err) {
    toast.error(errorMessage(err));
  }
}

// ---------------------------------------------------------------------------
// Transfer
// ---------------------------------------------------------------------------
const modal = ref<null | 'transfer' | 'resale'>(null);
const activeTicket = ref<any>(null);
const activeOrder = ref<any>(null);
const transfer = reactive({ name: '', email: '' });
const transferPending = ref(false);
const transferError = ref('');
const resale = reactive({ price: 0 });
const resalePending = ref(false);
const resaleError = ref('');
const resaleCap = ref(0);

function openTransfer(ticket: any, order: any) {
  activeTicket.value = ticket;
  activeOrder.value = order;
  transfer.name = '';
  transfer.email = '';
  transferError.value = '';
  modal.value = 'transfer';
}

function openResale(ticket: any, order: any) {
  activeTicket.value = ticket;
  activeOrder.value = order;
  const capPercent = Number(order?.event?.resalePriceCapPercent ?? 100);
  resaleCap.value = Math.max(1, Math.round(Number(ticket.tierPrice || 0) * (capPercent / 100) * 100) / 100);
  resale.price = resaleCap.value;
  resaleError.value = '';
  modal.value = 'resale';
}

async function submitTransfer() {
  transferError.value = '';
  if (!transfer.name || !transfer.email.includes('@')) {
    transferError.value = 'Enter the new attendee’s name and email.';
    return;
  }
  transferPending.value = true;
  try {
    await apiRequest(`/tickets/${activeTicket.value.id}/transfer`, {
      method: 'POST',
      auth: false,
      body: {
        walletToken: token.value,
        newAttendeeName: transfer.name,
        newAttendeeEmail: transfer.email,
      },
    });
    toast.success('Ticket transferred. The old QR is now void.');
    modal.value = null;
    await loadWallet(false);
  } catch (err) {
    transferError.value = errorMessage(err);
  } finally {
    transferPending.value = false;
  }
}

async function submitResale() {
  resaleError.value = '';
  if (!resale.price || resale.price <= 0) {
    resaleError.value = 'Enter a valid asking price.';
    return;
  }
  resalePending.value = true;
  try {
    await apiRequest(`/tickets/${activeTicket.value.id}/resale`, {
      method: 'POST',
      auth: false,
      body: { walletToken: token.value, askingPrice: resale.price },
    });
    toast.success('Listed for verified resale.');
    modal.value = null;
    await loadWallet(false);
  } catch (err) {
    resaleError.value = errorMessage(err);
  } finally {
    resalePending.value = false;
  }
}

onMounted(() => {
  if (token.value) loadWallet();
});

useSeoMeta({
  title: 'My tickets | Ticketr',
  description: 'Open your private ticket wallet, view QR codes, transfer or resell tickets safely.',
  robots: 'noindex, nofollow',
});
</script>
