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
            <span class="font-bold text-lg text-gray-900 block">{{ tenantName || 'Organizer Dashboard' }}</span>
          </NuxtLink>
          <nav class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide text-xs font-semibold">
            <NuxtLink to="/admin/dashboard" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg transition whitespace-nowrap">Dashboard</NuxtLink>
            <NuxtLink to="/admin/events" class="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg transition whitespace-nowrap">Events</NuxtLink>
            <NuxtLink to="/admin/orders" class="bg-primary text-white px-3 py-1.5 rounded-lg whitespace-nowrap">Orders</NuxtLink>
          </nav>
        </div>
        <button @click="logout" class="text-xs text-gray-500 hover:text-gray-900 px-3 py-2 flex items-center gap-1.5">
          <LogOut class="w-3.5 h-3.5" /> Logout
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-grow w-full space-y-6">
      <h1 class="text-2xl font-extrabold text-gray-900">Orders & Financials</h1>

      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div v-if="loading" class="text-center py-12 text-gray-500 text-sm">Loading orders...</div>
        <div v-else-if="orders.length === 0" class="text-center py-12 text-gray-500 text-sm">No orders yet.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Order #</th>
                <th class="px-6 py-4">Customer</th>
                <th class="px-6 py-4">Event</th>
                <th class="px-6 py-4">Qty</th>
                <th class="px-6 py-4">Amount</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="order in orders" :key="order._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 font-mono text-xs text-gray-600">{{ order.orderNumber }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ order.customerEmail }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ order.eventId?.title || '—' }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 font-semibold">{{ order.tickets?.length || 0 }}</td>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Ticket, LogOut } from 'lucide-vue-next';

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const { tenantSlug } = useSubdomain();

const orders = ref([]);
const loading = ref(true);
const tenantName = ref('');

function logout() {
  localStorage.removeItem('ticketr_admin_token');
  localStorage.removeItem('ticketr_admin_user');
  localStorage.removeItem('ticketr_admin_tenant');
  useRouter().push('/admin/login');
}

onMounted(async () => {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) { useRouter().push('/admin/login'); return; }

  try {
    const res = await fetch(`${config.public.apiBase}/orders/admin/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) orders.value = await res.json();

    if (tenantSlug) {
      const tenantRes = await fetch(`${config.public.apiBase}/events/tenant/${tenantSlug}`);
      if (tenantRes.ok) {
        const data = await tenantRes.json();
        if (data.tenant) tenantName.value = data.tenant.name;
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
