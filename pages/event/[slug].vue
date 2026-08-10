<template>
  <div class="min-h-screen   flex flex-col">
    <!-- Top Header -->
    <header class="glass-card border-b border-gray-200/80 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <NuxtLink :to="`/?tenant=${tenantSlug}`" class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition flex items-center gap-2">
          ← Back to Events
        </NuxtLink>
        <span class="text-xs text-indigo-400 font-semibold px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          {{ eventData?.tenant?.name || 'CMultiTickets' }}
        </span>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8 flex-grow w-full">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-24">
        <div class="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-600 text-sm mt-4">Loading event details...</p>
      </div>

      <!-- Error / Not Found -->
      <div v-else-if="!eventData || !eventData.event" class="glass-card rounded-2xl p-12 text-center max-w-md mx-auto my-12">
        <p class="text-xl font-bold text-gray-900 mb-2">Event Not Found</p>
        <NuxtLink :to="`/?tenant=${tenantSlug}`" class="btn-primary text-xs inline-block mt-4">Return Home</NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left 2 Columns: Event Info -->
        <div class="lg:col-span-2 space-y-6">
          <div class="glass-card rounded-2xl overflow-hidden">
            <div class="relative h-80 ">
              <img
                :src="eventData.event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'"
                :alt="eventData.event.title"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

              <div class="absolute bottom-6 left-6 right-6">
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md mb-3 inline-block">
                  {{ eventData.event.isVirtual ? '🌐 Virtual Event' : '📍 ' + eventData.event.location }}
                </span>
                <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                  {{ eventData.event.title }}
                </h1>
              </div>
            </div>

            <!-- Details Body -->
            <div class="p-6 md:p-8 space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl /60 border border-gray-200">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-lg">
                    📅
                  </div>
                  <div>
                    <span class="text-xs text-gray-500 block uppercase font-medium">Date & Time</span>
                    <span class="text-sm font-semibold text-gray-900">{{ formatDate(eventData.event.startDate) }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-lg">
                    📍
                  </div>
                  <div>
                    <span class="text-xs text-gray-500 block uppercase font-medium">Location</span>
                    <span class="text-sm font-semibold text-gray-900 truncate max-w-[200px] block">{{ eventData.event.location }}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-bold text-gray-900 mb-3">About This Event</h3>
                <p class="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                  {{ eventData.event.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Ticket Selector & Checkout Form -->
        <div class="space-y-6">
          <div class="glass-card rounded-2xl p-6 md:p-8 border-indigo-500/30 sticky top-24">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Select Tickets</h2>

            <!-- Tiers List -->
            <div class="space-y-4 mb-6">
              <div
                v-for="tier in eventData.event.tiers"
                :key="tier._id"
                class="p-4 rounded-xl border transition-all"
                :class="selectedQuantities[tier._id] > 0 ? 'bg-indigo-950/30 border-indigo-500/60' : '/40 border-gray-200'"
              >
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <h4 class="font-bold text-gray-900 text-base">{{ tier.name }}</h4>
                    <span class="text-xs text-gray-600 block">{{ tier.capacity - tier.soldCount }} tickets remaining</span>
                  </div>
                  <span class="text-lg font-extrabold text-indigo-300">
                    {{ tier.price === 0 ? 'Free' : `₦${tier.price.toLocaleString()}` }}
                  </span>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center justify-between pt-3 border-t border-gray-200/60 mt-2">
                  <span class="text-xs text-gray-500">Qty (Max {{ tier.maxPerPurchase }})</span>
                  <div class="flex items-center gap-3">
                    <button
                      @click="updateQuantity(tier._id, -1, tier.maxPerPurchase)"
                      :disabled="!selectedQuantities[tier._id]"
                      class="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
                    >
                      -
                    </button>
                    <span class="font-bold text-gray-900 text-sm w-4 text-center">{{ selectedQuantities[tier._id] || 0 }}</span>
                    <button
                      @click="updateQuantity(tier._id, 1, tier.maxPerPurchase)"
                      :disabled="(selectedQuantities[tier._id] || 0) >= Math.min(tier.maxPerPurchase, tier.capacity - tier.soldCount)"
                      class="w-8 h-8 rounded-lg bg-indigo-600 text-gray-900 font-bold hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Attendee Details Form -->
            <div class="space-y-6 pt-4 border-t border-gray-200 mb-6">
              <div>
                <h4 class="font-semibold text-gray-900 text-sm">Billing Contact Info</h4>
                <div class="mt-2 space-y-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                    <input
                      v-model="customerName"
                      type="text"
                      placeholder="e.g. Jane Doe"
                      class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
                    <input
                      v-model="customerEmail"
                      type="email"
                      placeholder="jane@example.com"
                      class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Department / Association Code</label>
                    <input
                      v-model="departmentCode"
                      type="text"
                      placeholder="e.g. EDM, TVESA, ULSESA"
                      class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 uppercase focus:outline-none focus:border-indigo-500 transition"
                    />
                    <span class="text-[11px] text-gray-500 mt-1 block">Used to generate structured ticket code (e.g. V/T01/EDM)</span>
                  </div>
                </div>
              </div>

              <!-- Ticket Holders Info -->
              <template v-for="(attendees, tierId) in tierAttendees" :key="tierId">
                <div v-if="attendees.length > 0" class="pt-4 border-t border-gray-100">
                  <h4 class="font-semibold text-gray-900 text-sm mb-3">Ticket Holders ({{ eventData?.event?.tiers?.find(t => t._id === tierId)?.name }})</h4>
                  <div v-for="(attendee, index) in attendees" :key="index" class="p-3 bg-gray-50 border border-gray-100 rounded-lg mb-3">
                    <p class="text-xs font-semibold text-gray-500 mb-2">Ticket #{{ index + 1 }}</p>
                    <div class="space-y-3">
                      <div>
                        <input v-model="attendee.name" type="text" placeholder="Attendee Name" class="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <input v-model="attendee.email" type="email" placeholder="Attendee Email" class="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- Summary & Pay Button -->
            <div class="space-y-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Total Amount:</span>
                <span class="text-2xl font-extrabold text-gray-900">₦{{ totalAmount.toLocaleString() }}</span>
              </div>

              <button
                @click="processCheckout"
                :disabled="totalAmount <= 0 || !customerName || !customerEmail || submitting"
                class="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-sm"
              >
                <span v-if="submitting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ submitting ? 'Processing Order...' : 'Pay with Paystack 🔒' }}</span>
              </button>

              <p class="text-[11px] text-gray-500 text-center">
                Instant structured ticket code & unique QR Code emailed upon checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const config = useRuntimeConfig();
const route = useRoute();

const tenantSlug = ref(route.query.tenant || 'nursing');
const eventSlug = ref(route.params.slug);

const eventData = ref(null);
const loading = ref(true);
const submitting = ref(false);

const selectedQuantities = ref({});
const tierAttendees = ref({}); // { [tierId]: [{ name: '', email: '' }] }
const customerName = ref('');
const customerEmail = ref('');
const departmentCode = ref('');

function formatDate(dStr) {
  if (!dStr) return '';
  return new Date(dStr).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

function updateQuantity(tierId, delta, max) {
  const current = selectedQuantities.value[tierId] || 0;
  const next = Math.max(0, Math.min(max, current + delta));
  selectedQuantities.value = {
    ...selectedQuantities.value,
    [tierId]: next,
  };

  if (!tierAttendees.value[tierId]) {
    tierAttendees.value[tierId] = [];
  }
  
  if (next > tierAttendees.value[tierId].length) {
    for (let i = tierAttendees.value[tierId].length; i < next; i++) {
      tierAttendees.value[tierId].push({ name: '', email: '' });
    }
  } else if (next < tierAttendees.value[tierId].length) {
    tierAttendees.value[tierId].length = next;
  }
}

const totalAmount = computed(() => {
  if (!eventData.value?.event?.tiers) return 0;
  return eventData.value.event.tiers.reduce((sum, tier) => {
    const qty = selectedQuantities.value[tier._id] || 0;
    return sum + tier.price * qty;
  }, 0);
});

async function fetchEventDetails() {
  loading.value = true;
  try {
    const res = await fetch(`${config.public.apiBase}/events/tenant/${tenantSlug.value}/${eventSlug.value}`);
    if (res.ok) {
      eventData.value = await res.json();
    }
  } catch (err) {
    console.error('Error fetching event detail:', err);
  } finally {
    loading.value = false;
  }
}

async function processCheckout() {
  submitting.value = true;
  try {
    const items = Object.entries(selectedQuantities.value)
      .filter(([_, qty]) => qty > 0)
      .map(([tierId, quantity]) => ({ 
        tierId, 
        quantity,
        attendees: tierAttendees.value[tierId] || []
      }));

    const payload = {
      tenantId: eventData.value.tenant.id,
      eventId: eventData.value.event._id,
      customerName: customerName.value,
      customerEmail: customerEmail.value,
      departmentCode: departmentCode.value || 'EDM',
      items,
      callbackUrl: `${window.location.origin}/order/confirmation`,
    };

    const res = await fetch(`${config.public.apiBase}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || 'Failed to initialize order');
      return;
    }

    const orderResult = await res.json();

    if (orderResult.authorizationUrl) {
      window.location.href = orderResult.authorizationUrl;
    } else {
      alert('Order placed successfully!');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    alert('An unexpected error occurred during checkout.');
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  fetchEventDetails();
});
</script>
