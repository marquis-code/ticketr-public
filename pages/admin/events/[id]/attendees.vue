<template>
  <div>
    <!-- Header -->
    

    <main class="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex-grow w-full space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-gray-900">{{ eventInfo?.title || 'Event Roster' }}</h1>
          <p class="text-xs text-gray-600 mt-1">Real-time attendee list and gate check-in status.</p>
        </div>

        <div class="flex items-center gap-3">
          <button @click="exportCSV" class="btn-primary text-xs !py-2 !px-4">
            📥 Export CSV
          </button>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by attendee name or email..."
          class="w-full sm:w-80  border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <div class="flex items-center gap-2 text-xs">
          <span class="text-gray-600">Filter Status:</span>
          <button @click="filterStatus = 'ALL'" :class="filterStatus === 'ALL' ? 'bg-primary text-white' : ' text-gray-600'" class="px-3 py-1 rounded-lg border border-gray-200">All</button>
          <button @click="filterStatus = 'CHECKED_IN'" :class="filterStatus === 'CHECKED_IN' ? 'bg-primary text-white' : ' text-gray-600'" class="px-3 py-1 rounded-lg border border-gray-200">Checked In</button>
          <button @click="filterStatus = 'ISSUED'" :class="filterStatus === 'ISSUED' ? 'bg-primary text-white' : ' text-gray-600'" class="px-3 py-1 rounded-lg border border-gray-200">Not Checked In</button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div v-if="loading" class="text-center py-12 text-gray-500 text-sm">
          Loading attendees...
        </div>

        <div v-else-if="filteredAttendees.length === 0" class="text-center py-12 text-gray-500 text-sm">
          No attendees found matching filter criteria.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Ticket #</th>
                <th class="px-6 py-4">Attendee Name</th>
                <th class="px-6 py-4">Email</th>
                <th class="px-6 py-4">Tier</th>
                <th class="px-6 py-4">Check-in Status</th>
                <th class="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="att in filteredAttendees" :key="att._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 font-mono text-xs text-primary">{{ att.ticketNumber }}</td>
                <td class="px-6 py-4 font-semibold text-gray-900">{{ att.attendeeName }}</td>
                <td class="px-6 py-4 text-xs text-gray-600">{{ att.attendeeEmail }}</td>
                <td class="px-6 py-4 text-xs text-gray-700">{{ att.tierId?.name || 'Standard' }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="att.status === 'CHECKED_IN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
                    class="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  >
                    {{ att.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    @click="manualCheckIn(att)"
                    :disabled="att.status === 'CHECKED_IN'"
                    class="btn-secondary text-[11px] !py-1 !px-3 disabled:opacity-40"
                  >
                    {{ att.status === 'CHECKED_IN' ? 'Checked In' : 'Manual Check-in' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Cute Pre-event Prompt Modal -->
    <div v-if="showPreEventPrompt" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform scale-100 opacity-100 transition-all text-center border border-indigo-50">
        <div class="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-6">
          <CalendarDays class="w-8 h-8 text-primary" />
        </div>
        <h3 class="text-xl font-extrabold text-gray-900 mb-2">Hold your horses! 🐎</h3>
        <p class="text-sm text-gray-600 mb-8 leading-relaxed">
          The <strong>{{ eventInfo?.title }}</strong> event hasn't started yet! You cannot manually check in attendees until the scheduled event start date and time.
        </p>
        <button 
          @click="showPreEventPrompt = false" 
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

import { ref, computed, onMounted } from 'vue';
import { CalendarDays } from 'lucide-vue-next';

const config = useRuntimeConfig();
const route = useRoute();

const eventId = ref(route.params.id);
const eventInfo = ref(null);
const attendees = ref([]);
const loading = ref(true);
const showPreEventPrompt = ref(false);

const searchQuery = ref('');
const filterStatus = ref('ALL');

const filteredAttendees = computed(() => {
  return attendees.value.filter((a) => {
    const matchesSearch =
      a.attendeeName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      a.attendeeEmail.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      a.ticketNumber.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesStatus = filterStatus.value === 'ALL' || a.status === filterStatus.value;
    return matchesSearch && matchesStatus;
  });
});

async function loadAttendees() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) return;

  loading.value = true;
  try {
    const res = await fetch(`${config.public.apiBase}/events/${eventId.value}/attendees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      eventInfo.value = data.event;
      attendees.value = data.attendees || [];
    }
  } catch (err) {
    console.error('Error fetching attendees:', err);
  } finally {
    loading.value = false;
  }
}

async function manualCheckIn(ticket) {
  if (eventInfo.value && eventInfo.value.startDate && new Date() < new Date(eventInfo.value.startDate)) {
    showPreEventPrompt.value = true;
    return;
  }

  const token = localStorage.getItem('ticketr_admin_token');
  try {
    const res = await fetch(`${config.public.apiBase}/tickets/verify-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ qrCodeHash: ticket.qrCodeHash }),
    });
    if (res.ok) {
      ticket.status = 'CHECKED_IN';
    }
  } catch (e) {
    console.error(e);
  }
}

function exportCSV() {
  if (attendees.value.length === 0) return;
  const headers = ['Ticket Number', 'Attendee Name', 'Attendee Email', 'Tier', 'Status'];
  const rows = attendees.value.map(a => [
    a.ticketNumber,
    `"${a.attendeeName}"`,
    a.attendeeEmail,
    `"${a.tierId?.name || 'Standard'}"`,
    a.status
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `attendees-${eventId.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onMounted(() => {
  loadAttendees();
});
</script>
