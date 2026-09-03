<template>
  <div >
    <!-- Header -->
    

    <main class="w-full space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-gray-900">{{ eventInfo?.title || 'Event Roster' }}</h1>
          <p class="text-xs text-gray-600 mt-1">Real-time attendee list and gate check-in status.</p>
        </div>

        <div class="flex items-center gap-3">
          <button @click="exportCSV" class="btn-primary text-xs flex items-center gap-2 !py-2 !px-4">
            <Download class="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>



      <!-- Advanced Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p class="text-xs font-semibold text-gray-500 uppercase">Total Tickets Sold</p>
          <h3 class="text-2xl font-extrabold text-gray-900 mt-1">{{ stats.totalTickets }}</h3>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p class="text-xs font-semibold text-gray-500 uppercase">Checked In</p>
          <h3 class="text-2xl font-extrabold text-emerald-600 mt-1">{{ stats.checkedInCount }}</h3>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p class="text-xs font-semibold text-gray-500 uppercase">Pending Check-in</p>
          <h3 class="text-2xl font-extrabold text-amber-600 mt-1">{{ stats.pendingCount }}</h3>
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
        <TableLoadingState v-if="loading" message="Loading attendees..." />
        <TableEmptyState v-else-if="attendees.length === 0" title="No Attendees Found" message="No attendees found matching filter criteria." />

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-4 py-4 w-12 text-center">S/N</th>
                <th class="px-6 py-4">Ticket #</th>
                <th class="px-6 py-4">Attendee Name</th>
                <th class="px-6 py-4">Email</th>
                <th class="px-6 py-4">Tier</th>
                <th class="px-6 py-4">Email Status</th>
                <th class="px-6 py-4">Check-in Status</th>
                <th class="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="(att, index) in attendees" :key="att._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-4 py-4 text-center font-semibold text-gray-500 text-sm">
                  {{ (page - 1) * limit + index + 1 }}
                </td>
                <td class="px-6 py-4 font-mono text-xs text-primary">{{ att.ticketNumber }}</td>
                <td class="px-6 py-4 font-semibold text-gray-900">
                  <div class="flex items-center gap-2">
                    <span>{{ getCleanName(att.attendeeName) }}</span>
                    <span v-if="getGenderTag(att.attendeeName) === 'Male'" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider border border-blue-200">Male</span>
                    <span v-if="getGenderTag(att.attendeeName) === 'Female'" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-100 text-pink-700 uppercase tracking-wider border border-pink-200">Female</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-xs text-gray-600">{{ att.attendeeEmail }}</td>
                <td class="px-6 py-4 text-xs text-gray-700">{{ att.tierId?.name || 'Standard' }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="att.emailSent ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'"
                    class="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  >
                    {{ att.emailSent ? 'Sent' : 'Failed' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="att.status === 'CHECKED_IN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'"
                    class="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  >
                    {{ att.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button
                    v-if="!att.emailSent"
                    @click="resendEmail(att)"
                    class="btn-primary text-[10px] !py-1 !px-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-none"
                    title="Resend ticket email"
                  >
                    Resend Email
                  </button>
                  <button
                    @click="openUpdateEmailModal(att)"
                    class="btn-secondary text-[10px] !py-1 !px-2 border border-gray-200 text-gray-600 hover:bg-gray-100"
                    title="Update email & resend"
                  >
                    Update Email
                  </button>
                  <button
                    @click="manualCheckIn(att)"
                    :disabled="att.status === 'CHECKED_IN'"
                    class="btn-secondary text-[10px] !py-1 !px-2 disabled:opacity-40"
                  >
                    {{ att.status === 'CHECKED_IN' ? 'Checked In' : 'Manual Check-in' }}
                  </button>
                  <button
                    @click="openChangeTierModal(att)"
                    :disabled="att.status === 'CHECKED_IN'"
                    class="btn-primary text-[10px] !py-1 !px-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 shadow-none disabled:opacity-40"
                    title="Change ticket tier"
                  >
                    Change Tier
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination Controls -->
        <div v-if="attendees?.length > 0" class="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-500">
            Showing <span class="font-bold text-gray-900">{{ (page - 1) * limit + 1 }}</span> to <span class="font-bold text-gray-900">{{ (page - 1) * limit + attendees?.length }}</span> of <span class="font-bold text-gray-900">{{ totalRecords }}</span> attendees
          </div>
          <div class="flex items-center gap-2">
            <button @click="changePage(page - 1)" :disabled="page <= 1" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <span class="text-sm text-gray-700 font-semibold px-2">Page {{ page }} of {{ totalPages }}</span>
            <button @click="changePage(page + 1)" :disabled="page >= totalPages" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
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
    
    <!-- Update Email Modal -->
    <div v-if="updateEmailModal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform scale-100 opacity-100 transition-all border border-indigo-50">
        <h3 class="text-xl font-extrabold text-gray-900 mb-2">Update Email</h3>
        <p class="text-xs text-gray-600 mb-4">Update the email address for ticket <strong>{{ updateEmailModal.ticket.ticketNumber }}</strong> and resend it.</p>
        
        <input 
          v-model="updateEmailModal.newEmail" 
          type="email" 
          placeholder="New Email Address" 
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 mb-4 focus:outline-none focus:border-primary"
        />

        <div class="flex gap-3">
          <button @click="updateEmailModal.show = false" class="w-1/2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button @click="submitUpdateEmail" :disabled="updateEmailModal.submitting || !updateEmailModal.newEmail" class="w-1/2 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition disabled:opacity-50">
            {{ updateEmailModal.submitting ? 'Sending...' : 'Update & Resend' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Change Tier Modal -->
    <div v-if="changeTierModal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform scale-100 opacity-100 transition-all border border-indigo-50">
        <h3 class="text-xl font-extrabold text-gray-900 mb-2">Change Ticket Tier</h3>
        <p class="text-xs text-gray-600 mb-4">Select a new tier for ticket <strong>{{ changeTierModal.ticket.ticketNumber }}</strong>.</p>
        
        <select 
          v-model="changeTierModal.newTierId" 
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 mb-4 focus:outline-none focus:border-primary bg-gray-50"
        >
          <option value="" disabled>Select new tier</option>
          <option v-for="tier in tiers" :key="tier._id" :value="tier._id" :disabled="tier._id === changeTierModal.ticket.tierId?._id">
            {{ tier.name }} - ₦{{ tier.price.toLocaleString() }}
          </option>
        </select>

        <div class="flex gap-3">
          <button @click="changeTierModal.show = false" class="w-1/2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button @click="submitChangeTier" :disabled="changeTierModal.submitting || !changeTierModal.newTierId" class="w-1/2 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition disabled:opacity-50">
            {{ changeTierModal.submitting ? 'Updating...' : 'Change Tier' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });


import { ref, computed, onMounted } from 'vue';
import { Download, CalendarDays } from 'lucide-vue-next';

const config = useRuntimeConfig();
const route = useRoute();

const eventId = ref(route.params.id);
const eventInfo = ref(null);
const attendees = ref([]);
const loading = ref(true);
const showPreEventPrompt = ref(false);

const updateEmailModal = ref({
  show: false,
  ticket: null,
  newEmail: '',
  submitting: false,
});

const changeTierModal = ref({
  show: false,
  ticket: null,
  newTierId: '',
  submitting: false,
});

const searchQuery = ref('');
const filterStatus = ref('ALL');
const tiers = ref([]);

const page = ref(1);
const limit = ref(20);
const totalPages = ref(1);
const totalRecords = ref(0);

const stats = ref({
  totalTickets: 0,
  checkedInCount: 0,
  pendingCount: 0,
});

function changePage(newPage) {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  loadAttendees();
}

watch([searchQuery, filterStatus], () => {
  page.value = 1;
  loadAttendees();
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

async function loadAttendees() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) return;

  loading.value = true;
  try {
    const query = new URLSearchParams({
      page: page.value,
      limit: limit.value,
      search: searchQuery.value,
      status: filterStatus.value
    });
    
    const res = await fetch(`${config.public.apiBase}/events/${eventId.value}/attendees?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      eventInfo.value = data.event;
      if (data.attendees.metadata) {
        attendees.value = data.attendees.data || [];
        totalPages.value = data.attendees.metadata.lastPage;
        totalRecords.value = data.attendees.metadata.total;
        stats.value = data.attendees.metadata.statistics;
      } else {
        attendees.value = data.attendees || [];
      }
    }
    
    // Fetch tiers
    const resEvent = await fetch(`${config.public.apiBase}/events/${eventId.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resEvent.ok) {
      const eventData = await resEvent.json();
      tiers.value = eventData.tiers || [];
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

async function resendEmail(ticket) {
  const token = localStorage.getItem('ticketr_admin_token');
  try {
    const res = await fetch(`${config.public.apiBase}/tickets/${ticket._id}/resend-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const data = await res.json();
      ticket.emailSent = data.emailSent;
      alert('Email sent successfully!');
    } else {
      alert('Failed to send email.');
    }
  } catch (e) {
    console.error(e);
    alert('An error occurred while resending email.');
  }
}

function openUpdateEmailModal(ticket) {
  updateEmailModal.value = {
    show: true,
    ticket,
    newEmail: ticket.attendeeEmail || '',
    submitting: false,
  };
}

async function submitUpdateEmail() {
  const modal = updateEmailModal.value;
  if (!modal.newEmail) return;

  const token = localStorage.getItem('ticketr_admin_token');
  modal.submitting = true;
  
  try {
    const res = await fetch(`${config.public.apiBase}/tickets/${modal.ticket._id}/resend-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newEmail: modal.newEmail }),
    });
    
    if (res.ok) {
      const data = await res.json();
      modal.ticket.attendeeEmail = data.attendeeEmail;
      modal.ticket.emailSent = data.emailSent;
      modal.show = false;
      alert('Email updated and resent successfully!');
    } else {
      alert('Failed to update and resend email.');
    }
  } catch (e) {
    console.error(e);
    alert('An error occurred.');
  } finally {
    modal.submitting = false;
  }
}

function openChangeTierModal(ticket) {
  changeTierModal.value = {
    show: true,
    ticket,
    newTierId: '',
    submitting: false,
  };
}

async function submitChangeTier() {
  const modal = changeTierModal.value;
  if (!modal.newTierId) return;

  const token = localStorage.getItem('ticketr_admin_token');
  modal.submitting = true;
  
  try {
    const res = await fetch(`${config.public.apiBase}/tickets/${modal.ticket._id}/change-tier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newTierId: modal.newTierId }),
    });
    
    if (res.ok) {
      const data = await res.json();
      modal.show = false;
      alert(`Tier changed successfully! Price difference: ₦${data.priceDifference.toLocaleString()}`);
      loadAttendees();
    } else {
      const err = await res.json();
      alert(`Failed: ${err.message}`);
    }
  } catch (e) {
    console.error(e);
    alert('An error occurred while changing tier.');
  } finally {
    modal.submitting = false;
  }
}

function exportCSV() {
  if (attendees.value?.length === 0) return;
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
