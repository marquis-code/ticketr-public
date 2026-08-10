<template>
  <div class="min-h-screen   flex flex-col items-center justify-center p-6">
    <div class="w-full max-w-lg">
      <!-- Loading State -->
      <div v-if="loading" class="glass-card rounded-2xl p-12 text-center">
        <div class="inline-block w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <h3 class="text-lg font-bold text-gray-900 mt-4">Verifying Payment & Generating Tickets...</h3>
        <p class="text-xs text-gray-600 mt-1">Please do not refresh this page.</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="glass-card rounded-2xl p-8 text-center border-rose-500/40">
        <div class="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
          ⚠️
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Payment Verification Error</h3>
        <p class="text-gray-600 text-sm mb-6">{{ error }}</p>
        <NuxtLink to="/" class="btn-primary text-xs">Return to Events</NuxtLink>
      </div>

      <!-- Success Ticket Card -->
      <div v-else-if="orderData" class="space-y-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-3xl mb-3">
            ✓
          </div>
          <h2 class="text-2xl font-extrabold text-gray-900">Payment Confirmed!</h2>
          <p class="text-sm text-gray-600 mt-1">Order #{{ orderData.orderNumber }}</p>
        </div>

        <!-- E-Ticket Render -->
        <div v-for="ticket in orderData.tickets" :key="ticket._id" class="glass-card rounded-2xl overflow-hidden border-primary/40 print:bg-white print:text-black">
          <div class="bg-gradient-to-r from-primary to-primary-700 p-6 text-white text-center">
            <span class="text-xs font-semibold uppercase tracking-wider opacity-80 block">Official Event Pass</span>
            <h3 class="text-xl font-bold mt-1">{{ ticket.ticketNumber }}</h3>
          </div>

          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-xs text-gray-500 uppercase font-medium block">Attendee</span>
                <span class="font-semibold text-gray-900">{{ ticket.attendeeName }}</span>
              </div>
              <div>
                <span class="text-xs text-gray-500 uppercase font-medium block">Email</span>
                <span class="font-semibold text-gray-700 text-xs truncate block">{{ ticket.attendeeEmail }}</span>
              </div>
            </div>

            <!-- QR Code Render -->
            <div class=" rounded-xl p-6 text-center border border-gray-200 my-4">
              <canvas :ref="el => setCanvasRef(el, ticket.qrCodeHash)" class="mx-auto w-48 h-48 rounded-lg bg-white p-2"></canvas>
              <span class="text-[11px] text-primary font-medium block mt-3">Scan at entrance gate for admission</span>
            </div>

            <div class="flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-gray-200">
              <span>Status: <strong class="text-emerald-400 uppercase">{{ ticket.status }}</strong></span>
              <span>Issued by Ticketr</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-4 pt-2">
          <button @click="printTicket" class="btn-primary text-xs flex items-center gap-2">
            🖨️ Print / Save Ticket PDF
          </button>
          <NuxtLink to="/" class="btn-secondary text-xs">
            Back to Portal
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import QRCode from 'qrcode';

const config = useRuntimeConfig();
const route = useRoute();

const loading = ref(true);
const error = ref(null);
const orderData = ref(null);
const canvasRefs = ref({});

function setCanvasRef(el, hash) {
  if (el && hash) {
    canvasRefs.value[hash] = el;
    QRCode.toCanvas(el, hash, { width: 200, margin: 1 });
  }
}

function printTicket() {
  window.print();
}

async function verifyOrder() {
  const reference = route.query.reference;
  if (!reference) {
    loading.value = false;
    error.value = 'No transaction reference provided in URL';
    return;
  }

  try {
    const res = await fetch(`${config.public.apiBase}/orders/verify?reference=${encodeURIComponent(reference)}`);
    if (res.ok) {
      orderData.value = await res.json();
    } else {
      const err = await res.json();
      error.value = err.message || 'Payment verification failed';
    }
  } catch (err) {
    console.error('Verification error:', err);
    error.value = 'Network error while verifying payment';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  verifyOrder();
});
</script>
