<template>
  <div >
    <!-- Navbar -->
    

    <main class="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 py-6 md:py-8 flex-grow w-full">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <AppLoader size="lg" color="primary" />
      </div>

      <div v-else-if="!eventData" class="text-center py-10">
        <p class="text-gray-500">Event not found.</p>
      </div>

      <div v-else class="glass-card rounded-2xl p-4 sm:p-6 md:p-8 border-primary/30">
        <h1 class="text-2xl font-extrabold text-gray-900 mb-6">Edit Event: {{ eventData.title }}</h1>

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 mb-6">
          <button
            @click="activeTab = 'details'"
            :class="[
              'py-2 px-4 text-sm font-semibold border-b-2 transition',
              activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            Event Details
          </button>
          <button
            @click="activeTab = 'tickets'"
            :class="[
              'py-2 px-4 text-sm font-semibold border-b-2 transition',
              activeTab === 'tickets' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            Manage Tickets
          </button>
        </div>

        <!-- Event Details Tab -->
        <form v-if="activeTab === 'details'" @submit.prevent="updateEventDetails" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Event Title</label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input
                v-model="form.location"
                type="text"
                required
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Check-In Starts (Optional)</label>
              <input
                v-model="form.checkInStart"
                type="datetime-local"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Check-In Ends (Optional)</label>
              <input
                v-model="form.checkInEnd"
                type="datetime-local"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Event Description</label>
              <textarea
                v-model="form.description"
                rows="4"
                required
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
              ></textarea>
            </div>

            <!-- Carousel Gallery Selection -->
            <div class="md:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-2">Cover / Carousel Images (Select multiple)</label>
              <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
                <div
                  v-for="(url, i) in galleryOptions"
                  :key="i"
                  @click="toggleCarouselImage(url)"
                  :class="[
                    'relative rounded-lg overflow-hidden border-2 cursor-pointer transition aspect-video',
                    form.carouselImages.includes(url) ? 'border-primary' : 'border-transparent hover:border-gray-300'
                  ]"
                >
                  <img :src="url" class="w-full h-full object-cover" />
                  <div v-if="form.carouselImages.includes(url)" class="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                    <Check class="w-3 h-3" />
                  </div>
                </div>
              </div>
              <p class="text-[10px] text-gray-400 mt-2">Select one image for a static banner, or multiple for a carousel header.</p>
            </div>
          </div>

          <!-- Ticket & QR Code Settings -->
          <div class="pt-6 border-t border-gray-200">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Ticket & QR Code Settings</h3>
            
            <div class="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-1">QR Code Delivery Method</label>
                <p class="text-[11px] text-gray-500 mb-3">Configure how you want to deliver QR codes to your attendees.</p>
                <div class="flex flex-col space-y-2">
                  <label class="flex items-center space-x-2">
                    <input type="radio" v-model="form.qrCodeDelivery" value="STAMP_ON_TICKET" class="text-primary focus:ring-primary" />
                    <span class="text-xs text-gray-700 font-medium">Stamp on PDF Ticket (Standard)</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="radio" v-model="form.qrCodeDelivery" value="STANDALONE" class="text-primary focus:ring-primary" />
                    <span class="text-xs text-gray-700 font-medium">Standalone (QR code in email only, no PDF ticket generated)</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="radio" v-model="form.qrCodeDelivery" value="NONE" class="text-primary focus:ring-primary" />
                    <span class="text-xs text-gray-700 font-medium">None (Do not generate PDF tickets or QR codes)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Checkout Form Configuration -->
          <div class="pt-6 border-t border-gray-200">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Checkout Form Settings</h3>
            
            <div class="space-y-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-semibold text-gray-800">Legacy Department Field</h4>
                  <p class="text-[11px] text-gray-500">Enable this if your event requires attendees to specify their department or organization.</p>
                </div>
                <input type="checkbox" v-model="form.formSettings.requireDepartment" class="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary">
              </div>

              <div v-if="form.formSettings.requireDepartment" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label class="block text-[11px] font-medium text-gray-600 mb-1">Field Label</label>
                  <input type="text" v-model="form.formSettings.departmentLabel" placeholder="e.g. Company, Group, Department" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none bg-white" />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-600 mb-1">Dropdown Options (Comma separated)</label>
                  <input type="text" v-model="form.formSettings.departmentOptionsStr" placeholder="e.g. Sales, Marketing, IT (Leave blank for text input)" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none bg-white" />
                </div>
              </div>
            </div>

            <!-- Custom Fields Builder -->
            <div class="mt-4 p-4 rounded-xl border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h4 class="text-sm font-semibold text-gray-800">Custom Questions</h4>
                  <p class="text-[11px] text-gray-500">Ask attendees for T-shirt size, dietary requirements, etc.</p>
                </div>
                <button type="button" @click="addCustomField" class="text-xs font-bold text-primary hover:text-primary-600">+ Add Question</button>
              </div>

              <div v-for="(field, idx) in form.formSettings.customFields" :key="idx" class="p-3 bg-gray-50 border border-gray-100 rounded-lg mb-3 relative">
                <button type="button" @click="removeCustomField(idx)" class="absolute top-2 right-2 text-rose-400 hover:text-rose-600"><X class="w-4 h-4" /></button>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                  <div>
                    <label class="block text-[11px] font-medium text-gray-600 mb-1">Question Label</label>
                    <input type="text" v-model="field.label" placeholder="e.g. T-Shirt Size" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none bg-white" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-gray-600 mb-1">Field Type</label>
                    <select v-model="field.type" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none bg-white">
                      <option value="text">Short Text</option>
                      <option value="select">Dropdown Options</option>
                    </select>
                  </div>
                  <div class="sm:col-span-2" v-if="field.type === 'select'">
                    <label class="block text-[11px] font-medium text-gray-600 mb-1">Options (Comma separated)</label>
                    <input type="text" v-model="field.optionsStr" placeholder="e.g. S, M, L, XL" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none bg-white" />
                  </div>
                  <div class="sm:col-span-2 flex items-center gap-2 mt-1">
                    <input type="checkbox" :id="'req-'+idx" v-model="field.required" class="w-3.5 h-3.5 text-primary rounded border-gray-300 focus:ring-primary" />
                    <label :for="'req-'+idx" class="text-[11px] text-gray-600">Required field</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="detailsMsg" :class="detailsError ? 'text-rose-500 bg-rose-500/10' : 'text-emerald-500 bg-emerald-500/10'" class="p-3 rounded-xl border text-xs">
            {{ detailsMsg }}
          </div>

          <div class="pt-4">
            <button type="submit" :disabled="submittingDetails" class="btn-primary w-full flex justify-center py-3 px-4 md:px-6 text-sm">
              <Save v-if="!submittingDetails" class="w-4 h-4" />
              <AppLoader v-else size="sm" color="gray" />
              <span>{{ submittingDetails ? 'Saving...' : 'Save Details' }}</span>
            </button>
          </div>
        </form>

        <!-- Manage Tickets Tab -->
        <div v-if="activeTab === 'tickets'" class="space-y-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">Existing Tickets</h3>
            <button @click="showAddTierModal = true" class="text-xs font-bold text-primary flex items-center gap-1">
              <Plus class="w-4 h-4" /> Add Ticket
            </button>
          </div>

          <div class="space-y-4">
            <div
              v-for="tier in tiers"
              :key="tier._id"
              class="p-4 rounded-xl border border-gray-200 bg-gray-50/50"
            >
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 flex items-center gap-2">
                    {{ tier.name }}
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                      ₦{{ tier.price.toLocaleString() }}
                    </span>
                    <span v-if="tier.isActive === false" class="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-bold">
                      Hidden
                    </span>
                    <span v-if="tier.isCoupleTicket" class="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 font-bold">
                      Couple
                    </span>
                  </h4>
                  <p class="text-xs text-gray-500 mt-1">{{ tier.description || 'No description provided.' }}</p>
                  <p class="text-xs font-medium text-gray-700 mt-1">Capacity: {{ tier.soldCount }} / {{ tier.capacity }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <img v-if="tier.templateImageUrl" :src="tier.templateImageUrl" class="w-10 h-10 rounded-lg object-cover border" />
                  <button @click="openEditTier(tier)" class="p-2 text-gray-500 hover:text-primary transition rounded-lg hover:bg-white border border-transparent hover:border-gray-200">
                    <Edit3 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Tier Edit / Add Modal -->
    <div v-if="editingTier || showAddTierModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div class="glass-card w-full max-w-md p-6 rounded-2xl relative">
        <button @click="closeTierModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
        <h3 class="text-lg font-bold text-gray-900 mb-4">{{ editingTier ? 'Edit Ticket Tier' : 'Add New Ticket' }}</h3>

        <form @submit.prevent="saveTier" class="space-y-4">
          <div>
            <label class="block text-[11px] font-medium text-gray-600 mb-1">Ticket Name</label>
            <input v-model="tierForm.name" type="text" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-[11px] font-medium text-gray-600 mb-1">Description (Optional)</label>
            <textarea v-model="tierForm.description" rows="2" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-medium text-gray-600 mb-1">Price (₦)</label>
              <input v-model.number="tierForm.price" type="number" min="0" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label class="block text-[11px] font-medium text-gray-600 mb-1">Total Capacity</label>
              <input v-model.number="tierForm.capacity" type="number" min="1" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          
          <div class="pt-2 border-t mt-4">
            <label class="block text-[11px] font-medium text-gray-600 mb-1">Upload Ticket Banner (Optional)</label>
            <input type="file" @change="handleTierBanner" accept="image/*" class="w-full text-xs" />
            <div v-if="tierForm.templateImageUrl" class="mt-2">
               <img :src="tierForm.templateImageUrl" class="h-16 rounded-md object-cover" />
            </div>
          </div>
          
          <div class="pt-2 border-t mt-4 flex items-center gap-2">
            <input type="checkbox" id="isActive" v-model="tierForm.isActive" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
            <label for="isActive" class="text-[11px] font-medium text-gray-600">Ticket is Visible & Active</label>
          </div>
          
          <div class="pt-2 flex items-center gap-2">
            <input type="checkbox" id="isCoupleTicket" v-model="tierForm.isCoupleTicket" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
            <label for="isCoupleTicket" class="text-[11px] font-medium text-gray-600">Is a Couple Ticket (Admits 2 Attendees)</label>
          </div>

          <div v-if="tierMsg" class="text-xs text-rose-500 mt-2">{{ tierMsg }}</div>

          <div class="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button type="button" @click="closeTierModal" class="w-full sm:w-auto px-4 py-3 sm:py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-xl sm:rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" :disabled="submittingTier" class="w-full sm:w-auto justify-center px-4 py-3 sm:py-2 text-xs font-medium text-white bg-primary rounded-xl sm:rounded-lg hover:bg-indigo-600 flex items-center gap-1">
              <AppLoader v-if="submittingTier" size="xs" color="white" />
              {{ editingTier ? 'Save Changes' : 'Add Ticket' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });


import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Edit3, Plus, Save, X, Check, Loader2 } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

const activeTab = ref('details');
const loading = ref(true);
const eventData = ref(null);
const tiers = ref([]);

const submittingDetails = ref(false);
const detailsMsg = ref('');
const detailsError = ref(false);

const galleryOptions = [
  "https://res.cloudinary.com/marquis/image/upload/v1786363972/ticketr/gallery/zuyju8e1lkqpeqdrngjk.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786363975/ticketr/gallery/pkyy7pq5hvclifbtp3y6.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786363981/ticketr/gallery/kkwastlxnxg0vk9ayeyk.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786363984/ticketr/gallery/rgw9y0reyvfglxji5sp9.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786363987/ticketr/gallery/qye7zi8pxmedxunhqpbe.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786364008/ticketr/gallery/jgpqiq15mvsyzgdveggg.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786364032/ticketr/gallery/rfuf483exlldszlsyrjd.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786364035/ticketr/gallery/sx8bgrpgl9nbogpj0kgy.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786364046/ticketr/gallery/wpvrm8ti8emamcuk2dml.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786364049/ticketr/gallery/vmte98lxfd29xpcomsba.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786364051/ticketr/gallery/l33vv0u4raeqjbpphby3.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786364055/ticketr/gallery/gedlh0l03g0pkc8s6unx.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786364057/ticketr/gallery/qtwkfzvwjmzaoomebkbg.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786364060/ticketr/gallery/mecwrzea3uwxofbmbnks.jpg",
  "https://res.cloudinary.com/marquis/image/upload/v1786364069/ticketr/gallery/fx3yh17e3r8fchtzmpb8.jpg"
];

const form = ref({
  title: '',
  description: '',
  location: '',
  checkInStart: '',
  checkInEnd: '',
  carouselImages: [],
  qrCodeDelivery: 'STAMP_ON_TICKET',
  formSettings: {
    requireDepartment: false,
    departmentLabel: 'Department / Association Code',
    departmentOptionsStr: '',
    customFields: []
  },
});

const showAddTierModal = ref(false);
const editingTier = ref(null);
const submittingTier = ref(false);
const tierMsg = ref('');
const tierForm = ref({
  name: '',
  description: '',
  price: 0,
  capacity: 100,
  templateImageUrl: null,
  isActive: true,
  isCoupleTicket: false
});
const tierBannerFile = ref(null);

const eventId = route.params.id;

async function fetchEvent() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) return router.push('/admin/login');

  try {
    const res = await fetch(`${config.public.apiBase}/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const ev = await res.json();
      if (ev) {
        eventData.value = ev;
        form.value.title = ev.title;
        form.value.description = ev.description;
        form.value.location = ev.location;
        form.value.checkInStart = ev.checkInStart ? new Date(new Date(ev.checkInStart).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '';
        form.value.checkInEnd = ev.checkInEnd ? new Date(new Date(ev.checkInEnd).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '';
        form.value.carouselImages = ev.carouselImages || [];
        if (form.value.carouselImages.length === 0 && ev.bannerUrl) {
          form.value.carouselImages = [ev.bannerUrl];
        }
        form.value.qrCodeDelivery = ev.qrCodeDelivery || 'STAMP_ON_TICKET';
        form.value.formSettings = ev.formSettings || { requireDepartment: false, departmentLabel: 'Department / Association Code', departmentOptionsStr: '', customFields: [] };
        if (ev.formSettings && ev.formSettings.departmentOptions) {
          form.value.formSettings.departmentOptionsStr = ev.formSettings.departmentOptions.join(', ');
        }
        if (ev.formSettings && ev.formSettings.customFields) {
          form.value.formSettings.customFields = ev.formSettings.customFields.map(cf => ({
            label: cf.label,
            type: cf.type,
            required: cf.required,
            optionsStr: cf.options ? cf.options.join(', ') : ''
          }));
        }
        tiers.value = ev.tiers || [];
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function toggleCarouselImage(url) {
  const idx = form.value.carouselImages.indexOf(url);
  if (idx > -1) {
    form.value.carouselImages.splice(idx, 1);
  } else {
    form.value.carouselImages.push(url);
  }
}

function addCustomField() {
  form.value.formSettings.customFields.push({
    label: '',
    type: 'text',
    optionsStr: '',
    required: false
  });
}

function removeCustomField(idx) {
  form.value.formSettings.customFields.splice(idx, 1);
}

async function updateEventDetails() {
  const token = localStorage.getItem('ticketr_admin_token');
  submittingDetails.value = true;
  detailsMsg.value = '';
  try {
    const payload = { ...form.value };
    if (payload.checkInStart) payload.checkInStart = new Date(payload.checkInStart).toISOString();
    if (payload.checkInEnd) payload.checkInEnd = new Date(payload.checkInEnd).toISOString();

    const processedFormSettings = {
      requireDepartment: form.value.formSettings.requireDepartment,
      departmentLabel: form.value.formSettings.departmentLabel,
      departmentOptions: form.value.formSettings.departmentOptionsStr.split(',').map(s => s.trim()).filter(Boolean),
      customFields: form.value.formSettings.customFields.map(cf => ({
        name: cf.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
        label: cf.label,
        type: cf.type,
        required: cf.required,
        options: cf.optionsStr ? cf.optionsStr.split(',').map(s => s.trim()).filter(Boolean) : []
      }))
    };
    payload.formSettings = processedFormSettings;
    payload.qrCodeDelivery = form.value.qrCodeDelivery;

    const res = await fetch(`${config.public.apiBase}/events/${eventId}/details`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      detailsError.value = false;
      detailsMsg.value = 'Event details updated successfully!';
      await fetchEvent();
    } else {
      const err = await res.json();
      detailsError.value = true;
      detailsMsg.value = err.message || 'Failed to update';
    }
  } catch (e) {
    detailsError.value = true;
    detailsMsg.value = 'Network error';
  } finally {
    submittingDetails.value = false;
  }
}

function openEditTier(tier) {
  editingTier.value = tier;
  tierForm.value = {
    name: tier.name,
    description: tier.description || '',
    price: tier.price,
    capacity: tier.capacity,
    templateImageUrl: tier.templateImageUrl,
    isActive: tier.isActive !== undefined ? tier.isActive : true,
    isCoupleTicket: tier.isCoupleTicket || false
  };
  tierBannerFile.value = null;
  tierMsg.value = '';
}

function closeTierModal() {
  showAddTierModal.value = false;
  editingTier.value = null;
  tierForm.value = { name: '', description: '', price: 0, capacity: 100, templateImageUrl: null, isActive: true, isCoupleTicket: false };
  tierBannerFile.value = null;
  tierMsg.value = '';
}

function handleTierBanner(e) {
  if (e.target.files && e.target.files[0]) {
    tierBannerFile.value = e.target.files[0];
  }
}

async function saveTier() {
  const token = localStorage.getItem('ticketr_admin_token');
  submittingTier.value = true;
  tierMsg.value = '';

  try {
    if (editingTier.value) {
      // Update existing
      const res = await fetch(`${config.public.apiBase}/events/${eventId}/tiers/${editingTier.value._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: tierForm.value.name,
          description: tierForm.value.description,
          price: tierForm.value.price,
          capacity: tierForm.value.capacity,
          isActive: tierForm.value.isActive,
          isCoupleTicket: tierForm.value.isCoupleTicket,
        })
      });

      if (!res.ok) throw new Error((await res.json()).message);

      // Handle banner upload if selected
      if (tierBannerFile.value) {
        const formData = new FormData();
        formData.append('banner', tierBannerFile.value);
        const bannerRes = await fetch(`${config.public.apiBase}/events/${eventId}/tiers/${editingTier.value._id}/banner`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (!bannerRes.ok) throw new Error('Failed to upload banner');
      }

    } else {
      // Create new
      const res = await fetch(`${config.public.apiBase}/events/${eventId}/tiers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: tierForm.value.name,
          description: tierForm.value.description,
          price: tierForm.value.price,
          capacity: tierForm.value.capacity,
          isActive: tierForm.value.isActive,
          isCoupleTicket: tierForm.value.isCoupleTicket,
        })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      
      const newTier = await res.json();
      
      if (tierBannerFile.value) {
        const formData = new FormData();
        formData.append('banner', tierBannerFile.value);
        const bannerRes = await fetch(`${config.public.apiBase}/events/${eventId}/tiers/${newTier._id}/banner`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (!bannerRes.ok) throw new Error('Failed to upload banner');
      }
    }

    await fetchEvent();
    closeTierModal();
  } catch (e) {
    tierMsg.value = e.message || 'Operation failed';
  } finally {
    submittingTier.value = false;
  }
}

onMounted(() => {
  fetchEvent();
});
</script>
