<template>
  <div class="min-h-screen   flex flex-col">
    <!-- Navbar -->
    <header class="glass-card border-b border-gray-200/80 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-xl text-gray-900">
            <Ticket class="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <span class="font-bold text-xl tracking-tight text-gray-900 block">Ticketr</span>
            <span class="text-xs text-primary font-medium">Find My E-Tickets</span>
          </div>
        </NuxtLink>

        <NuxtLink to="/" class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
          ← Back to Events
        </NuxtLink>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-4xl mx-auto px-6 py-12 flex-grow w-full space-y-8">
      <!-- Search Form -->
      <div class="glass-card rounded-2xl p-8 border-primary/30 text-center max-w-xl mx-auto">
        <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Find My Purchased Tickets</h1>
        <p class="text-gray-600 text-xs mb-6">Enter the email address you used during ticket purchase to retrieve your active passes & QR codes.</p>

        <form @submit.prevent="lookupTickets" class="space-y-4">
          <input
            v-model="emailInput"
            type="email"
            placeholder="e.g. attendee@example.com"
            required
            class="w-full  border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition text-center"
          />

          <button type="submit" :disabled="searching || !emailInput" class="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2">
            <span v-if="searching" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span v-if="!searching"><Search class="w-4 h-4" /></span>
            <span>{{ searching ? 'Searching Orders...' : 'Retrieve Tickets' }}</span>
          </button>
        </form>
      </div>

      <!-- Results List -->
      <div v-if="searched && orders.length === 0" class="glass-card rounded-2xl p-8 text-center max-w-md mx-auto">
        <p class="text-gray-600 text-sm">No paid ticket orders found for <strong>{{ emailInput }}</strong>.</p>
      </div>

      <div v-else-if="orders.length > 0" class="space-y-6">
        <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>Your Orders & Tickets</span>
          <span class="text-xs bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-semibold">{{ orders.length }}</span>
        </h2>

        <div v-for="order in orders" :key="order._id" class="glass-card rounded-2xl p-6 border-gray-200">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 mb-6 gap-2">
            <div>
              <span class="text-xs text-primary font-semibold block">Order #{{ order.orderNumber }}</span>
              <h3 class="text-lg font-bold text-gray-900">{{ order.eventId?.title || 'Event Pass' }}</h3>
              <span class="text-xs text-gray-500">{{ new Date(order.paidAt || order.createdAt).toLocaleDateString() }}</span>
            </div>
            <div class="text-right">
              <span class="text-lg font-extrabold text-gray-900">₦{{ order.totalAmount?.toLocaleString() }}</span>
              <span class="text-xs text-emerald-400 block font-semibold uppercase">● {{ order.status }}</span>
            </div>
          </div>

          <!-- Issued Tickets for this order -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="ticket in order.tickets" :key="ticket._id" class="/80 rounded-xl p-4 border border-gray-200 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-primary">{{ ticket.ticketNumber }}</span>
                  <span
                    :class="ticket.status === 'CHECKED_IN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
                    class="px-2 py-0.5 rounded text-[10px] font-semibold border uppercase"
                  >
                    {{ ticket.status }}
                  </span>
                </div>
                <p class="text-sm font-semibold text-gray-900 mb-1">{{ ticket.attendeeName }}</p>
                <p class="text-xs text-gray-600 mb-4">{{ ticket.attendeeEmail }}</p>
              </div>

              <NuxtLink :to="`/order/confirmation?reference=${order.paystackReference}`" class="btn-secondary text-xs !py-2 text-center w-full flex items-center justify-center gap-1">
                View & Print E-Ticket <Ticket class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Ticket, Search } from 'lucide-vue-next';

const config = useRuntimeConfig();

const emailInput = ref('');
const searching = ref(false);
const searched = ref(false);
const orders = ref([]);

async function lookupTickets() {
  searching.value = true;
  searched.value = false;
  orders.value = [];

  try {
    const res = await fetch(`${config.public.apiBase}/orders/lookup?email=${encodeURIComponent(emailInput.value.trim())}`);
    if (res.ok) {
      orders.value = await res.json();
    }
  } catch (err) {
    console.error('Error looking up tickets:', err);
  } finally {
    searching.value = false;
    searched.value = true;
  }
}
</script>
