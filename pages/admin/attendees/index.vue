<template>
  <div>
    <!-- Main Content -->
    <main class="w-full space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-gray-900">Attendees Management</h1>
          <p class="text-xs text-gray-600 mt-1">Select an event below to view its attendee roster, check-in statuses, and more.</p>
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

      <!-- Events Grid -->
      <TableLoadingState v-if="loading" message="Loading events..." />
      <TableEmptyState v-else-if="filteredEvents.length === 0" title="No Events Found" message="Create an event to start managing attendees." />

      <div v-else class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Event</th>
                <th class="px-6 py-4 text-center">Tickets Sold</th>
                <th class="px-6 py-4 text-center">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="ev in filteredEvents" :key="ev._id" class="hover:bg-gray-50 transition-colors duration-150">
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
                  <NuxtLink :to="`/dashboard/events/${ev._id}/attendees`" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-indigo-700 transition" title="View Attendee Roster">
                    <Users class="w-4 h-4" /> View Attendees
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });


import { ref, computed, onMounted } from 'vue';
import { Calendar, Users } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const config = useRuntimeConfig();
const router = useRouter();

const events = ref([]);
const loading = ref(true);
const search = ref('');

const filteredEvents = computed(() => {
  if (!search.value) return events.value;
  return events.value.filter(e => e.title.toLowerCase().includes(search.value.toLowerCase()));
});

async function loadEvents() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) {
    router.push('/login');
    return;
  }

  loading.value = true;
  try {
    const res = await fetch(`${config.public.apiBase}/events/admin/my-events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      events.value = await res.json();
    }
  } catch (err) {
    console.error('Error loading events:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadEvents();
});
</script>
