<template>
  <div >
    <!-- Top Header Navigation -->
    

    <!-- Main Content -->
    <main class="w-full space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-gray-900">Events Management</h1>
          <p class="text-xs text-gray-600 mt-1">Manage published events, view attendee rosters, or update event statuses.</p>
        </div>

        <div class="flex items-center gap-3">
          <input
            v-model="search"
            type="text"
            placeholder="Filter events..."
            class=" border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      </div>

      <!-- Advanced Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p class="text-xs font-semibold text-gray-500 uppercase">Total Events</p>
          <h3 class="text-2xl font-extrabold text-gray-900 mt-1">{{ stats.totalEvents }}</h3>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p class="text-xs font-semibold text-gray-500 uppercase">Active Published Events</p>
          <h3 class="text-2xl font-extrabold text-emerald-600 mt-1">{{ stats.activeEvents }}</h3>
        </div>
      </div>

      <!-- Events Table -->
      <TableLoadingState v-if="loading" message="Loading events..." />

      <TableEmptyState v-else-if="filteredEvents.length === 0" title="No Events Found" message="Create an event to start selling tickets." />

      <div v-else class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-4 py-4 w-12 text-center">S/N</th>
                <th class="px-6 py-4">Event</th>
                <th class="px-6 py-4 text-center">Tickets Sold</th>
                <th class="px-6 py-4 text-center">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="(ev, index) in events" :key="ev._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-4 py-4 text-center font-semibold text-gray-500 text-sm">
                  {{ (page - 1) * limit + index + 1 }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <img
                      :src="ev.carouselImages && ev.carouselImages.length ? ev.carouselImages[0] : ev.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=100&q=80'"
                      :alt="ev.title"
                      class="w-16 h-12 rounded-lg object-cover border border-gray-200"
                    />
                    <div>
                      <p class="font-bold text-gray-900 max-w-xs truncate" :title="ev.title">{{ ev.title }}</p>
                      <p class="text-xs text-gray-500 mt-1 flex items-center gap-1"><Calendar class="w-3 h-3" /> {{ new Date(ev.startDate).toLocaleDateString() }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-center font-semibold text-gray-900">
                  {{ ev.totalSold || 0 }} <span class="text-gray-400">/ {{ ev.totalCapacity || 0 }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {{ ev.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <NuxtLink :to="`/dashboard/events/${ev._id}/attendees`" class="btn-secondary text-[11px] flex items-center gap-1.5 !py-1.5 !px-3" title="Attendee Roster">
                      <ClipboardList class="w-3.5 h-3.5" /> Roster
                    </NuxtLink>
                    <NuxtLink :to="`/dashboard/events/${ev._id}/edit`" class="text-[11px] text-primary hover:bg-primary/10 border border-primary/30 font-semibold flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition" title="Edit Event">
                      <Pencil class="w-3.5 h-3.5" /> Edit
                    </NuxtLink>
                    <button @click="deleteEvent(ev._id)" class="text-[11px] text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 font-semibold flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition" title="Delete Event">
                      <Trash2 class="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination Controls -->
        <div v-if="events.length > 0" class="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-500">
            Showing <span class="font-bold text-gray-900">{{ (page - 1) * limit + 1 }}</span> to <span class="font-bold text-gray-900">{{ (page - 1) * limit + events.length }}</span> of <span class="font-bold text-gray-900">{{ totalRecords }}</span> events
          </div>
          <div class="flex items-center gap-2">
            <button @click="changePage(page - 1)" :disabled="page <= 1" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <span class="text-sm text-gray-700 font-semibold px-2">Page {{ page }} of {{ totalPages }}</span>
            <button @click="changePage(page + 1)" :disabled="page >= totalPages" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
      <input type="file" ref="imageUploadInput" class="hidden" accept="image/*" @change="handleImageUpload" />
    </main>
  </div>

  <!-- Confirmation Modal -->
  <div v-if="confirmModal.show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div class="bg-white border border-gray-200 w-full max-w-sm p-6 rounded-2xl shadow-xl">
      <h3 class="text-lg font-bold text-gray-900 mb-2">{{ confirmModal.title }}</h3>
      <p class="text-sm text-gray-500 mb-6">{{ confirmModal.message }}</p>
      <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
        <button @click="confirmModal.show = false" class="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl sm:rounded-lg hover:bg-gray-200 transition">Cancel</button>
        <button @click="confirmModal.onConfirm(); confirmModal.show = false" class="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-semibold text-white rounded-xl sm:rounded-lg transition" :class="confirmModal.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-600'">{{ confirmModal.confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });


import { toast } from 'vue-sonner';
import { ref, computed, onMounted } from 'vue';
import { Calendar, ClipboardList, Pencil, Trash2 } from 'lucide-vue-next';

const config = useRuntimeConfig();

const events = ref([]);
const loading = ref(true);
const search = ref('');
const imageUploadInput = ref(null);
const currentEditingEventId = ref(null);

const page = ref(1);
const limit = ref(20);
const totalPages = ref(1);
const totalRecords = ref(0);

const stats = ref({
  totalEvents: 0,
  activeEvents: 0
});

function changePage(newPage) {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  loadEvents();
}

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  onConfirm: () => {},
});

function showConfirm({ title, message, confirmText, onConfirm }) {
  confirmModal.value = { show: true, title, message, confirmText: confirmText || 'Confirm', onConfirm };
}

const filteredEvents = computed(() => {
  if (!search.value) return events.value;
  return events.value.filter(e => e.title.toLowerCase().includes(search.value.toLowerCase()));
});

async function loadEvents() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) {
    useRouter().push('/login');
    return;
  }

  loading.value = true;
  try {
    const query = new URLSearchParams({
      page: page.value,
      limit: limit.value,
      search: search.value,
    });
    const res = await fetch(`${config.public.apiBase}/events/admin/my-events?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.metadata) {
        events.value = data.data;
        totalPages.value = data.metadata.lastPage;
        totalRecords.value = data.metadata.total;
        stats.value = data.metadata.statistics;
      } else {
        events.value = data;
      }
    }
  } catch (err) {
    console.error('Error loading events:', err);
  } finally {
    loading.value = false;
  }
}

watch(search, () => {
  page.value = 1;
  loadEvents();
});

async function deleteEvent(eventId) {
  showConfirm({
    title: 'Delete Event',
    message: 'Are you sure you want to delete this event and all its ticket tiers? This action cannot be undone.',
    confirmText: 'Delete Event',
    onConfirm: async () => {
      const token = localStorage.getItem('ticketr_admin_token');
      try {
        const res = await fetch(`${config.public.apiBase}/events/${eventId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          toast.success('Event deleted successfully');
          await loadEvents();
        }
      } catch (e) {
        toast.error('Failed to delete event');
      }
    }
  });
}

function triggerImageUpload(eventId) {
  currentEditingEventId.value = eventId;
  if (imageUploadInput.value) {
    imageUploadInput.value.click();
  }
}

async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file || !currentEditingEventId.value) return;
  
  const token = localStorage.getItem('ticketr_admin_token');
  const formData = new FormData();
  formData.append('banner', file);

  try {
    const res = await fetch(`${config.public.apiBase}/events/${currentEditingEventId.value}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    
    if (res.ok) {
      toast.success('Event image updated successfully!');
      await loadEvents();
    } else {
      const err = await res.json();
      toast.error(err.message || 'Failed to update image');
    }
  } catch (e) {
    console.error(e);
    toast.error('Network error while updating image');
  } finally {
    // Reset file input
    e.target.value = null;
    currentEditingEventId.value = null;
  }
}

onMounted(() => {
  loadEvents();
});
</script>
