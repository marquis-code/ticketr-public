<template>
  <div class="min-h-screen   flex flex-col">
    <!-- Top Header -->
    <header class="glass-card border-b border-gray-200/80 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <NuxtLink :to="`/?tenant=${tenantSlug}`" class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition flex items-center gap-2">
          ← Back to Events
        </NuxtLink>
        <span class="text-xs text-primary font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          {{ eventData?.tenant?.name || 'Ticketr' }}
        </span>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex-grow w-full">
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
            <div class="relative w-full h-[300px] sm:h-[450px] md:h-[600px] bg-slate-950">
              <template v-if="eventData.event.carouselImages && eventData.event.carouselImages.length > 1">
                <div class="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full w-full">
                  <div
                    v-for="(img, idx) in eventData.event.carouselImages"
                    :key="idx"
                    class="w-full flex-shrink-0 snap-center h-full relative"
                  >
                    <img :src="img" :alt="eventData.event.title" class="w-full h-full object-contain" />
                  </div>
                </div>
                <!-- Carousel indicators -->
                <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  <div v-for="(_, i) in eventData.event.carouselImages" :key="'ind'+i" class="w-2 h-2 rounded-full bg-white/50"></div>
                </div>
              </template>
              <img
                v-else
                :src="(eventData.event.carouselImages && eventData.event.carouselImages[0]) || eventData.event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'"
                :alt="eventData.event.title"
                class="w-full h-full object-contain"
              />
            </div>

            <!-- Details Body -->
            <div class="p-6 md:p-8 space-y-6">
              <div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3 inline-block">
                  <div class="flex items-center gap-1">
                    <Globe v-if="eventData.event.isVirtual" class="w-3 h-3" />
                    <MapPin v-else class="w-3 h-3" />
                    <span>{{ eventData.event.isVirtual ? 'Virtual Event' : eventData.event.location }}</span>
                  </div>
                </span>
                <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2">
                  {{ tenantSlug === 'thebig5' ? "THE BIG FIVES's" : eventData.event.title }}
                </h1>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl /60 border border-gray-200">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg">
                    <Calendar class="w-5 h-5" />
                  </div>
                  <div>
                    <span class="text-xs text-gray-500 block uppercase font-medium">Date & Time</span>
                    <span class="text-sm font-semibold text-gray-900">{{ formatDate(eventData.event.startDate) }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg">
                    <MapPin class="w-5 h-5" />
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
          <div class="glass-card rounded-2xl p-4 md:p-8 border-primary/30 sticky top-24">
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
                  <div class="flex gap-4">
                    <img v-if="tier.templateImageUrl" :src="tier.templateImageUrl" class="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                    <div>
                      <h4 class="font-bold text-gray-900 text-base">{{ tier.name }}</h4>
                      <p v-if="tier.description" class="text-xs text-gray-500 line-clamp-2 mt-0.5">{{ tier.description }}</p>
                      <span class="text-[11px] text-gray-400 block mt-1">{{ tier.capacity - tier.soldCount }} tickets remaining</span>
                    </div>
                  </div>
                  <span class="text-lg font-extrabold text-primary">
                    {{ tier.price === 0 ? 'Free' : `₦${tier.price.toLocaleString()}` }}
                  </span>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center justify-between pt-3 border-t border-gray-200/60 mt-2">
                  <span class="text-xs text-gray-500">Qty (Max {{ tier.capacity - tier.soldCount }})</span>
                  <div class="flex items-center gap-3">
                    <button
                      @click="updateQuantity(tier._id, -1, tier.capacity - tier.soldCount)"
                      :disabled="!selectedQuantities[tier._id]"
                      class="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
                    >
                      -
                    </button>
                    <span class="font-bold text-gray-900 text-sm w-4 text-center">{{ selectedQuantities[tier._id] || 0 }}</span>
                    <button
                      @click="updateQuantity(tier._id, 1, tier.capacity - tier.soldCount)"
                      :disabled="(selectedQuantities[tier._id] || 0) >= (tier.capacity - tier.soldCount)"
                      class="w-8 h-8 rounded-lg bg-primary text-white font-bold hover:bg-primary-700 disabled:opacity-30 disabled:pointer-events-none transition"
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
                    <CustomDropdown
                      v-model="departmentCode"
                      :options="departments"
                      placeholder="Select your department"
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
                      <div>
                        <CustomDropdown
                          v-model="attendee.departmentCode"
                          :options="departments"
                          :allowEmpty="true"
                          emptyLabel="Same as billing contact"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- Summary & Pay Button -->
            <div class="space-y-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-bold text-gray-900">₦{{ subtotalAmount.toLocaleString() }}</span>
              </div>
              <div v-if="markupAmount > 0" class="flex items-center justify-between text-sm pt-2">
                <span class="text-gray-600">Platform Fee:</span>
                <span class="font-bold text-gray-900">₦{{ markupAmount.toLocaleString() }}</span>
              </div>
              <div class="flex items-center justify-between text-base pt-2 border-t border-gray-200">
                <span class="text-gray-900 font-semibold">Total Amount:</span>
                <span class="text-2xl font-extrabold text-primary">₦{{ totalAmount.toLocaleString() }}</span>
              </div>

              <button
                @click="processCheckout"
                :disabled="totalAmount <= 0 || !customerName || !customerEmail || submitting"
                class="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-sm"
              >
                <span v-if="submitting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ submitting ? 'Processing Order...' : 'Pay with Paystack' }}</span>
                <Lock v-if="!submitting" class="w-4 h-4" />
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
import { Globe, MapPin, Calendar, Lock } from 'lucide-vue-next';

const config = useRuntimeConfig();
const route = useRoute();

const reqUrl = useRequestURL();

const resolveSubdomain = () => {
  if (route.query.tenant) return route.query.tenant;
  const host = reqUrl.hostname;
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    const parts = host.split('.');
    if (parts.length > 2 && parts[0] !== 'www') {
      return parts[0];
    }
  }
  return null;
};

const tenantSlug = ref(resolveSubdomain());
const eventSlug = ref(route.params.slug);

const { data, pending: loading } = await useFetch(
  tenantSlug.value ? `${config.public.apiBase}/events/tenant/${tenantSlug.value}/${eventSlug.value}` : null
);

const eventData = computed(() => data.value || null);
const submitting = ref(false);

useSeoMeta({
  title: computed(() => eventData.value?.event?.title ? `${eventData.value.event.title} - ${eventData.value.tenant.name}` : 'Event Details | Ticketr'),
  ogTitle: computed(() => eventData.value?.event?.title || 'Event Details'),
  description: computed(() => eventData.value?.event?.description?.substring(0, 160) || 'Buy tickets for this event.'),
  ogDescription: computed(() => eventData.value?.event?.description?.substring(0, 160) || 'Buy tickets for this event.'),
  ogImage: computed(() => eventData.value?.event?.bannerUrl || eventData.value?.tenant?.logoUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'),
  twitterCard: 'summary_large_image',
});

// Update favicon dynamically
useHead({
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: computed(() => eventData.value?.tenant?.logoUrl || '/favicon.ico')
    }
  ]
});

const selectedQuantities = ref({});
const tierAttendees = ref({}); // { [tierId]: [{ name: '', email: '' }] }
const customerName = ref('');
const customerEmail = ref('');
const departmentCode = ref('');

const departments = [
  { code: 'EDF', name: 'Educational Foundation' },
  { code: 'EDM', name: 'Educational Management' },
  { code: 'ADE', name: 'Adult Education' },
  { code: 'TVESA', name: 'Technology and Vocational Education' },
  { code: 'ULSESA', name: 'Science Education' },
];

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
      tierAttendees.value[tierId].push({ name: '', email: '', departmentCode: '' });
    }
  } else if (next < tierAttendees.value[tierId].length) {
    tierAttendees.value[tierId].length = next;
  }
}

const subtotalAmount = computed(() => {
  if (!eventData.value?.event?.tiers) return 0;
  return eventData.value.event.tiers.reduce((sum, tier) => {
    const qty = selectedQuantities.value[tier._id] || 0;
    return sum + tier.price * qty;
  }, 0);
});

const markupAmount = computed(() => {
  if (!eventData.value?.event || eventData.value.event.markupStrategy !== 'ADD_TO_FEE' || eventData.value.event.markupFee <= 0) return 0;
  
  if (eventData.value.event.markupFeeType === 'PERCENTAGE') {
    return (eventData.value.event.markupFee / 100) * subtotalAmount.value;
  }
  // FLAT
  // If the customer hasn't selected any tickets, don't charge the flat fee
  if (subtotalAmount.value === 0) return 0; 
  return eventData.value.event.markupFee;
});

const totalAmount = computed(() => {
  return subtotalAmount.value + markupAmount.value;
});

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

</script>
