<template>
  <div class="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Broadcast Communications</h1>
      <p class="text-sm text-gray-500 mt-1">Send emails to your attendees directly from the platform.</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
      <form @submit.prevent="sendBroadcast" class="space-y-6">
        
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">Target Audience <span class="text-red-500">*</span></label>
          <select v-model="form.audience" required class="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer">
            <option value="" disabled>Select Audience...</option>
            <option value="all">All Attendees (Across all events)</option>
            <option value="event">Attendees of a Specific Event</option>
            <option value="custom">Custom Email List</option>
          </select>
        </div>

        <div v-if="form.audience === 'event'" class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">Select Event <span class="text-red-500">*</span></label>
          <select v-model="form.eventId" required class="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer">
            <option value="" disabled>Choose an event...</option>
            <option v-for="event in events" :key="event._id" :value="event._id">
              {{ event.title }}
            </option>
          </select>
        </div>

        <div v-if="form.audience === 'custom'" class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">Custom Email Addresses <span class="text-red-500">*</span></label>
          <textarea 
            v-model="form.customEmailsInput" 
            required 
            rows="3" 
            placeholder="e.g. user1@example.com, user2@example.com"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y"
          ></textarea>
          <p class="text-xs text-gray-500">Separate multiple emails with commas.</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">Subject Line <span class="text-red-500">*</span></label>
          <input 
            type="text" 
            v-model="form.subject" 
            required 
            placeholder="Important Update Regarding Your Ticket"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700">Email Body <span class="text-red-500">*</span></label>
          <textarea 
            v-model="form.message" 
            required 
            rows="8" 
            placeholder="Write your message here..."
            class="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y"
          ></textarea>
          <p class="text-xs text-gray-500">Line breaks will be preserved in the email. HTML is not supported.</p>
        </div>

        <div class="pt-4 flex items-center justify-end border-t border-gray-100">
          <button 
            type="submit" 
            :disabled="loading || !isFormValid" 
            class="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>{{ loading ? 'Sending Broadcast...' : 'Send Broadcast' }}</span>
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRuntimeConfig } from '#app';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const config = useRuntimeConfig();

const events = ref([]);
const loading = ref(false);

const form = ref({
  audience: '',
  eventId: '',
  customEmailsInput: '',
  subject: '',
  message: ''
});

const isFormValid = computed(() => {
  if (!form.value.audience || !form.value.subject || !form.value.message) return false;
  if (form.value.audience === 'event' && !form.value.eventId) return false;
  if (form.value.audience === 'custom' && !form.value.customEmailsInput) return false;
  return true;
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
      events.value = await res.json();
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

const sendBroadcast = async () => {
  if (!isFormValid.value) return;
  
  const confirmMsg = "Are you sure you want to broadcast this email? This action cannot be undone.";
  if (!window.confirm(confirmMsg)) return;

  loading.value = true;
  
  let customEmails = [];
  if (form.value.audience === 'custom') {
    customEmails = form.value.customEmailsInput.split(',').map(e => e.trim()).filter(e => e);
  }

  try {
    const payload = {
      audience: form.value.audience,
      eventId: form.value.audience === 'event' ? form.value.eventId : undefined,
      customEmails: form.value.audience === 'custom' ? customEmails : undefined,
      subject: form.value.subject,
      message: form.value.message
    };

    const res = await fetch(`${config.public.apiBase}/communications/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ticketr_admin_token')}`
      },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
         toast.success(data.message || 'Broadcast sent successfully!');
         // Reset form
         form.value.audience = '';
         form.value.eventId = '';
         form.value.customEmailsInput = '';
         form.value.subject = '';
         form.value.message = '';
      } else {
         toast.error(data.message || 'Failed to send broadcast');
      }
    } else {
      const err = await res.json();
      toast.error(err.message || 'Error occurred while broadcasting.');
    }
  } catch (error) {
    toast.error('Network error. Check your connection.');
  } finally {
    loading.value = false;
  }
};
</script>
