<template>
  <div >
    <!-- Top Bar -->
    

    <main class="max-w-xl mx-auto px-2 sm:px-4 md:px-6 py-8 md:py-12 flex-grow w-full space-y-6">
      <div class="glass-card rounded-2xl p-4 sm:p-6 md:p-8 border-primary/30 text-center">
        <div class="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search class="w-8 h-8" />
        </div>
        <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Gate Entry Scanner</h1>
        <p class="text-xs text-gray-600 mb-6">Scan QR code or paste HMAC hash token from attendee's e-ticket.</p>

        <!-- Camera Scanner Section -->
        <div v-if="showCamera" class="mb-6 overflow-hidden rounded-xl border border-gray-200 shadow-sm relative">
          <qrcode-stream :constraints="{ facingMode: cameraFacingMode }" @detect="onDetect" @error="onError" class="w-full aspect-square md:aspect-video object-cover bg-black" />
          <div class="absolute top-4 right-4 z-10">
            <button @click="toggleCamera" class="p-2.5 bg-white/90 hover:bg-white rounded-full shadow-lg text-gray-800 backdrop-blur-md transition-transform active:scale-95" title="Switch Camera">
              <RefreshCw class="w-5 h-5" />
            </button>
          </div>
          <button @click="showCamera = false" class="w-full bg-gray-50 text-gray-600 py-3 text-sm font-medium border-t border-gray-200 hover:bg-gray-100 transition">Close Camera</button>
        </div>

        <form @submit.prevent="verifyTicketScan" class="space-y-4">
          <div class="relative">
            <input
              v-model="qrInput"
              type="text"
              placeholder="Paste QR Code Hash / Scan..."
              required
              class="w-full  border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition text-center font-mono"
            />
          </div>

          <div class="flex gap-2">
            <button type="submit" :disabled="verifying || !qrInput" class="flex-1 btn-primary py-3 text-sm flex items-center justify-center gap-2">
              <AppLoader v-if="verifying" size="sm" color="white" />
              <span>{{ verifying ? 'Verifying...' : 'Verify Ticket' }}</span>
            </button>
            <button type="button" @click="showCamera = !showCamera" class="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-200 transition" title="Scan with Camera">
              <Camera class="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      <!-- Result Card Feedback -->
      <div v-if="scanResult" class="glass-card rounded-2xl p-6 transition-all border-2" :class="scanResult.valid ? 'border-emerald-500/80 bg-emerald-950/20' : (scanResult.alreadyCheckedIn ? 'border-amber-500/80 bg-amber-950/20' : 'border-rose-500/80 bg-rose-950/20')">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold" :class="scanResult.valid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'">
            <CheckCircle v-if="scanResult.valid" class="w-6 h-6" />
            <AlertTriangle v-else-if="scanResult.alreadyCheckedIn" class="w-6 h-6" />
            <XCircle v-else class="w-6 h-6" />
          </div>

          <div class="flex-grow space-y-1">
            <h3 class="font-bold text-lg text-gray-900">
              {{ scanResult.message }}
            </h3>
            <p v-if="scanResult.attendeeName" class="text-sm font-semibold text-primary">
              Attendee: {{ scanResult.attendeeName }}
            </p>
            <p v-if="scanResult.tierName" class="text-xs text-gray-700">
              Ticket Tier: {{ scanResult.tierName }} ({{ scanResult.ticketNumber }})
            </p>
            <p v-if="scanResult.checkedInAt" class="text-[11px] text-gray-600 pt-2 border-t border-gray-200 mt-2">
              Scanned At: {{ new Date(scanResult.checkedInAt).toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Cute Pre-event Prompt Modal -->
    <div v-if="scanResult && scanResult.notStarted" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform scale-100 opacity-100 transition-all text-center border border-indigo-50">
        <div class="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-6">
          <CalendarDays class="w-8 h-8 text-primary" />
        </div>
        <h3 class="text-xl font-extrabold text-gray-900 mb-2">Hold your horses! 🐎</h3>
        <p class="text-sm text-gray-600 mb-8 leading-relaxed">
          The <strong>{{ scanResult.eventTitle || 'event' }}</strong> hasn't started yet! You cannot manually scan or check in attendees until the scheduled event start date and time.
        </p>
        <button 
          @click="scanResult = null" 
          class="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors focus:ring-4 focus:ring-gray-200"
        >
          Got it, I'll wait!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });

import { toast } from 'vue-sonner';
import { ref } from 'vue';
import { Search, CheckCircle, AlertTriangle, XCircle, Camera, RefreshCw, CalendarDays } from 'lucide-vue-next';
import { QrcodeStream } from 'vue-qrcode-reader';

const config = useRuntimeConfig();

const qrInput = ref('');
const verifying = ref(false);
const scanResult = ref(null);
const showCamera = ref(false);
const cameraFacingMode = ref('environment');

function toggleCamera() {
  cameraFacingMode.value = cameraFacingMode.value === 'environment' ? 'user' : 'environment';
}

function onDetect(detectedCodes) {
  if (detectedCodes && detectedCodes.length > 0) {
    qrInput.value = detectedCodes[0].rawValue;
    showCamera.value = false;
    verifyTicketScan();
  }
}

function onError(error) {
  toast.error(`Camera error: ${error.message}`);
}

async function verifyTicketScan() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) {
    toast.success('Please log in to use gate scanner.');
    useRouter().push('/login');
    return;
  }

  verifying.value = true;
  scanResult.value = null;

  try {
    const res = await fetch(`${config.public.apiBase}/tickets/verify-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ qrCodeHash: qrInput.value.trim() }),
    });

    if (res.ok) {
      scanResult.value = await res.json();
    } else {
      const err = await res.json();
      scanResult.value = {
        valid: false,
        message: err.message || 'Invalid QR code or ticket scan failed',
      };
    }
  } catch (err) {
    scanResult.value = {
      valid: false,
      message: 'Network error verifying ticket',
    };
  } finally {
    verifying.value = false;
  }
}
</script>
