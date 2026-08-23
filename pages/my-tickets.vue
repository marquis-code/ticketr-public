<template>
  <div>
    <!-- Navbar -->
    

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
            <div class="md:text-right flex md:flex-col items-center md:items-end justify-between gap-3">
              <div>
                <span class="text-2xl font-extrabold text-gray-900 block">₦{{ order.totalAmount?.toLocaleString() }}</span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide mt-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {{ order.status }}
                </span>
              </div>
              <button 
                @click="copyReferralLink(order)"
                class="btn-secondary !py-1.5 !px-3 text-[11px] flex items-center gap-1 mt-2 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                title="Refer friends to earn rewards!"
              >
                <Share class="w-3.5 h-3.5" /> Share Referral Link
              </button>
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
                      <div class="flex items-center gap-2">
                        <p class="text-base font-bold text-gray-900">{{ getCleanName(ticket.attendeeName) }}</p>
                        <span v-if="getGenderTag(ticket.attendeeName) === 'Male'" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider border border-blue-200">Male</span>
                        <span v-if="getGenderTag(ticket.attendeeName) === 'Female'" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-100 text-pink-700 uppercase tracking-wider border border-pink-200">Female</span>
                      </div>
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
      
      <!-- Custom Toast -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="transform translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100 sm:translate-x-0"
        leave-to-class="transform translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      >
        <div v-if="customToast.show" class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl">
          <div class="bg-emerald-500/20 text-emerald-400 rounded-full p-1"><Share class="w-4 h-4" /></div>
          <span class="text-sm font-medium tracking-wide">{{ customToast.message }}</span>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });

import { ref } from 'vue';
import { Ticket, Search, Mail, Calendar, QrCode, Share } from 'lucide-vue-next';

const config = useRuntimeConfig();

const emailInput = ref('');
const searching = ref(false);
const searched = ref(false);
const orders = ref([]);

function getCleanName(name) {
  if (!name) return '';
  return name.replace(/\s*\((Male|Female)\)\s*/i, '');
}

function getGenderTag(name) {
  if (!name) return null;
  const match = name.match(/\((Male|Female)\)/i);
  if (match) {
    return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  }
  return null;
}

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

const customToast = ref({ show: false, message: '' });
let toastTimeout;

function copyReferralLink(order) {
  if (typeof window !== 'undefined' && navigator.clipboard) {
    // Generate referral link based on order _id and event slug
    const eventSlug = order.eventId?.slug || '';
    const origin = window.location.origin;
    let url = `${origin}/event/${eventSlug}?ref=${order._id}`;
    
    // Check if we are not on a subdomain and a tenant id is available (for local testing mostly)
    if (order.tenantId?.slug && origin.includes('localhost')) {
      url += `&tenant=${order.tenantId.slug}`;
    }
    
    navigator.clipboard.writeText(url);
    
    customToast.value.message = 'Referral Link Copied!';
    customToast.value.show = true;
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      customToast.value.show = false;
    }, 3000);
  }
}

useSeoMeta({
  title: 'Find My Tickets | Ticketr',
  description: 'Retrieve your purchased event tickets, view QR codes, and download passes.',
});
</script>
