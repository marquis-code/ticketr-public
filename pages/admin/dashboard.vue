<template>
  <div >
    <!-- Navbar -->
    

    <!-- Content Area -->
    <main v-if="loading" class="max-w-7xl mx-auto px-4 md:px-6 py-24 flex-grow w-full">
      <TableLoadingState message="Loading dashboard..." />
    </main>

    <main v-else class="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-grow w-full space-y-8">
      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
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

      <!-- Analytics Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" v-if="analytics">
        <div class="glass-card rounded-2xl p-6 border-primary/20">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Revenue Trend (30 Days)</h3>
          <div class="h-64 relative">
            <Line v-if="analytics?.salesOverTime?.length" :data="revenueChartData" :options="chartOptions" />
            <div v-else class="h-full flex items-center justify-center text-sm text-gray-400">Not enough sales data yet</div>
          </div>
        </div>
        <div class="glass-card rounded-2xl p-6 border-primary/20">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Top Events by Ticket Sales</h3>
          <div class="h-64 relative">
            <Bar v-if="analytics?.ticketsByEvent?.length" :data="ticketsChartData" :options="chartOptions" />
            <div v-else class="h-full flex items-center justify-center text-sm text-gray-400">Not enough ticket data yet</div>
          </div>
        </div>
      </div>

      <!-- Events List Table / Cards -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 class="text-xl font-bold text-gray-900">My Events</h2>
          <NuxtLink to="/admin/events/create" class="text-xs font-semibold text-primary hover:text-primary">
            + Add New Event
          </NuxtLink>
        </div>

        <TableEmptyState v-if="events.length === 0" title="No Events Yet" message="No events created yet. Click '+ Add New Event' to publish your first ticketed event." />

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
                  <NuxtLink :to="`/dashboard/events/${ev._id}/attendees`" class="btn-secondary text-xs !py-1 !px-3 flex items-center gap-1 justify-end">
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

    </template>
<script setup>
definePageMeta({ layout: 'admin' });


import { ref, onMounted, computed } from 'vue';
import { Zap, Search, ClipboardList } from 'lucide-vue-next';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const config = useRuntimeConfig();
const user = ref(null);
const loading = ref(true);
const analytics = ref(null);
const events = ref([]);
const revenueChartData = computed(() => {
  if (!analytics.value?.salesOverTime) return { labels: [], datasets: [] };
  return {
    labels: analytics.value.salesOverTime.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [{
      label: 'Revenue (₦)',
      data: analytics.value.salesOverTime.map(d => d.revenue),
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.15)',
      borderWidth: 2,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#4f46e5',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: true
    }]
  };
});

const ticketsChartData = computed(() => {
  if (!analytics.value?.ticketsByEvent) return { labels: [], datasets: [] };
  return {
    labels: analytics.value.ticketsByEvent.map(d => d.eventName),
    datasets: [{
      label: 'Tickets Sold',
      data: analytics.value.ticketsByEvent.map(d => d.ticketsSold),
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
      borderRadius: 6,
      maxBarThickness: 40,
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1f2937',
      padding: 12,
      titleFont: { size: 13, family: "'Inter', sans-serif" },
      bodyFont: { size: 13, family: "'Inter', sans-serif" },
      cornerRadius: 8,
      displayColors: false,
    }
  },
  scales: {
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { color: '#6b7280', font: { size: 12, family: "'Inter', sans-serif" } }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#f3f4f6',
        drawBorder: false,
        borderDash: [5, 5]
      },
      ticks: {
        color: '#6b7280',
        font: { size: 12, family: "'Inter', sans-serif" },
        padding: 10,
        callback: function(value) {
          if (value >= 1000) return (value / 1000) + 'k';
          return value;
        }
      }
    }
  }
};
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
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadDashboardData();
});
</script>
