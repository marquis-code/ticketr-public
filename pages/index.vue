<template>
  <div class="min-h-screen   flex flex-col">
    <!-- Navbar -->
    <header class="sticky top-0 z-40 glass-card border-b border-gray-200/80 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center font-bold text-xl text-gray-900 shadow-lg shadow-amber-500/20">
            {{ tenantInfo?.name ? tenantInfo.name.charAt(0) : '🎓' }}
          </div>
          <div>
            <span class="font-bold text-xl tracking-tight text-gray-900 block">{{ tenantInfo?.name || 'Education (ULSESA)' }}</span>
            <span class="text-xs text-amber-400 font-medium">Official Ticketing Portal</span>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <NuxtLink to="/my-tickets" class="text-xs font-semibold text-amber-400 hover:text-amber-300 transition">
            🎟️ Find My Tickets
          </NuxtLink>
          <div class="relative hidden sm:block">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search events..."
              class="/90 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all w-64"
            />
          </div>
          <a href="http://admin.localhost:3000" target="_blank" class="btn-secondary text-xs !py-2 !px-4">
            Organizer Admin ↗
          </a>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative overflow-hidden py-16 px-6 bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950">
      <div class="max-w-7xl mx-auto text-center relative z-10">
        <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-6">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          {{ tenantInfo?.name || 'Education (ULSESA)' }} Official Portal
        </span>
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
          Get Tickets for Upcoming <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Dinner & Awards Night 2026</span>
        </h1>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto mb-10">
          Instant QR-code ticket delivery to your email. Verified, fast, and 100% secure payments via Paystack.
        </p>
      </div>

      <!-- Background Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none"></div>
    </section>

    <!-- Events List -->
    <main class="max-w-7xl mx-auto px-6 pb-24 flex-grow w-full">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>Upcoming Events</span>
          <span class="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">{{ filteredEvents.length }}</span>
        </h2>

        <!-- Subdomain Switcher helper for testing dynamic tenant isolation -->
        <div class="flex items-center gap-2 text-xs text-gray-600">
          <span>Switch Client Portal:</span>
          <button @click="setTenantSlug('ulsesa')" :class="activeSlug === 'ulsesa' ? 'bg-amber-600 text-gray-900' : ' text-gray-700'" class="px-2.5 py-1 rounded-lg border border-gray-200 transition font-bold">ulsesa (Education)</button>
          <button @click="setTenantSlug('nursing')" :class="activeSlug === 'nursing' ? 'bg-indigo-600 text-gray-900' : ' text-gray-700'" class="px-2.5 py-1 rounded-lg border border-gray-200 transition">nursing</button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 3" :key="n" class="glass-card rounded-2xl p-4 animate-pulse h-80">
          <div class="bg-gray-100 rounded-xl h-44 mb-4"></div>
          <div class="h-5 bg-gray-100 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-100/60 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredEvents.length === 0" class="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
        <div class="w-16 h-16  rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-500 text-2xl">
          🎟️
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">No Active Events Found</h3>
        <p class="text-gray-600 text-sm mb-6">There are currently no published events listed for this organization.</p>
        <button @click="seedDemoEvents" class="btn-primary text-xs">Seed Demo Events</button>
      </div>

      <!-- Event Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="event in filteredEvents"
          :key="event._id"
          :to="`/event/${event.slug}?tenant=${activeSlug}`"
          class="glass-card rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 group flex flex-col hover:-translate-y-1"
        >
          <!-- Event Banner -->
          <div class="relative h-48  overflow-hidden">
            <img
              :src="event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'"
              :alt="event.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            
            <div class="absolute top-3 left-3 /80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold text-amber-300 border border-gray-200">
              {{ event.isVirtual ? '🌐 Virtual Event' : '📍 ' + event.location }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 flex flex-col flex-grow">
            <div class="text-xs text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
              <span>📅 {{ formatDate(event.startDate) }}</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900 group-hover:text-amber-400 transition-colors mb-2 line-clamp-1">
              {{ event.title }}
            </h3>
            <p class="text-gray-600 text-sm line-clamp-2 mb-6 flex-grow whitespace-pre-line">
              {{ event.description }}
            </p>

            <div class="flex items-center justify-between pt-4 border-t border-gray-200/80 mt-auto">
              <div>
                <span class="text-xs text-gray-500 uppercase font-medium block">Starting From</span>
                <span class="text-lg font-extrabold text-gray-900">
                  {{ getMinPrice(event.tiers) }}
                </span>
              </div>

              <span class="btn-primary text-xs !py-2.5 !px-4 flex items-center gap-1">
                Get Tickets ➔
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200/80 py-8 px-6 text-center text-gray-500 text-xs mt-auto">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 CMultiTickets Platform. All rights reserved.</p>
        <div class="flex items-center gap-6 text-gray-600">
          <span class="hover:text-gray-900 transition cursor-pointer">Privacy Policy</span>
          <span class="hover:text-gray-900 transition cursor-pointer">Terms of Service</span>
          <span class="hover:text-gray-900 transition cursor-pointer">Support</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const config = useRuntimeConfig();
const route = useRoute();

const activeSlug = ref('ulsesa');
const tenantInfo = ref(null);
const events = ref([]);
const loading = ref(true);
const searchQuery = ref('');

const filteredEvents = computed(() => {
  if (!searchQuery.value) return events.value;
  return events.value.filter(e =>
    e.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMinPrice(tiers) {
  if (!tiers || tiers.length === 0) return 'Free';
  const prices = tiers.map(t => t.price);
  const min = Math.min(...prices);
  return min === 0 ? 'Free' : `₦${min.toLocaleString()}`;
}

async function fetchEvents() {
  loading.value = true;
  try {
    const res = await fetch(`${config.public.apiBase}/events/tenant/${activeSlug.value}`);
    if (res.ok) {
      const data = await res.json();
      tenantInfo.value = data.tenant;
      events.value = data.events || [];
    } else {
      events.value = [];
    }
  } catch (err) {
    console.error('Error fetching events:', err);
    events.value = [];
  } finally {
    loading.value = false;
  }
}

function setTenantSlug(slug) {
  activeSlug.value = slug;
  fetchEvents();
}

onMounted(() => {
  if (route.query.tenant) {
    activeSlug.value = route.query.tenant;
  }
  fetchEvents();
});
</script>
