<template>
  <div>
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

      <!-- Events Grid/List -->
      <div v-if="loading" class="text-center py-16 text-gray-500 text-sm">
        Loading events...
      </div>

      <div v-else-if="filteredEvents.length === 0" class="glass-card rounded-2xl p-12 text-center max-w-md mx-auto">
        <p class="text-gray-900 font-bold text-base mb-2">No Events Found</p>
        <p class="text-gray-600 text-xs mb-6">Create an event to start selling tickets.</p>
        <NuxtLink to="/admin/events/create" class="btn-primary text-xs">Create Event</NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="ev in filteredEvents" :key="ev._id" class="glass-card rounded-2xl overflow-hidden flex flex-col border-gray-200">
          <div class="relative h-40 ">
            <img
              :src="ev.carouselImages && ev.carouselImages.length ? ev.carouselImages[0] : ev.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'"
              :alt="ev.title"
              class="w-full h-full object-cover"
            />
            <div class="absolute top-3 right-3">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                {{ ev.status }}
              </span>
            </div>
          </div>

          <div class="p-6 flex flex-col flex-grow">
            <span class="text-xs text-primary font-semibold mb-1 flex items-center gap-1"><Calendar class="w-3 h-3" /> {{ new Date(ev.startDate).toLocaleDateString() }}</span>
            <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{{ ev.title }}</h3>
            <p class="text-xs text-gray-600 line-clamp-2 mb-4">{{ ev.description }}</p>

            <div class="/60 rounded-xl p-3 border border-gray-200 flex items-center justify-between mb-4 mt-auto">
              <span class="text-xs text-gray-600">Tickets Sold:</span>
              <span class="font-bold text-gray-900 text-sm">{{ ev.totalSold || 0 }} / {{ ev.totalCapacity || 0 }}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/80">
              <NuxtLink :to="`/admin/events/${ev._id}/attendees`" class="btn-secondary text-[11px] !py-2 text-center block">
                📋 Attendee Roster
              </NuxtLink>
              <NuxtLink :to="`/admin/events/${ev._id}/edit`" class="text-[11px] text-center text-primary hover:bg-primary/10 border border-primary/30 font-semibold py-2 rounded-xl transition">
                ✏️ Edit Event
              </NuxtLink>
              <button @click="deleteEvent(ev._id)" class="col-span-2 text-[11px] text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 font-semibold py-2 rounded-xl transition">
                🗑 Delete Event
              </button>
            </div>
          </div>
        </div>
      </div>
      <input type="file" ref="imageUploadInput" class="hidden" accept="image/*" @change="handleImageUpload" />
    </main>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });

import { toast } from 'vue-sonner';
import { ref, computed, onMounted } from 'vue';
import { Calendar } from 'lucide-vue-next';

const config = useRuntimeConfig();

const events = ref([]);
const loading = ref(true);
const search = ref('');
const imageUploadInput = ref(null);
const currentEditingEventId = ref(null);

const filteredEvents = computed(() => {
  if (!search.value) return events.value;
  return events.value.filter(e => e.title.toLowerCase().includes(search.value.toLowerCase()));
});

async function loadEvents() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) {
    useRouter().push('/admin/login');
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

async function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to delete this event and its ticket tiers?')) return;
  const token = localStorage.getItem('ticketr_admin_token');
  try {
    const res = await fetch(`${config.public.apiBase}/events/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await loadEvents();
    }
  } catch (e) {
    console.error(e);
  }
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
