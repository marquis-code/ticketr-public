<template>
  <div>
    <!-- Top Header -->
    

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-0 sm:px-4 md:px-6 py-6 md:py-8 flex-grow w-full">
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
          <div class="glass-card rounded-2xl p-4  border-primary/30 sticky top-24">
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
                    <div class="flex justify-between items-center mb-2">
                      <p class="text-xs font-semibold text-gray-500">Ticket #{{ index + 1 }}</p>
                      <button @click="copyBillingInfo(attendee)" type="button" class="text-[10px] text-primary font-medium hover:underline bg-primary-50 px-2 py-1 rounded">Copy Billing Info</button>
                    </div>
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

              <!-- Bank Account Details (shown upfront for Manual Transfer tenants) -->
              <div v-if="isManualTransfer && eventData?.tenant?.primaryRemittanceAccount" class="p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-xl">
                <h3 class="font-bold text-gray-900 text-sm mb-1">💳 Payment via Bank Transfer</h3>
                <p class="text-[11px] sm:text-xs text-gray-600 mb-3">Transfer the total amount to the account below, then place your order and upload proof of payment.</p>
                <div class="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 space-y-2 sm:space-y-3">
                  <div class="flex justify-between items-center"><span class="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider font-bold">Bank Name</span> <strong class="text-xs sm:text-sm text-gray-900">{{ eventData.tenant.primaryRemittanceAccount.bankName }}</strong></div>
                  <div class="flex justify-between items-center"><span class="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider font-bold">Account Number</span> 
                    <div class="flex items-center gap-1 sm:gap-2">
                      <strong class="text-sm sm:text-base text-primary font-mono bg-primary/5 px-2 py-1 rounded">{{ eventData.tenant.primaryRemittanceAccount.accountNumber }}</strong>
                      <button @click="copyToClipboard(eventData.tenant.primaryRemittanceAccount.accountNumber, 'Account Number')" class="p-1 sm:p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition" title="Copy Account Number"><Copy class="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                    </div>
                  </div>
                  <div class="flex justify-between items-center"><span class="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider font-bold">Account Name</span> 
                    <div class="flex items-center gap-1 sm:gap-2 text-right">
                      <strong class="text-xs sm:text-sm text-gray-900 max-w-[120px] sm:max-w-none">{{ eventData.tenant.primaryRemittanceAccount.accountName }}</strong>
                      <button @click="copyToClipboard(eventData.tenant.primaryRemittanceAccount.accountName, 'Account Name')" class="p-1 sm:p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition" title="Copy Account Name"><Copy class="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Place Order / Pay Button (before order is created) -->
              <div v-if="!manualTransferState.isActive">
                <button
                  @click="processCheckout"
                  :disabled="totalAmount <= 0 || !customerName || !customerEmail || submitting"
                  class="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-sm"
                >
                  <span v-if="submitting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{{ submitting ? 'Processing Order...' : (isManualTransfer ? 'Place Order & Upload Receipt' : 'Pay with Paystack') }}</span>
                  <Lock v-if="!submitting" class="w-4 h-4" />
                </button>
                <p class="text-[11px] text-gray-500 text-center mt-3">
                  {{ isManualTransfer ? 'Your tickets will be sent once payment is verified by the organizer.' : 'Instant structured ticket code & unique QR Code emailed upon checkout.' }}
                </p>
              </div>

              <!-- Receipt Upload (after order is created for manual transfer) -->
              <div v-else class="p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 sm:space-y-4">
                <h3 class="font-bold text-gray-900 text-sm mb-1">✅ Order Placed — Upload Proof of Payment</h3>
                <p class="text-[11px] sm:text-xs text-gray-600">Your order has been reserved. Please transfer the total amount to the account below and upload your receipt.</p>
                
                <!-- Bank Account Details (shown again during upload) -->
                <div v-if="eventData?.tenant?.primaryRemittanceAccount" class="bg-white p-4 sm:p-5 rounded-xl border-2 border-emerald-100 space-y-3 sm:space-y-4 shadow-sm">
                  <div class="flex justify-between items-center"><span class="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider font-bold">Bank Name</span> <strong class="text-sm sm:text-base text-gray-900">{{ eventData.tenant.primaryRemittanceAccount.bankName }}</strong></div>
                  <div class="flex justify-between items-center"><span class="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider font-bold">Account Number</span> 
                    <div class="flex items-center gap-1 sm:gap-2">
                      <strong class="text-base sm:text-lg text-primary font-mono bg-primary/10 px-2 sm:px-3 py-1 rounded-lg border border-primary/20">{{ eventData.tenant.primaryRemittanceAccount.accountNumber }}</strong>
                      <button @click="copyToClipboard(eventData.tenant.primaryRemittanceAccount.accountNumber, 'Account Number')" class="p-1.5 sm:p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition" title="Copy Account Number"><Copy class="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                    </div>
                  </div>
                  <div class="flex justify-between items-center"><span class="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider font-bold">Account Name</span> 
                    <div class="flex items-center gap-1 sm:gap-2 text-right">
                      <strong class="text-xs sm:text-sm text-gray-900 max-w-[120px] sm:max-w-none">{{ eventData.tenant.primaryRemittanceAccount.accountName }}</strong>
                      <button @click="copyToClipboard(eventData.tenant.primaryRemittanceAccount.accountName, 'Account Name')" class="p-1.5 sm:p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition" title="Copy Account Name"><Copy class="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Receipt Image</label>
                    <input type="file" ref="receiptInput" accept="image/*" @change="handleReceiptChange" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                  </div>
                  <div v-if="receiptPreviewUrl" class="rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <img :src="receiptPreviewUrl" alt="Receipt Preview" class="w-full h-auto max-h-48 object-contain" />
                  </div>
                  <button
                    @click="uploadReceipt"
                    :disabled="uploadingReceipt || !receiptPreviewUrl"
                    class="w-full btn-primary py-3 text-sm"
                  >
                    {{ uploadingReceipt ? 'Uploading...' : 'Submit Proof of Payment' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Success Modal -->
    <div v-if="showingSuccess" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div class="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Payment Under Review</h3>
        <p class="text-sm text-gray-600 mb-6">Your receipt has been uploaded. Once the organizer verifies the payment, your tickets will be sent to your email.</p>
        <NuxtLink :to="`/?tenant=${tenantSlug}`" class="btn-primary inline-block">Return to Homepage</NuxtLink>
      </div>
    </div>

    <!-- Processing Modal -->
    <div v-if="submitting || uploadingReceipt" class="fixed inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-[100] p-4">
      <div class="relative w-24 h-24 mb-6">
        <div class="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center text-indigo-600">
           <Lock class="w-8 h-8 animate-pulse" />
        </div>
      </div>
      <h3 class="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Processing...</h3>
      <p class="text-sm text-gray-500 max-w-xs text-center">Please wait while we handle your request. Do not close or refresh this page.</p>
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
        <div class="bg-emerald-500/20 text-emerald-400 rounded-full p-1"><Copy class="w-4 h-4" /></div>
        <span class="text-sm font-medium tracking-wide">{{ customToast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });

import { ref, computed, onMounted } from 'vue';
import { Globe, MapPin, Calendar, Lock, Copy } from 'lucide-vue-next';

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
const isManualTransfer = computed(() => eventData.value?.tenant?.paymentMethod === 'MANUAL_TRANSFER');
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

function copyBillingInfo(attendee) {
  attendee.name = customerName.value;
  attendee.email = customerEmail.value;
  attendee.departmentCode = departmentCode.value;
}

const manualTransferState = ref({
  isActive: false,
  orderId: null,
  remittanceAccount: null
});
const receiptInput = ref(null);
const receiptPreviewUrl = ref(null);
const uploadingReceipt = ref(false);
const showingSuccess = ref(false);

const customToast = ref({ show: false, message: '' });
let toastTimeout;

function copyToClipboard(text, label) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    
    // Custom Toast Logic
    customToast.value.message = `${label} copied to clipboard!`;
    customToast.value.show = true;
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      customToast.value.show = false;
    }, 3000);
  }
}

function handleReceiptChange(e) {
  const file = e.target.files?.[0];
  if (file) {
    receiptPreviewUrl.value = URL.createObjectURL(file);
  } else {
    receiptPreviewUrl.value = null;
  }
}

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
      toast.error(err.message || 'Failed to initialize order');
      return;
    }

    const orderResult = await res.json();

    if (orderResult.paymentMethod === 'MANUAL_TRANSFER') {
      manualTransferState.value.isActive = true;
      manualTransferState.value.orderId = orderResult.orderId;
      manualTransferState.value.remittanceAccount = orderResult.remittanceAccount;
    } else if (orderResult.authorizationUrl) {
      window.location.href = orderResult.authorizationUrl;
    } else {
      toast.success('Order placed successfully!');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    toast.error('An unexpected error occurred during checkout.');
  } finally {
    submitting.value = false;
  }
}

async function compressImage(file) {
  if (!file.type.startsWith('image/')) return file; // Skip PDFs or non-images
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Target max dimension
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          const newFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(newFile);
        }, 'image/jpeg', 0.7);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

async function uploadReceipt() {
  if (!receiptInput.value || !receiptInput.value.files || receiptInput.value.files.length === 0) {
    toast.error('Please select a receipt image to upload');
    return;
  }
  
  uploadingReceipt.value = true;
  try {
    const file = receiptInput.value.files[0];
    const optimizedFile = await compressImage(file);

    const formData = new FormData();
    formData.append('receipt', optimizedFile);
    formData.append('tenantId', eventData.value.tenant.id);

    const res = await fetch(`${config.public.apiBase}/orders/${manualTransferState.value.orderId}/upload-proof`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.message || 'Failed to upload receipt');
      return;
    }

    showingSuccess.value = true;
  } catch (err) {
    toast.error('Error uploading receipt');
  } finally {
    uploadingReceipt.value = false;
  }
}

</script>
