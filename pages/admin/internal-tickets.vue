<template>
  <div>
    <main class="max-w-4xl mx-auto px-4 md:px-6 py-8 flex-grow w-full space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">Internal & Special Tickets</h1>
        <p class="text-xs text-gray-600 mt-1">Directly issue internal tickets (e.g. to Excos, VIPs, or partners) bypassing normal payment checks.</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form @submit.prevent="generateTicket" class="p-6 space-y-6">
          <div class="space-y-4">
            <h2 class="text-sm font-bold text-gray-900 border-b pb-2">Event Details</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Select Event</label>
                <select v-model="form.eventId" required @change="fetchTiers" class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option value="" disabled>Select an event</option>
                  <option v-for="event in events" :key="event._id" :value="event._id">
                    {{ event.title }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Select Ticket Tier</label>
                <select v-model="form.tierId" required :disabled="!form.eventId" class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  <option value="" disabled>Select a ticket tier</option>
                  <option v-for="tier in activeTiers" :key="tier._id" :value="tier._id">
                    {{ tier.name }} - ₦{{ tier.price }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h2 class="text-sm font-bold text-gray-900 border-b pb-2">Attendee Details</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" v-model="form.customerName" required placeholder="John Doe" class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" v-model="form.customerEmail" required placeholder="john@example.com" class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Department/Organization Code (Optional)</label>
                <input type="text" v-model="form.departmentCode" placeholder="e.g. TVESA, NAAES" class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Reason for Internal Issuance</label>
                <input type="text" v-model="form.reason" required placeholder="e.g. Exco Registration" class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" :disabled="loading" class="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
              <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ loading ? 'Generating Ticket...' : 'Generate Internal Ticket' }}
            </button>
          </div>
        </form>
      </div>
      
      <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
        <p class="text-sm text-green-700">{{ successMessage }}</p>
      </div>
      <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
        <p class="text-sm text-red-700">{{ errorMessage }}</p>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

definePageMeta({
  layout: 'default'
});

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
    const res = await fetch('http://localhost:3001/events/tenant', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      events.value = data;
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

const fetchTiers = async () => {
  form.value.tierId = '';
  if (!form.value.eventId) return;
  try {
    const res = await fetch(`http://localhost:3001/events/${form.value.eventId}`, {
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
    const res = await fetch('http://localhost:3001/orders/admin/internal-ticket', {
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
    } else {
      const errorData = await res.json();
      errorMessage.value = errorData.message || 'Failed to generate ticket.';
    }
  } catch (error) {
    console.error('Error generating ticket:', error);
    errorMessage.value = 'Network error while attempting to generate ticket.';
  } finally {
    loading.value = false;
  }
};
</script>
