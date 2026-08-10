<template>
  <div class="min-h-screen   flex flex-col">
    <!-- Navbar -->
    <header class="glass-card border-b border-gray-200/80 px-4 md:px-6 py-4 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full md:w-auto">
          <NuxtLink to="/admin/dashboard" class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center font-bold text-xl text-gray-900">
              <Zap class="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <span class="font-bold text-lg text-gray-900 block">Organizer Dashboard</span>
              <span class="text-xs text-primary font-medium">{{ user?.email || 'Logged In' }}</span>
            </div>
          </NuxtLink>

          <!-- Nav Tabs -->
          <nav class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide text-xs font-semibold">
            <NuxtLink to="/admin/dashboard" class="bg-primary text-white px-3 py-1.5 rounded-lg">Dashboard</NuxtLink>
            <NuxtLink to="/admin/events" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg transition">Events Management</NuxtLink>
            <NuxtLink to="/admin/orders" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg transition">Orders & Financials</NuxtLink>
            <NuxtLink to="/admin/scanner" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg transition">Gate Scanner</NuxtLink>
            <NuxtLink to="/admin/settings" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg transition">Branding & Payouts</NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-3 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <NuxtLink to="/admin/events/create" class="btn-primary text-xs !py-2 !px-3.5 flex items-center gap-1">
            <span>+ Create Event</span>
          </NuxtLink>
          <NuxtLink to="/admin/scanner" class="btn-secondary text-xs !py-2 !px-3.5 flex items-center gap-1 border-primary/30 text-primary">
            <Search class="w-4 h-4" />
            <span>Gate Scanner</span>
          </NuxtLink>
          <button @click="showLogoutModal = true" class="text-xs text-gray-600 hover:text-gray-900 px-3 py-2">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Content Area -->
    <main class="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-grow w-full space-y-8">
      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="glass-card rounded-2xl p-6 border-primary/20">
          <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Total Revenue</span>
          <div class="text-3xl font-extrabold text-gray-900">
            ₦{{ (analytics?.totalRevenue || 0).toLocaleString() }}
          </div>
          <span class="text-[11px] text-emerald-400 font-medium block mt-2">↑ 100% Verified via Paystack</span>
        </div>

        <div class="glass-card rounded-2xl p-6 border-primary/20">
          <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Tickets Sold</span>
          <div class="text-3xl font-extrabold text-gray-900">
            {{ analytics?.totalTicketsSold || 0 }}
          </div>
          <span class="text-[11px] text-primary font-medium block mt-2">Across all published events</span>
        </div>

        <div class="glass-card rounded-2xl p-6 border-primary/20">
          <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Check-in Rate</span>
          <div class="text-3xl font-extrabold text-gray-900">
            {{ analytics?.checkInRate || 0 }}%
          </div>
          <span class="text-[11px] text-purple-400 font-medium block mt-2">{{ analytics?.checkedInTickets || 0 }} Checked In</span>
        </div>

        <div class="glass-card rounded-2xl p-6 border-primary/20">
          <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Active Events</span>
          <div class="text-3xl font-extrabold text-gray-900">
            {{ events.length }}
          </div>
          <span class="text-[11px] text-gray-600 font-medium block mt-2">Published Events</span>
        </div>
      </div>

      <!-- Events List Table / Cards -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="flex items-center justify-between p-6 pb-4">
          <h2 class="text-xl font-bold text-gray-900">My Events</h2>
          <NuxtLink to="/admin/events/create" class="text-xs font-semibold text-primary hover:text-primary">
            + Add New Event
          </NuxtLink>
        </div>

        <div v-if="events.length === 0" class="text-center py-12 text-gray-500 text-sm">
          No events created yet. Click "+ Create Event" to publish your first ticketed event.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Event Title</th>
                <th class="px-6 py-4">Date</th>
                <th class="px-6 py-4">Location</th>
                <th class="px-6 py-4">Tickets Sold</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Roster</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="ev in events" :key="ev._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 font-semibold text-gray-900">
                  {{ ev.title }}
                </td>
                <td class="px-6 py-4 text-xs text-gray-600">
                  {{ new Date(ev.startDate).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 text-xs text-gray-600">
                  {{ ev.location }}
                </td>
                <td class="px-6 py-4 font-semibold text-primary">
                  {{ ev.totalSold || 0 }} / {{ ev.totalCapacity || 0 }}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {{ ev.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <NuxtLink :to="`/admin/events/${ev._id}/attendees`" class="btn-secondary text-xs !py-1 !px-3 flex items-center gap-1 justify-end">
                    Attendees <ClipboardList class="w-3 h-3" />
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div class="bg-white border border-gray-200 w-full max-w-sm p-6 rounded-2xl relative shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
        <p class="text-sm text-gray-500 mb-6">Are you sure you want to sign out of your account?</p>
        <div class="flex justify-end gap-3">
          <button @click="showLogoutModal = false" class="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
          <button @click="confirmLogout" class="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition">Yes, Logout</button>
        </div>
      </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { Zap, Search, ClipboardList } from 'lucide-vue-next';

const config = useRuntimeConfig();
const user = ref(null);
const analytics = ref(null);
const events = ref([]);

const showLogoutModal = ref(false);

function confirmLogout() {
  localStorage.removeItem('ticketr_admin_token');
  localStorage.removeItem('ticketr_admin_user');
  useRouter().push('/admin/login');
}

async function loadDashboardData() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) {
    useRouter().push('/admin/login');
    return;
  }

  try {
    user.value = JSON.parse(localStorage.getItem('ticketr_admin_user') || '{}');

    const [analyticsRes, eventsRes] = await Promise.all([
      fetch(`${config.public.apiBase}/analytics/tenant`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${config.public.apiBase}/events/admin/my-events`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (analyticsRes.ok) analytics.value = await analyticsRes.json();
    if (eventsRes.ok) events.value = await eventsRes.json();
  } catch (err) {
    console.error('Error loading organizer data:', err);
  }
}

onMounted(() => {
  loadDashboardData();
});
</script>
