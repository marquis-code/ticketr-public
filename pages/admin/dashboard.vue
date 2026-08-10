<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Navbar -->
    <header class="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-4 md:px-6 py-4 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full md:w-auto">
          <NuxtLink to="/admin/dashboard" class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center">
              <Ticket class="w-6 h-6 text-white" />
            </div>
            <div>
              <span class="font-bold text-lg text-gray-900 block">{{ tenantName || 'Organizer Dashboard' }}</span>
              <span class="text-xs text-primary font-medium">{{ user?.email || '' }}</span>
            </div>
          </NuxtLink>

          <nav class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide text-xs font-semibold">
            <NuxtLink to="/admin/dashboard" :class="activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'" class="px-3 py-1.5 rounded-lg transition whitespace-nowrap">Dashboard</NuxtLink>
            <NuxtLink to="/admin/events" :class="activeTab === 'events' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'" class="px-3 py-1.5 rounded-lg transition whitespace-nowrap">Events</NuxtLink>
            <NuxtLink to="/admin/orders" :class="activeTab === 'orders' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'" class="px-3 py-1.5 rounded-lg transition whitespace-nowrap">Orders</NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-3 self-start md:self-auto">
          <button @click="showLogoutModal = true" class="text-xs text-gray-500 hover:text-gray-900 px-3 py-2 flex items-center gap-1.5">
            <LogOut class="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-grow w-full space-y-8">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Total Revenue</span>
          <div class="text-3xl font-extrabold text-gray-900">₦{{ (analytics?.totalRevenue || 0).toLocaleString() }}</div>
          <span class="text-[11px] text-emerald-500 font-medium block mt-2">↑ 100% Verified via Paystack</span>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Tickets Sold</span>
          <div class="text-3xl font-extrabold text-gray-900">{{ analytics?.totalTicketsSold || 0 }}</div>
          <span class="text-[11px] text-primary font-medium block mt-2">Across all events</span>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Check-in Rate</span>
          <div class="text-3xl font-extrabold text-gray-900">{{ analytics?.checkInRate || 0 }}%</div>
          <span class="text-[11px] text-purple-500 font-medium block mt-2">{{ analytics?.checkedInTickets || 0 }} Checked In</span>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Active Events</span>
          <div class="text-3xl font-extrabold text-gray-900">{{ events.length }}</div>
          <span class="text-[11px] text-gray-500 font-medium block mt-2">Published Events</span>
        </div>
      </div>

      <!-- Events Table -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-bold text-gray-900">My Events</h2>
        </div>

        <div v-if="events.length === 0" class="text-center py-12 text-gray-500 text-sm">
          No events created yet.
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
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="ev in events" :key="ev._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 font-semibold text-gray-900">{{ ev.title }}</td>
                <td class="px-6 py-4 text-xs text-gray-600">{{ new Date(ev.startDate).toLocaleDateString() }}</td>
                <td class="px-6 py-4 text-xs text-gray-600">{{ ev.location }}</td>
                <td class="px-6 py-4 font-semibold text-primary">{{ ev.totalSold || 0 }} / {{ ev.totalCapacity || 0 }}</td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {{ ev.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 class="text-lg font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div v-if="orders.length === 0" class="text-center py-12 text-gray-500 text-sm">No orders yet.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Order #</th>
                <th class="px-6 py-4">Customer</th>
                <th class="px-6 py-4">Event</th>
                <th class="px-6 py-4">Amount</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="order in orders.slice(0, 10)" :key="order._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 font-mono text-xs text-gray-600">{{ order.orderNumber }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ order.customerEmail }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ order.eventId?.title || '—' }}</td>
                <td class="px-6 py-4 font-semibold text-gray-900">₦{{ (order.totalAmount || 0).toLocaleString() }}</td>
                <td class="px-6 py-4">
                  <span :class="order.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'" class="px-2.5 py-1 rounded-full text-[11px] font-semibold border">
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-gray-500">{{ new Date(order.createdAt).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Logout Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div class="bg-white border border-gray-200 w-full max-w-sm p-6 rounded-2xl shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
        <p class="text-sm text-gray-500 mb-6">Are you sure you want to sign out of your account?</p>
        <div class="flex justify-end gap-3">
          <button @click="showLogoutModal = false" class="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
          <button @click="confirmLogout" class="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition">Yes, Logout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { toast } from 'vue-sonner';
import { Ticket, LogOut } from 'lucide-vue-next';

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const route = useRoute();
const { tenantSlug } = useSubdomain();

const user = ref(null);
const analytics = ref(null);
const events = ref([]);
const orders = ref([]);
const tenantName = ref('');
const showLogoutModal = ref(false);

const activeTab = computed(() => {
  const path = route.path;
  if (path.includes('/admin/events')) return 'events';
  if (path.includes('/admin/orders')) return 'orders';
  return 'dashboard';
});

function confirmLogout() {
  localStorage.removeItem('ticketr_admin_token');
  localStorage.removeItem('ticketr_admin_user');
  localStorage.removeItem('ticketr_admin_tenant');
  showLogoutModal.value = false;
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

    const headers = { Authorization: `Bearer ${token}` };

    const [analyticsRes, eventsRes, ordersRes] = await Promise.all([
      fetch(`${config.public.apiBase}/analytics/tenant`, { headers }),
      fetch(`${config.public.apiBase}/events/admin/my-events`, { headers }),
      fetch(`${config.public.apiBase}/orders/admin/my-orders`, { headers }),
    ]);

    if (analyticsRes.ok) analytics.value = await analyticsRes.json();
    if (eventsRes.ok) events.value = await eventsRes.json();
    if (ordersRes.ok) orders.value = await ordersRes.json();

    // Fetch tenant name
    if (tenantSlug) {
      const tenantRes = await fetch(`${config.public.apiBase}/events/tenant/${tenantSlug}`);
      if (tenantRes.ok) {
        const data = await tenantRes.json();
        if (data.tenant) tenantName.value = data.tenant.name;
      }
    }
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

onMounted(() => {
  loadDashboardData();
});
</script>
