
<template>
  <div>
    <main class="max-w-5xl mx-auto px-4 md:px-6 py-10 flex-grow w-full space-y-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Internal & Special Tickets</h1>
          <p class="text-sm text-gray-500 mt-2 font-medium">Issue complimentary or internal tickets directly to Excos, VIPs, or partners.</p>
        </div>
        <div class="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200 shadow-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Bypasses payment gateway
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 relative overflow-visible">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-2xl"></div>
        <form @submit.prevent="generateTicket" class="p-8 sm:p-10 space-y-10">
          
          <!-- Event Details Section -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">1</div>
              <h2 class="text-lg font-bold text-gray-900">Event & Ticket Selection</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Select Event <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select v-model="form.eventId" required @change="fetchTiers" class="w-full text-base border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm appearance-none cursor-pointer">
                    <option value="" disabled>Choose an event...</option>
                    <option v-for="event in events" :key="event._id" :value="event._id">
                      {{ event.title }}
                    </option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Select Ticket Tier <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select v-model="form.tierId" required :disabled="!form.eventId" class="w-full text-base border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    <option value="" disabled>Choose a ticket tier...</option>
                    <option v-for="tier in activeTiers" :key="tier._id" :value="tier._id">
                      {{ tier.name }} — ₦{{ tier.price.toLocaleString() }}
                    </option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Attendee Details Section -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">2</div>
              <h2 class="text-lg font-bold text-gray-900">Attendee Information</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Full Name <span class="text-red-500">*</span></label>
                <input type="text" v-model="form.customerName" required placeholder="e.g. John Doe" class="w-full text-base border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm" />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Email Address <span class="text-red-500">*</span></label>
                <input type="email" v-model="form.customerEmail" required placeholder="e.g. john@example.com" class="w-full text-base border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm" />
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Department or Organization</label>
                <input type="text" v-model="form.departmentCode" placeholder="e.g. TVESA, NAAES (Optional)" class="w-full text-base border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm" />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700">Reason for Issuance <span class="text-red-500">*</span></label>
                <input type="text" v-model="form.reason" required placeholder="e.g. Exco Registration, VIP Guest" class="w-full text-base border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm" />
              </div>
            </div>
          </div>

          <div class="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-sm text-gray-500 flex-1">
              The ticket will be instantly generated and emailed to the attendee.
            </div>
            <button type="submit" :disabled="loading || !form.eventId || !form.tierId" class="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-xl text-base font-bold hover:bg-indigo-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900 disabled:hover:translate-y-0">
              <svg v-if="loading" class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
              {{ loading ? 'Generating Ticket...' : 'Generate Internal Ticket' }}
            </button>
          </div>
        </form>
      </div>
      
      <!-- Notifications -->
      <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-4">
        <div v-if="successMessage" class="bg-emerald-50 border border-emerald-200 shadow-sm p-5 rounded-2xl flex items-start gap-3">
          <div class="bg-emerald-100 p-1.5 rounded-full text-emerald-600 mt-0.5"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>
          <div>
            <h3 class="text-sm font-bold text-emerald-800">Ticket Issued Successfully</h3>
            <p class="text-sm text-emerald-700 mt-1">{{ successMessage }}</p>
          </div>
        </div>
      </transition>
      
      <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-4">
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 shadow-sm p-5 rounded-2xl flex items-start gap-3">
          <div class="bg-red-100 p-1.5 rounded-full text-red-600 mt-0.5"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>
          <div>
            <h3 class="text-sm font-bold text-red-800">Error Issuing Ticket</h3>
            <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRuntimeConfig } from '#app';

definePageMeta({
  layout: 'default'
});

const config = useRuntimeConfig();

const form = ref({
  eventId: '',
  tierId: '',
  customerName: '',
  customerEmail: '',
  departmentCode: '',
  reason: 'Internal Issuance'
});

const events = ref([]);
const tiers = ref([]);
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const activeTiers = computed(() => {
  return tiers.value.filter(t => t.eventId === form.value.eventId);
});

onMounted(async () => {
  await fetchEvents();
});

const fetchEvents = async () => {
  try {
    const res = await fetch(`${config.public.apiBase}/events/admin/my-events`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      events.value = data;
    } else {
       const res2 = await fetch(`${config.public.apiBase}/events/tenant`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
        }
      });
      if (res2.ok) {
         events.value = await res2.json();
      }
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

const fetchTiers = async () => {
  form.value.tierId = '';
  if (!form.value.eventId) return;
  try {
    const res = await fetch(`${config.public.apiBase}/events/${form.value.eventId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      tiers.value = data.tiers || [];
    }
  } catch (error) {
    console.error('Error fetching tiers:', error);
  }
};

const generateTicket = async () => {
  loading.value = true;
  successMessage.value = '';
  errorMessage.value = '';
  
  try {
    const res = await fetch(`${config.public.apiBase}/orders/admin/internal-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
      },
      body: JSON.stringify(form.value)
    });
    
    if (res.ok) {
      successMessage.value = `Ticket successfully generated for ${form.value.customerName}! The barcode receipt has been dispatched to ${form.value.customerEmail}.`;
      form.value.customerName = '';
      form.value.customerEmail = '';
      form.value.departmentCode = '';
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        successMessage.value = '';
      }, 5000);
    } else {
      const errorData = await res.json();
      errorMessage.value = errorData.message || 'Failed to generate ticket.';
    }
  } catch (error) {
    console.error('Error generating ticket:', error);
    errorMessage.value = 'Network error while attempting to generate ticket. Check your connection.';
  } finally {
    loading.value = false;
  }
};
</script>
