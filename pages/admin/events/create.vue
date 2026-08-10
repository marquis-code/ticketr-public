<template>
  <div>
    <!-- Navbar -->
    

    <main class="max-w-4xl mx-auto px-4 md:px-6 py-8 flex-grow w-full">
      <div class="glass-card rounded-2xl p-8 border-primary/30">
        <h1 class="text-2xl font-extrabold text-gray-900 mb-6">Create New Event</h1>

        <form @submit.prevent="submitForm" class="space-y-6">
          <!-- Event Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Event Title</label>
              <input
                v-model="form.title"
                @input="generateSlug"
                type="text"
                placeholder="e.g. Annual Nursing & Clinical Excellence Gala"
                required
                class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">URL Slug</label>
              <input
                v-model="form.slug"
                type="text"
                placeholder="nursing-gala-2026"
                required
                class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Venue / Location</label>
              <input
                v-model="form.location"
                type="text"
                placeholder="Main Campus Auditorium"
                required
                class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Start Date & Time</label>
              <input
                v-model="form.startDate"
                type="datetime-local"
                required
                class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">End Date & Time</label>
              <input
                v-model="form.endDate"
                type="datetime-local"
                required
                class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Event Description</label>
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="Provide details about schedule, dress code, and highlights..."
                required
                class="w-full  border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 transition"
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

          <!-- Ticket Tiers Builder -->
          <div class="pt-6 border-t border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-gray-900">Ticket Tiers & Pricing</h3>
                <p class="text-xs text-gray-600">Add tickets like VIP, Regular, or Student Passes.</p>
              </div>
              <button type="button" @click="addTier" class="text-xs font-bold text-primary hover:text-primary">
                + Add Ticket Tier
              </button>
            </div>

            <div class="space-y-4">
              <div
                v-for="(tier, index) in form.tiers"
                :key="index"
                class="p-4 rounded-xl /60 border border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center"
              >
                <div>
                  <label class="block text-[11px] text-gray-500 mb-1">Tier Name</label>
                  <input
                    v-model="tier.name"
                    type="text"
                    placeholder="VIP / Standard"
                    required
                    class="w-full  border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label class="block text-[11px] text-gray-500 mb-1">Price (₦)</label>
                  <input
                    v-model.number="tier.price"
                    type="number"
                    min="0"
                    placeholder="2500"
                    required
                    class="w-full  border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label class="block text-[11px] text-gray-500 mb-1">Capacity</label>
                  <input
                    v-model.number="tier.capacity"
                    type="number"
                    min="1"
                    placeholder="100"
                    required
                    class="w-full  border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label class="block text-[11px] text-gray-500 mb-1">Max Per Purchase</label>
                  <input
                    v-model.number="tier.maxPerPurchase"
                    type="number"
                    min="1"
                    placeholder="700"
                    required
                    class="w-full  border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                  />
                </div>

                <div class="flex items-center justify-end pt-4 sm:pt-0">
                  <button
                    type="button"
                    @click="removeTier(index)"
                    :disabled="form.tiers.length === 1"
                    class="text-xs text-rose-400 hover:text-rose-300 font-semibold disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="errorMsg" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {{ errorMsg }}
          </div>

          <div class="pt-4 flex justify-end">
            <button type="submit" :disabled="submitting" class="btn-primary py-3 px-8 text-sm">
              <Send v-if="!submitting" class="w-4 h-4" />
              <span>{{ submitting ? 'Publishing Event...' : 'Publish Event' }}</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });

import { toast } from 'vue-sonner';
import { ref } from 'vue';
import { Send, Check } from 'lucide-vue-next';

const config = useRuntimeConfig();

const submitting = ref(false);
const errorMsg = ref('');
const bannerFile = ref(null);

const form = ref({
  title: '',
  slug: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
  carouselImages: [],
  tiers: [
    { name: 'Standard Ticket', price: 2500, capacity: 100, maxPerPurchase: 700 },
  ],
});

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

function toggleCarouselImage(url) {
  const idx = form.value.carouselImages.indexOf(url);
  if (idx > -1) {
    form.value.carouselImages.splice(idx, 1);
  } else {
    form.value.carouselImages.push(url);
  }
}

function generateSlug() {
  if (form.value.title) {
    form.value.slug = form.value.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }
}



function addTier() {
  form.value.tiers.push({
    name: 'VIP Pass',
    price: 5000,
    capacity: 50,
    maxPerPurchase: 700,
  });
}

function removeTier(idx) {
  if (form.value.tiers.length > 1) {
    form.value.tiers.splice(idx, 1);
  }
}

async function submitForm() {
  const token = localStorage.getItem('ticketr_admin_token');
  if (!token) {
    useRouter().push('/admin/login');
    return;
  }

  submitting.value = true;
  errorMsg.value = '';

  try {
    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('slug', form.value.slug);
    formData.append('location', form.value.location);
    formData.append('startDate', form.value.startDate);
    formData.append('endDate', form.value.endDate);
    formData.append('description', form.value.description);
    formData.append('carouselImages', JSON.stringify(form.value.carouselImages));
    formData.append('tiers', JSON.stringify(form.value.tiers));

    const res = await fetch(`${config.public.apiBase}/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      toast.success('Event published successfully!');
      useRouter().push('/admin/events');
    } else {
      const err = await res.json();
      errorMsg.value = err.message || 'Failed to create event';
    }
  } catch (err) {
    errorMsg.value = 'Network error while publishing event';
  } finally {
    submitting.value = false;
  }
}
</script>
