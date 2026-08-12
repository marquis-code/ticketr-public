<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
    <div class="w-full max-w-md">
      <!-- Verifying state -->
      <div v-if="verifying" class="glass-card rounded-2xl p-12 text-center shadow-lg">
        <AppLoader size="xl" color="indigo" class="inline-block" />
        <h3 class="text-xl font-bold text-gray-900 mt-6">Verifying Ticket...</h3>
        <p class="text-sm text-gray-600 mt-2">Checking validity and logging entry...</p>
      </div>

      <div v-else-if="needsConfirmation && scanResult" class="glass-card rounded-2xl p-8 shadow-lg text-center border-indigo-500/50">
        <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner bg-indigo-100 text-indigo-600">
          <UserCheck class="w-10 h-10" />
        </div>
        
        <h2 class="text-2xl font-extrabold text-gray-900 mb-2">Confirm Check-In</h2>
        <p class="text-base text-gray-700 font-medium mb-6">Review attendee details before checking them in.</p>

        <div class="bg-gray-50 rounded-xl p-4 text-left border border-gray-100 mb-6">
          <p class="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Attendee</p>
          <p class="font-bold text-gray-900 text-lg">{{ scanResult.attendeeName }}</p>
          
          <div class="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ticket Tier</p>
              <p class="font-semibold text-gray-800 text-sm">{{ scanResult.tierName }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ticket Number</p>
              <p class="font-mono text-gray-800 text-xs mt-0.5 bg-gray-200 inline-block px-1.5 py-0.5 rounded">{{ scanResult.ticketNumber }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button @click="verifyTicket(true)" :disabled="verifying" class="btn-primary w-full py-3 flex justify-center items-center gap-2">
            <AppLoader v-if="verifying" size="sm" color="white" />
            Check In Attendee
          </button>
          <button @click="goHome" class="w-full py-3 text-sm font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
        </div>
      </div>

      <div v-else-if="scanResult" class="glass-card rounded-2xl p-8 shadow-lg text-center" :class="scanResult.valid ? 'border-emerald-500/50' : 'border-rose-500/50'">
        <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner" :class="scanResult.valid ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'">
          <CheckCircle v-if="scanResult.valid" class="w-10 h-10" />
          <XCircle v-else class="w-10 h-10" />
        </div>
        
        <h2 class="text-2xl font-extrabold text-gray-900 mb-2">{{ scanResult.valid ? 'Access Granted' : 'Access Denied' }}</h2>
        <p class="text-base text-gray-700 font-medium mb-6">{{ scanResult.message }}</p>

        <div v-if="scanResult.attendeeName" class="bg-gray-50 rounded-xl p-4 text-left border border-gray-100 mb-6">
          <p class="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Attendee</p>
          <p class="font-bold text-gray-900 text-lg">{{ scanResult.attendeeName }}</p>
          
          <div class="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ticket Tier</p>
              <p class="font-semibold text-gray-800 text-sm">{{ scanResult.tierName }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ticket Number</p>
              <p class="font-mono text-gray-800 text-xs mt-0.5 bg-gray-200 inline-block px-1.5 py-0.5 rounded">{{ scanResult.ticketNumber }}</p>
            </div>
          </div>
        </div>

        <button @click="goHome" class="btn-primary w-full py-3">Return to Dashboard</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toast } from 'vue-sonner';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CheckCircle, XCircle, UserCheck } from 'lucide-vue-next';

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();

const verifying = ref(true);
const needsConfirmation = ref(false);
const scanResult = ref(null);

async function verifyTicket(commit = false) {
  verifying.value = true;
  const hash = route.params.hash;
  const token = localStorage.getItem('ticketr_admin_token');
  
  if (!token) {
    toast.error('You must be logged in as an Admin to scan tickets. Redirecting to login...');
    router.push(`/admin/login?redirect=/admin/verify/${hash}`);
    return;
  }

  try {
    const res = await fetch(`${config.public.apiBase}/tickets/verify-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ qrCodeHash: hash, commit }),
    });

    if (res.ok) {
      const data = await res.json();
      scanResult.value = data;
      if (data.valid && !commit) {
        needsConfirmation.value = true;
      } else if (commit) {
        needsConfirmation.value = false;
        toast.success('Attendee checked in successfully!');
      }
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

function goHome() {
  router.push('/admin/scanner');
}

onMounted(() => {
  verifyTicket(false); // Fetch preview without committing check-in
});
</script>
