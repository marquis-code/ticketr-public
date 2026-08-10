<template>
  <div>
    

    <main class="w-full space-y-8">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900">Orders & Financial Transactions</h1>
        <p class="text-xs text-gray-600 mt-1">Audit ticket purchases, Paystack transaction references, and revenue logs.</p>
      </div>

      <!-- Orders Table -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div v-if="loading" class="text-center py-12 text-gray-500 text-sm">
          Loading orders...
        </div>

        <div v-else-if="orders.length === 0" class="text-center py-12 text-gray-500 text-sm">
          No orders placed yet.
        </div>

        <div v-else class="overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th class="py-4 px-4 md:px-6">Customer & Order</th>
                <th class="py-4 px-4 md:px-6">Event</th>
                <th class="py-4 px-4 md:px-6">Amount</th>
                <th class="py-4 px-4 md:px-6">Reference</th>
                <th class="py-4 px-4 md:px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="o in orders" :key="o._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 md:px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {{ o.customerName.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 text-sm">{{ o.customerName }}</p>
                      <p class="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span class="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{{ o.orderNumber }}</span>
                        {{ o.customerEmail }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 md:px-6">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700">
                    🎪 {{ o.eventId?.title || 'Unknown Event' }}
                  </div>
                </td>
                <td class="px-6 py-4 md:px-6">
                  <span class="font-extrabold text-gray-900 text-sm">₦{{ o.totalAmount?.toLocaleString() }}</span>
                </td>
                <td class="px-6 py-4 md:px-6">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-[11px] text-gray-500 truncate max-w-[120px]" :title="o.paystackReference">
                      {{ o.paystackReference }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 md:px-6 text-right">
                  <span
                    :class="o.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="o.status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                    {{ o.status }}
                  </span>
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

import { ref, onMounted } from 'vue';

const config = useRuntimeConfig();

const orders = ref([]);
const loading = ref(true);
const tenantLogo = ref('');
const tenantName = ref('');

async function loadTenantDetails() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) return;
  try {
    const res = await fetch(`${config.public.apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.tenant) {
        tenantLogo.value = data.tenant.logoUrl;
        tenantName.value = data.tenant.name;
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadOrders() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) return;

  loading.value = true;
  try {
    const res = await fetch(`${config.public.apiBase}/orders/tenant`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      orders.value = await res.json();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadTenantDetails();
  loadOrders();
});
</script>
