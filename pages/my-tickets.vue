<template>
  <div class="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
    <!-- Navbar -->
    <header class="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-6 py-4 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center shadow-sm">
            <Ticket class="w-5 h-5 text-white" />
          </div>
          <span class="font-bold text-xl tracking-tight text-gray-900">Ticketr</span>
        </NuxtLink>

        <NuxtLink to="/" class="text-sm font-semibold text-gray-500 hover:text-gray-900 transition flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Events
        </NuxtLink>
      </div>
    </header>

    <main class="flex-grow w-full max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
      
      <!-- Header Section -->
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Find Your Tickets</h1>
        <p class="text-gray-500 text-base md:text-lg">
          Enter the email address used during checkout to retrieve your orders, download passes, and view QR codes.
        </p>
      </div>

      <!-- Search Form -->
      <div class="w-full max-w-lg mb-16 relative z-10">
        <div class="absolute -inset-1 bg-gradient-to-r from-primary/30 to-violet-500/30 rounded-[2rem] blur opacity-40"></div>
        <form @submit.prevent="lookupTickets" class="relative bg-white rounded-3xl p-2 shadow-xl shadow-gray-200/50 flex flex-col sm:flex-row gap-2 border border-gray-100">
          <div class="relative flex-grow flex items-center">
            <Mail class="w-5 h-5 text-gray-400 absolute left-4" />
            <input
              v-model="emailInput"
              type="email"
              placeholder="e.g. attendee@example.com"
              required
              class="w-full bg-transparent pl-12 pr-4 py-3.5 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
          <button type="submit" :disabled="searching || !emailInput" class="btn-primary whitespace-nowrap px-8 py-3.5 rounded-2xl font-semibold shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all">
            <span v-if="searching" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-if="!searching"><Search class="w-5 h-5" /></span>
            <span>{{ searching ? 'Searching...' : 'Retrieve Tickets' }}</span>
          </button>
        </form>
      </div>

      <!-- Results List -->
      <div v-if="searched && orders.length === 0" class="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-lg shadow-gray-100 mx-auto">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ticket class="w-8 h-8 text-gray-300" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">No tickets found</h3>
        <p class="text-gray-500 text-sm">We couldn't find any paid orders associated with <strong>{{ emailInput }}</strong>. Please check the email and try again.</p>
      </div>

      <div v-else-if="orders.length > 0" class="w-full space-y-12">
        <div class="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 class="text-2xl font-bold text-gray-900">Your Orders</h2>
          <span class="bg-gray-100 text-gray-600 text-sm font-semibold px-3 py-1 rounded-full">{{ orders.length }} order{{ orders.length > 1 ? 's' : '' }}</span>
        </div>

        <div v-for="order in orders" :key="order._id" class="space-y-6">
          <!-- Order Header -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div class="flex gap-4 items-center">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar class="w-6 h-6 text-primary" />
              </div>
              <div>
                <span class="text-xs font-bold tracking-wider text-gray-400 uppercase">Order #{{ order.orderNumber }}</span>
                <h3 class="text-xl font-bold text-gray-900 leading-tight">{{ order.eventId?.title || 'Event Pass' }}</h3>
                <span class="text-sm font-medium text-gray-500 mt-0.5 block">{{ new Date(order.paidAt || order.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
              </div>
            </div>
            <div class="md:text-right flex md:flex-col items-center md:items-end justify-between">
              <span class="text-2xl font-extrabold text-gray-900">₦{{ order.totalAmount?.toLocaleString() }}</span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {{ order.status }}
              </span>
            </div>
          </div>

          <!-- Tickets Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="ticket in order.tickets" :key="ticket._id" class="relative flex flex-col sm:flex-row bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              
              <!-- Ticket Stub (Left) -->
              <div class="bg-gradient-to-br from-primary to-violet-600 p-6 flex flex-col justify-between sm:w-2/5 relative text-white">
                <!-- Cutout circles -->
                <div class="absolute -right-3 -top-3 w-6 h-6 bg-[#FAFAFA] rounded-full sm:block hidden"></div>
                <div class="absolute -right-3 -bottom-3 w-6 h-6 bg-[#FAFAFA] rounded-full sm:block hidden"></div>
                
                <!-- Mobile cutouts -->
                <div class="absolute -bottom-3 -left-3 w-6 h-6 bg-[#FAFAFA] rounded-full sm:hidden block z-10"></div>
                <div class="absolute -bottom-3 -right-3 w-6 h-6 bg-[#FAFAFA] rounded-full sm:hidden block z-10"></div>

                <div>
                  <span class="text-white/70 text-xs font-bold uppercase tracking-widest mb-1 block">Pass Type</span>
                  <p class="text-lg font-bold leading-tight">{{ ticket.tierId?.name || 'Standard Admission' }}</p>
                </div>
                
                <div class="mt-6">
                  <span class="text-white/70 text-[10px] font-bold uppercase tracking-widest block mb-1">Ticket ID</span>
                  <p class="font-mono text-sm tracking-wider">{{ ticket.ticketNumber }}</p>
                </div>
              </div>

              <!-- Dashed Divider (Desktop) -->
              <div class="hidden sm:flex flex-col justify-center items-center relative -mx-0.5 z-10 text-gray-300">
                <div class="w-px h-full border-l-2 border-dashed border-gray-200"></div>
              </div>

              <!-- Dashed Divider (Mobile) -->
              <div class="sm:hidden flex w-full relative -my-0.5 z-10 text-gray-300 px-6">
                <div class="h-px w-full border-t-2 border-dashed border-gray-200"></div>
              </div>

              <!-- Ticket Info (Right) -->
              <div class="p-6 flex flex-col justify-between sm:w-3/5 bg-white relative">
                 <div class="absolute -left-3 -top-3 w-6 h-6 bg-[#FAFAFA] rounded-full sm:block hidden"></div>
                 <div class="absolute -left-3 -bottom-3 w-6 h-6 bg-[#FAFAFA] rounded-full sm:block hidden"></div>
                 
                 <!-- Mobile cutouts -->
                 <div class="absolute -top-3 -left-3 w-6 h-6 bg-[#FAFAFA] rounded-full sm:hidden block"></div>
                 <div class="absolute -top-3 -right-3 w-6 h-6 bg-[#FAFAFA] rounded-full sm:hidden block"></div>

                <div class="mb-6">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <span class="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Attendee</span>
                      <p class="text-base font-bold text-gray-900">{{ ticket.attendeeName }}</p>
                    </div>
                    <span
                      :class="ticket.status === 'CHECKED_IN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'"
                      class="px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap"
                    >
                      {{ ticket.status }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 font-medium truncate">{{ ticket.attendeeEmail }}</p>
                </div>

                <NuxtLink :to="`/order/confirmation?reference=${order.paystackReference}`" class="w-full btn-secondary text-sm !py-2.5 flex items-center justify-center gap-2 group-hover:bg-gray-50 transition-colors border-gray-200">
                  <QrCode class="w-4 h-4 text-gray-500" />
                  View & Download Pass
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Ticket, Search, Mail, Calendar, QrCode } from 'lucide-vue-next';

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

useSeoMeta({
  title: 'Find My Tickets | Ticketr',
  description: 'Retrieve your purchased event tickets, view QR codes, and download passes.',
});
</script>
