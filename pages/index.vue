<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <span class="font-display font-bold text-lg text-gray-900 tracking-tight">Ticketr</span>
        </NuxtLink>

        <div class="flex items-center gap-3">
          <div class="relative hidden md:block">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search events..."
              class="bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-56"
            />
          </div>
          <NuxtLink to="/my-tickets" class="text-sm font-medium text-gray-600 hover:text-primary transition hidden sm:inline-flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            My Tickets
          </NuxtLink>
          <a :href="adminUrl" target="_blank" class="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition">
            Organizer Login
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </header>

    <!-- Hero Carousel Section -->
    <section class="relative h-[520px] md:h-[560px] overflow-hidden">
      <!-- Carousel Slides -->
      <div class="absolute inset-0">
        <transition-group name="hero-fade">
          <div
            v-for="(slide, i) in heroSlides"
            :key="slide.id"
            v-show="currentSlide === i"
            class="absolute inset-0"
          >
            <img
              :src="slide.image"
              :alt="slide.alt"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/60 to-gray-900/30"></div>
          </div>
        </transition-group>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 h-full flex items-center">
        <div class="max-w-7xl mx-auto px-6 w-full">
          <div class="max-w-xl">
            <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-white/90 text-xs font-medium tracking-wide">{{ tenantInfo?.name ? tenantInfo.name + ' Portal' : 'Trusted by Organizations Nationwide' }}</span>
            </div>

            <h1 class="font-display text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-white leading-tight mb-5">
              {{ heroSlides[currentSlide].heading }}
            </h1>

            <p class="text-white/70 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              {{ heroSlides[currentSlide].subheading }}
            </p>

            <div class="flex items-center gap-3">
              <a href="#events" class="inline-flex items-center gap-2 bg-primary hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-all text-sm">
                Browse Events
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <NuxtLink to="/my-tickets" class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-all text-sm">
                Find My Tickets
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide Indicators -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <button
          v-for="(slide, i) in heroSlides"
          :key="'dot-' + i"
          @click="goToSlide(i)"
          class="transition-all duration-300 rounded-full"
          :class="currentSlide === i ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'"
        ></button>
      </div>

      <!-- Slide Arrows -->
      <button @click="prevSlide" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition hidden md:flex">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button @click="nextSlide" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition hidden md:flex">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>
    </section>

    <!-- Trust Bar -->
    <div class="bg-white border-b border-gray-200 py-4 px-6">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          <span class="font-medium">Secure Payments</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          <span class="font-medium">QR-Code Tickets</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          <span class="font-medium">Instant Email Delivery</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span class="font-medium">Verified Attendance</span>
        </div>
      </div>
    </div>

    <!-- Events List -->
    <main id="events" class="max-w-7xl mx-auto px-6 py-12 flex-grow w-full">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="font-display text-2xl font-bold text-gray-900">Upcoming Events</h2>
          <p class="text-sm text-gray-500 mt-1">{{ filteredEvents.length }} event{{ filteredEvents.length !== 1 ? 's' : '' }} available</p>
        </div>

        <!-- Mobile Search -->
        <div class="relative sm:hidden">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 3" :key="n" class="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
          <div class="bg-gray-100 h-48"></div>
          <div class="p-5">
            <div class="h-4 bg-gray-100 rounded w-1/3 mb-3"></div>
            <div class="h-5 bg-gray-100 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-100 rounded w-full mb-4"></div>
            <div class="h-10 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredEvents.length === 0" class="bg-white border border-gray-200 rounded-xl p-12 text-center max-w-md mx-auto my-12">
        <div class="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <h3 class="font-display text-lg font-bold text-gray-900 mb-2">No Events Yet</h3>
        <p class="text-gray-500 text-sm">There are currently no published events for this organization. Check back soon!</p>
      </div>

      <!-- Event Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="event in filteredEvents"
          :key="event._id"
          :to="`/event/${event.slug}?tenant=${activeSlug}`"
          class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 group flex flex-col"
        >
          <!-- Event Banner -->
          <div class="relative h-48 overflow-hidden">
            <img
              :src="event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'"
              :alt="event.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

            <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-medium text-gray-700">
              {{ event.isVirtual ? '🌐 Virtual' : '📍 ' + event.location }}
            </div>

            <div v-if="event.tiers && event.tiers.length" class="absolute bottom-3 right-3 bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-white">
              From {{ getMinPrice(event.tiers) }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-5 flex flex-col flex-grow">
            <div class="text-xs text-primary font-semibold mb-2 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {{ formatDate(event.startDate) }}
            </div>
            <h3 class="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-1">
              {{ event.title }}
            </h3>
            <p class="text-gray-500 text-sm line-clamp-2 mb-5 flex-grow">
              {{ event.description }}
            </p>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {{ event.tiers ? event.tiers.reduce((sum, t) => sum + (t.capacity - t.soldCount), 0) : 0 }} spots left
              </div>

              <span class="inline-flex items-center gap-1.5 text-primary text-sm font-semibold group-hover:gap-2.5 transition-all">
                Get Tickets
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 py-8 px-6 mt-auto">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <span class="text-sm text-gray-500">© 2026 Ticketr. All rights reserved.</span>
        </div>
        <div class="flex items-center gap-6 text-sm text-gray-500">
          <span class="hover:text-gray-900 transition cursor-pointer">Privacy</span>
          <span class="hover:text-gray-900 transition cursor-pointer">Terms</span>
          <span class="hover:text-gray-900 transition cursor-pointer">Support</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const config = useRuntimeConfig();
const route = useRoute();
const reqUrl = useRequestURL();

const resolveSubdomain = () => {
  if (route.query.tenant) return route.query.tenant;
  const host = reqUrl.hostname;
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    const parts = host.split('.');
    if (parts.length > 2) {
      return parts[0];
    }
  }
  return 'ulsesa'; // Default fallback
};

const activeSlug = ref(resolveSubdomain());
const adminUrl = computed(() => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://admin.ticketr.org';
  }
  return 'http://localhost:3001';
});

const { data, pending: loading } = await useFetch(`${config.public.apiBase}/events/tenant/${activeSlug.value}`);

const tenantInfo = computed(() => data.value?.tenant || null);
const events = computed(() => data.value?.events || []);
const searchQuery = ref('');

useSeoMeta({
  title: computed(() => tenantInfo.value?.name ? `${tenantInfo.value.name} Tickets | Ticketr` : 'Ticketr - Modern Event Ticketing'),
  ogTitle: computed(() => tenantInfo.value?.name ? `${tenantInfo.value.name} Tickets` : 'Ticketr'),
  description: computed(() => tenantInfo.value?.name ? `Official ticketing portal for ${tenantInfo.value.name}. Book your event tickets securely.` : 'Book event tickets seamlessly.'),
  ogDescription: computed(() => tenantInfo.value?.name ? `Official ticketing portal for ${tenantInfo.value.name}.` : 'Book event tickets seamlessly.'),
  ogImage: computed(() => tenantInfo.value?.logoUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'),
  twitterCard: 'summary_large_image',
});

useHead({
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: computed(() => tenantInfo.value?.logoUrl || '/favicon.ico')
    }
  ]
});

// --- Hero Carousel ---
const heroSlides = ref([
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80',
    alt: 'Large event crowd with stage lighting',
    heading: 'Book Event Tickets Instantly',
    subheading: 'Secure your spot at the biggest events. QR-coded tickets delivered straight to your email in seconds.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1600&q=80',
    alt: 'Conference and gala dinner setting',
    heading: 'Dinners, Galas & Award Nights',
    subheading: 'From black-tie galas to departmental dinners — buy verified tickets with just a few clicks.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
    alt: 'Tech conference with audience',
    heading: 'Conferences & Seminars',
    subheading: 'Register for professional events, workshops, and conferences hosted by your organization.',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1600&q=80',
    alt: 'Concert with lights and crowd',
    heading: 'Concerts & Live Shows',
    subheading: 'Never miss a performance. Get your tickets now with 100% secure Paystack payments.',
  },
]);

const currentSlide = ref(0);
let slideInterval = null;

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length;
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + heroSlides.value.length) % heroSlides.value.length;
}

function goToSlide(i) {
  currentSlide.value = i;
  resetAutoSlide();
}

function resetAutoSlide() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
}

onMounted(() => {
  resetAutoSlide();
});

onBeforeUnmount(() => {
  if (slideInterval) clearInterval(slideInterval);
});

const filteredEvents = computed(() => {
  if (!searchQuery.value) return events.value;
  return events.value.filter(e =>
    e.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMinPrice(tiers) {
  if (!tiers || tiers.length === 0) return 'Free';
  const prices = tiers.map(t => t.price);
  const min = Math.min(...prices);
  return min === 0 ? 'Free' : `₦${min.toLocaleString()}`;
}
</script>

<style scoped>
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 0.8s ease;
}
.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}
</style>
