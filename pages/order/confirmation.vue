<template>
  <div class="bg-paper min-h-[72vh]">
    <div class="shell py-12 sm:py-16 max-w-3xl">
      <!-- Verifying -->
      <div v-if="loading" class="surface p-8 sm:p-12 text-center">
        <div class="relative w-16 h-16 mx-auto mb-5">
          <div class="absolute inset-0 rounded-full border-4 border-line" />
          <div class="absolute inset-0 rounded-full border-4 border-forest border-t-transparent animate-spin" />
          <ShieldCheck class="w-6 h-6 text-forest absolute inset-0 m-auto" />
        </div>
        <h1 class="font-display text-2xl font-semibold text-ink">Confirming your payment</h1>
        <p class="text-sm text-muted mt-2 max-w-sm mx-auto">
          We are verifying with the payment provider and issuing your tickets. This usually takes a few seconds — please keep this page open.
        </p>
        <div class="mt-6 flex justify-center gap-1.5">
          <span v-for="n in 3" :key="n" class="w-1.5 h-1.5 rounded-full bg-forest/40 animate-pulse" :style="{ animationDelay: `${n * 150}ms` }" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="surface p-8 sm:p-12 text-center">
        <span class="w-14 h-14 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mx-auto mb-4">
          <AlertTriangle class="w-7 h-7" />
        </span>
        <h1 class="font-display text-2xl font-semibold text-ink">We could not confirm this payment</h1>
        <p class="text-sm text-muted mt-2 max-w-md mx-auto">{{ error }}</p>
        <div class="flex flex-wrap justify-center gap-2 mt-6">
          <button class="btn-primary" type="button" @click="verify">Try again</button>
          <NuxtLink to="/my-tickets" class="btn-secondary">Open ticket wallet</NuxtLink>
          <a href="mailto:support@ticketr.org" class="btn-ghost">Contact support</a>
        </div>
        <p class="text-[11px] text-muted mt-6">
          Keep your payment reference: <span class="mono font-semibold text-ink">{{ reference || '—' }}</span>
        </p>
      </div>

      <!-- Awaiting approval (manual transfer) -->
      <div v-else-if="mandate" class="surface p-8 sm:p-12 text-center">
        <span class="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <Clock class="w-7 h-7" />
        </span>
        <h1 class="font-display text-2xl font-semibold text-ink">Payment under review</h1>
        <p class="text-sm text-muted mt-2 max-w-md mx-auto">{{ mandate }}</p>
        <NuxtLink to="/my-tickets" class="btn-primary mt-6">Open my wallet</NuxtLink>
      </div>

      <!-- Resale success -->
      <div v-else-if="resale" class="surface overflow-hidden">
        <div class="bg-ink text-paper px-6 sm:px-8 py-8 relative overflow-hidden">
          <div class="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-lime/20 blur-[70px]" />
          <div class="relative flex items-start gap-4">
            <span class="w-12 h-12 rounded-2xl bg-lime text-ink flex items-center justify-center shrink-0">
              <Check class="w-6 h-6" />
            </span>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-paper/50">Verified resale confirmed</p>
              <h1 class="font-display text-2xl sm:text-3xl font-semibold leading-tight mt-1">This pass is now yours.</h1>
              <p class="text-sm text-paper/70 mt-2">
                The seller’s QR was cancelled. Your fresh pass is in your private wallet and on its way to your email.
              </p>
            </div>
          </div>
        </div>
        <div class="p-6 sm:p-8">
          <div class="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Order</p>
              <p class="mono font-semibold text-ink">{{ resale.orderNumber || '—' }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Ticket</p>
              <p class="mono font-semibold text-ink">{{ resale.ticketNumber || '—' }}</p>
            </div>
          </div>
          <NuxtLink :to="resale.walletToken ? `/my-tickets?token=${resale.walletToken}` : '/my-tickets'" class="btn-primary mt-5">
            <Wallet class="w-4 h-4" /> Open my wallet
          </NuxtLink>
          <p class="text-[11px] text-muted mt-4">The seller is paid after the event. Ticketr’s fee covers verification and buyer protection.</p>
        </div>
      </div>

      <!-- Success -->
      <div v-else-if="order" class="space-y-5">
        <div class="surface overflow-hidden">
          <div class="bg-ink text-paper px-6 sm:px-8 py-8 relative overflow-hidden">
            <div class="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-lime/20 blur-[70px]" />
            <div class="relative flex items-start gap-4">
              <span class="w-12 h-12 rounded-2xl bg-lime text-ink flex items-center justify-center shrink-0 animate-pulse-ring">
                <Check class="w-6 h-6" />
              </span>
              <div class="min-w-0">
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-paper/50">
                  {{ order.status === 'PARTIALLY_PAID' ? 'Deposit received' : 'Payment confirmed' }}
                </p>
                <h1 class="font-display text-2xl sm:text-3xl font-semibold leading-tight mt-1">
                  {{ order.status === 'PARTIALLY_PAID'
                    ? `Half paid. ${formatMoney(order.amountRemaining)} left.`
                    : `You’re in. ${order.tickets?.length || 0} pass${(order.tickets?.length || 0) === 1 ? '' : 'es'} issued.` }}
                </h1>
                <p class="text-sm text-paper/70 mt-2">
                  {{ order.event?.title }} · {{ formatDate(order.event?.startDate, { weekday: 'short', day: 'numeric', month: 'long' }) }}
                </p>
              </div>
            </div>
          </div>

          <div class="p-6 sm:p-8">
            <div class="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Order</p>
                <p class="mono font-semibold text-ink">{{ order.orderNumber }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Paid</p>
                <p class="font-semibold text-ink">{{ formatMoney(order.amountPaid || order.totalAmount) }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Tickets sent to</p>
                <p class="font-semibold text-ink truncate">{{ order.customerEmail }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Venue</p>
                <p class="font-semibold text-ink truncate">{{ order.event?.location }}</p>
              </div>
            </div>

            <div v-if="order.amountRemaining > 0" class="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <p class="text-[12.5px] font-semibold text-amber-900">
                Your seats are held. Balance {{ formatMoney(order.amountRemaining) }} is due within 14 days — tickets are issued as soon as it is paid.
              </p>
              <button class="btn-primary btn-sm mt-2" type="button" @click="payBalance">Pay balance now</button>
            </div>

            <div class="flex flex-wrap gap-2.5 mt-6">
              <NuxtLink :to="walletLink" class="btn-primary">
                <Wallet class="w-4 h-4" /> Open my wallet
              </NuxtLink>
              <button class="btn-secondary" type="button" @click="addToCalendar">
                <CalendarPlus class="w-4 h-4" /> Add to calendar
              </button>
              <button class="btn-ghost" type="button" @click="shareWallet">
                <Share2 class="w-4 h-4" /> Copy wallet link
              </button>
            </div>
            <p class="text-[11px] text-muted mt-4">
              We also emailed each ticket and the private wallet link. If it doesn’t arrive in a minute, check spam or
              <NuxtLink to="/my-tickets" class="underline decoration-lime decoration-2 underline-offset-2 text-ink">request a new link</NuxtLink>.
            </p>
          </div>
        </div>

        <!-- Ticket previews -->
        <div v-if="order.tickets?.length" class="grid sm:grid-cols-2 gap-4">
          <div v-for="ticket in order.tickets" :key="ticket._id" class="surface p-4 flex gap-3 items-center">
            <div class="bg-white p-1.5 rounded-lg border border-line shrink-0">
              <QrCode :value="ticket.qrCodeHash" :size="72" />
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{{ ticket.tierId?.name || 'Pass' }}</p>
              <p class="text-sm font-semibold text-ink truncate">{{ cleanAttendeeName(ticket.attendeeName) || 'Guest' }}</p>
              <p class="mono text-[11px] text-muted truncate">{{ ticket.ticketNumber }}</p>
              <UiBadge :value="ticket.status" class="mt-1 !text-[9px]" />
            </div>
          </div>
        </div>

        <p class="text-center text-[11px] text-muted">
          Need help? <a href="mailto:support@ticketr.org" class="underline decoration-lime decoration-2 underline-offset-2 text-ink">support@ticketr.org</a>
        </p>
      </div>

      <!-- Missing reference -->
      <div v-else class="surface p-8 sm:p-12 text-center">
        <span class="w-14 h-14 rounded-2xl bg-paper border border-line text-ink/50 flex items-center justify-center mx-auto mb-4">
          <Link2Off class="w-7 h-7" />
        </span>
        <h1 class="font-display text-2xl font-semibold text-ink">Nothing to confirm yet</h1>
        <p class="text-sm text-muted mt-2 max-w-md mx-auto">
          This page confirms a payment after checkout. If you already paid, open your private ticket wallet instead.
        </p>
        <div class="flex flex-wrap justify-center gap-2 mt-6">
          <NuxtLink to="/my-tickets" class="btn-primary">Open my tickets</NuxtLink>
          <NuxtLink to="/" class="btn-secondary">Browse events</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, CalendarPlus, Check, Clock, Link2Off, Share2, ShieldCheck, Wallet } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'default' });

const config = useRuntimeConfig();
const route = useRoute();

const reference = computed(() => (typeof route.query.reference === 'string' ? route.query.reference : ''));
const loading = ref(true);
const error = ref('');
const mandate = ref('');
const order = ref<any>(null);
const resale = ref<any>(null);

const walletLink = computed(() =>
  order.value?.walletToken
    ? `/my-tickets?token=${order.value.walletToken}`
    : '/my-tickets',
);

async function verify() {
  if (!reference.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = '';
  mandate.value = '';

  const isResale = reference.value.startsWith('RSL-');

  try {
    const data = isResale
      ? await apiRequest<any>(`/tickets/resale/verify?reference=${encodeURIComponent(reference.value)}`, { auth: false })
      : await apiRequest<any>(`/orders/verify?reference=${encodeURIComponent(reference.value)}`, { auth: false });

    if (isResale) {
      resale.value = data;
      if (data?.walletToken) sessionStorage.setItem('ticketr_wallet_token', data.walletToken);
      return;
    }

    if (data?.status === 'PARTIALLY_PAID') {
      order.value = data;
      if (data.walletToken) sessionStorage.setItem('ticketr_wallet_token', data.walletToken);
      return;
    }

    if (data?.status === 'AWAITING_APPROVAL') {
      mandate.value = 'Your proof of payment is with the organizer. Tickets are issued as soon as it is verified.';
      return;
    }

    if (!data?.orderNumber) {
      error.value = 'We could not find an order for this payment reference.';
      return;
    }

    order.value = data;
    if (data.walletToken) sessionStorage.setItem('ticketr_wallet_token', data.walletToken);
  } catch (err: any) {
    const message = errorMessage(err);
    if (message.toLowerCase().includes('being issued')) {
      // Webhook and this request are racing; retry once after a moment.
      await new Promise((resolve) => setTimeout(resolve, 2500));
      try {
        const retry = await apiRequest<any>(`/orders/verify?reference=${encodeURIComponent(reference.value)}`, { auth: false });
        if (retry?.orderNumber) {
          order.value = retry;
          if (retry.walletToken) sessionStorage.setItem('ticketr_wallet_token', retry.walletToken);
          return;
        }
      } catch {
        /* fall through */
      }
    }
    error.value = message;
  } finally {
    loading.value = false;
  }
}

async function payBalance() {
  if (!order.value?.orderId) return;
  try {
    const res = await apiRequest<any>(`/orders/${order.value.orderId}/pay-balance`, {
      method: 'POST',
      auth: false,
      body: { callbackUrl: `${window.location.origin}/order/confirmation` },
    });
    if (res?.authorizationUrl) window.location.href = res.authorizationUrl;
  } catch (err) {
    toast.error(errorMessage(err));
  }
}

function addToCalendar() {
  if (!order.value?.event) return;
  downloadCalendarFile({
    title: order.value.event.title,
    description: order.value.event.description,
    location: order.value.event.location,
    startDate: order.value.event.startDate,
    endDate: order.value.event.endDate,
    slug: order.value.event.slug,
  });
}

async function shareWallet() {
  if (!order.value?.walletToken) return;
  const url = `${window.location.origin}/my-tickets?token=${order.value.walletToken}`;
  const ok = await copyText(url);
  toast[ok ? 'success' : 'error'](ok ? 'Private wallet link copied' : 'Could not copy the link');
}

onMounted(verify);

useSeoMeta({ title: 'Payment confirmation | Ticketr', robots: 'noindex, nofollow' });
</script>
