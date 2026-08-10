<template>
  <div>
    <!-- Top Bar -->
    

    <main class="max-w-xl mx-auto px-4 md:px-6 py-12 flex-grow w-full space-y-6">
      <div class="glass-card rounded-2xl p-8 border-primary/30 text-center">
        <div class="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search class="w-8 h-8" />
        </div>
        <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Gate Entry Scanner</h1>
        <p class="text-xs text-gray-600 mb-6">Scan QR code or paste HMAC hash token from attendee's e-ticket.</p>

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

          <button type="submit" :disabled="verifying || !qrInput" class="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2">
            <span v-if="verifying" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ verifying ? 'Verifying...' : 'Verify Ticket' }}</span>
          </button>
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
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });

import { toast } from 'vue-sonner';
import { ref } from 'vue';
import { Search, CheckCircle, AlertTriangle, XCircle } from 'lucide-vue-next';

const config = useRuntimeConfig();

const qrInput = ref('');
const verifying = ref(false);
const scanResult = ref(null);

async function verifyTicketScan() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) {
    toast.success('Please log in to use gate scanner.');
    useRouter().push('/admin/login');
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
