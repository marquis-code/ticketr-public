<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <!-- Navbar -->
    <header class="glass-card border-b border-slate-800/80 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/20">
            🎟️
          </div>
          <div>
            <span class="font-bold text-xl tracking-tight text-white block">CMultiTickets</span>
            <span class="text-xs text-indigo-400 font-medium">Find My E-Tickets</span>
          </div>
        </NuxtLink>

        <NuxtLink to="/" class="text-sm font-semibold text-slate-400 hover:text-white transition">
          ← Back to Events
        </NuxtLink>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-4xl mx-auto px-6 py-12 flex-grow w-full space-y-8">
      <!-- Search Form -->
      <div class="glass-card rounded-2xl p-8 border-indigo-500/30 text-center max-w-xl mx-auto">
        <h1 class="text-2xl font-extrabold text-white mb-2">Find My Purchased Tickets</h1>
        <p class="text-slate-400 text-xs mb-6">Enter the email address you used during ticket purchase to retrieve your active passes & QR codes.</p>

        <form @submit.prevent="lookupTickets" class="space-y-4">
          <input
            v-model="emailInput"
            type="email"
            placeholder="e.g. attendee@example.com"
            required
            class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition text-center"
          />

          <button type="submit" :disabled="searching || !emailInput" class="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2">
            <span v-if="searching" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ searching ? 'Searching Orders...' : '🔍 Retrieve Tickets' }}</span>
          </button>
        </form>
      </div>

      <!-- Results List -->
      <div v-if="searched && orders.length === 0" class="glass-card rounded-2xl p-8 text-center max-w-md mx-auto">
        <p class="text-slate-400 text-sm">No paid ticket orders found for <strong>{{ emailInput }}</strong>.</p>
      </div>

      <div v-else-if="orders.length > 0" class="space-y-6">
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <span>Your Orders & Tickets</span>
          <span class="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-semibold">{{ orders.length }}</span>
        </h2>

        <div v-for="order in orders" :key="order._id" class="glass-card rounded-2xl p-6 border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-2">
            <div>
              <span class="text-xs text-indigo-400 font-semibold block">Order #{{ order.orderNumber }}</span>
              <h3 class="text-lg font-bold text-white">{{ order.eventId?.title || 'Event Pass' }}</h3>
              <span class="text-xs text-slate-500">{{ new Date(order.paidAt || order.createdAt).toLocaleDateString() }}</span>
            </div>
            <div class="text-right">
              <span class="text-lg font-extrabold text-white">₦{{ order.totalAmount?.toLocaleString() }}</span>
              <span class="text-xs text-emerald-400 block font-semibold uppercase">● {{ order.status }}</span>
            </div>
          </div>

          <!-- Issued Tickets for this order -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="ticket in order.tickets" :key="ticket._id" class="bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-indigo-300">{{ ticket.ticketNumber }}</span>
                  <span
                    :class="ticket.status === 'CHECKED_IN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
                    class="px-2 py-0.5 rounded text-[10px] font-semibold border uppercase"
                  >
                    {{ ticket.status }}
                  </span>
                </div>
                <p class="text-sm font-semibold text-white mb-1">{{ ticket.attendeeName }}</p>
                <p class="text-xs text-slate-400 mb-4">{{ ticket.attendeeEmail }}</p>
              </div>

              <NuxtLink :to="`/order/confirmation?reference=${order.paystackReference}`" class="btn-secondary text-xs !py-2 text-center w-full block">
                View & Print E-Ticket 🎟️
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
