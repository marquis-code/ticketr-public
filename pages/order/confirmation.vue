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
        <div class="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Payment Verification Error</h3>
        <p class="text-gray-600 text-sm mb-6">{{ error }}</p>
        <NuxtLink to="/" class="btn-primary text-xs">Return to Events</NuxtLink>
      </div>

      <!-- Success Ticket Card -->
      <div v-else-if="orderData" class="space-y-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle class="w-8 h-8" />
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
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="font-semibold text-gray-900">{{ getCleanName(ticket.attendeeName) }}</span>
                  <span v-if="getGenderTag(ticket.attendeeName) === 'Male'" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider border border-blue-200">Male</span>
                  <span v-if="getGenderTag(ticket.attendeeName) === 'Female'" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-100 text-pink-700 uppercase tracking-wider border border-pink-200">Female</span>
                </div>
              </div>
              <div>
                <span class="text-xs text-gray-500 uppercase font-medium block">Email</span>
                <span class="font-semibold text-gray-700 text-xs truncate block mt-0.5">{{ ticket.attendeeEmail }}</span>
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

            <div class="flex gap-2 mt-4">
              <a :href="`${config.public.apiBase}/tickets/${ticket._id}/pdf`" download class="flex-1 flex items-center justify-center gap-1 bg-gray-900 text-white rounded-lg py-2 text-xs font-semibold hover:bg-gray-800 transition">
                <Download class="w-4 h-4" /> Download PDF
              </a>
              <button @click="downloadQRCode(ticket.qrCodeHash, ticket.ticketNumber)" class="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-900 rounded-lg py-2 text-xs font-semibold hover:bg-gray-200 transition border border-gray-200">
                <Smartphone class="w-4 h-4" /> Save QR
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-4 pt-2">
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
import { AlertTriangle, CheckCircle, Download, Smartphone } from 'lucide-vue-next';

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

function downloadQRCode(hash, ticketNumber) {
  const canvas = canvasRefs.value[hash];
  if (!canvas) return;
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `QR-${ticketNumber.replace(/\//g, '-')}.png`;
  a.click();
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

function getCleanName(name) {
  if (!name) return '';
  return name.replace(/\s*\((Male|Female)\)\s*/i, '');
}

function getGenderTag(name) {
  if (!name) return null;
  const match = name.match(/\((Male|Female)\)/i);
  if (match) {
    return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  }
  return null;
}
</script>
