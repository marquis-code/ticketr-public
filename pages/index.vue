<template>
  <div>
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
              <span class="text-white/90 text-xs font-medium tracking-wide">{{ tenantInfo?.name ? tenantInfo.name + ' Portal' : 'The #1 Choice for UNILAG, Yabatech & CMUL' }}</span>
            </div>

            <h1 class="font-display text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-white leading-tight mb-5">
              {{ heroSlides[currentSlide].heading }}
            </h1>

            <p class="text-white/70 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              {{ heroSlides[currentSlide].subheading }}
            </p>

            <div class="flex flex-wrap items-center gap-3">
              <a href="#events" class="inline-flex items-center gap-2 bg-primary hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-all text-sm">
                Browse Events
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <NuxtLink to="/my-tickets" class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-all text-sm">
                Find My Tickets
              </NuxtLink>
              <a v-if="!tenantInfo" :href="`${config.public.adminUrl}/register`" class="inline-flex items-center gap-2 bg-gray-900/40 backdrop-blur-sm hover:bg-gray-900/60 border border-gray-700/50 text-white font-semibold px-6 py-3 rounded-lg transition-all text-sm">
                Sign Up as Organizer
              </a>
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
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="text-sm font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">
          Trusted across campuses
        </div>
        <div class="flex flex-wrap items-center justify-center md:justify-end gap-6 md:gap-12 text-sm text-gray-700 font-display font-extrabold text-xl md:text-2xl opacity-60 grayscale">
          <span class="flex items-center gap-2">UNILAG <span class="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full uppercase">Akoka</span></span>
          <span>YABATECH</span>
          <span class="flex items-center gap-2">CMUL <span class="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full uppercase">Idi-Araba</span></span>
        </div>
      </div>
    </div>
    
    <!-- Stats Section -->
    <section class="bg-gray-900 text-white py-12 border-b border-gray-800" v-if="!tenantInfo">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-3xl md:text-5xl font-black text-emerald-400 mb-2">15k+</div>
            <div class="text-sm text-gray-400 font-medium uppercase tracking-wide">Tickets Sold</div>
          </div>
          <div>
            <div class="text-3xl md:text-5xl font-black text-emerald-400 mb-2">3</div>
            <div class="text-sm text-gray-400 font-medium uppercase tracking-wide">Major Campuses</div>
          </div>
          <div>
            <div class="text-3xl md:text-5xl font-black text-emerald-400 mb-2">120+</div>
            <div class="text-sm text-gray-400 font-medium uppercase tracking-wide">Events Hosted</div>
          </div>
          <div>
            <div class="text-3xl md:text-5xl font-black text-emerald-400 mb-2">100%</div>
            <div class="text-sm text-gray-400 font-medium uppercase tracking-wide">Secure Scans</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 md:py-24 bg-gray-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <div class="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles class="w-4 h-4" /> Designed to Solve Problems
          </div>
          <h2 class="font-display text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">Built to Help You Grow.</h2>
          <p class="text-lg text-gray-600">We understand the chaos of managing and attending events. Ticketr is a complete system built to take away the stress, make your events seen, and make campus life effortlessly easy.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          <div class="space-y-8">
            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Users class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Squad Buy & Easy Claims</h3>
                <p class="text-gray-600">Bring your people together. One person secures the group, and everyone claims their spot. Stop stressing about who paid who—our system manages it all.</p>
              </div>
            </div>
            
            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <CreditCard class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Buy Now, Pay Later</h3>
                <p class="text-gray-600">Every penny counts. Don't let cashflow keep you in your room—stop being an introvert! Break down premium tickets into easy payments and step out into the culture.</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Share2 class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Refer Friends, Earn Discounts</h3>
                <p class="text-gray-600">Share the vibe, earn the reward. When you invite your network, we give back. Making events accessible, affordable, and rewarding for everyone.</p>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-2xl rounded-full opacity-70"></div>
            <img src="/images/squad_buy.png" alt="Squad Having Fun" class="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div class="relative order-2 md:order-1">
            <div class="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 blur-2xl rounded-full opacity-70"></div>
            <img src="/images/digital_wallet.png" alt="Digital Wallet Ticket" class="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]" />
          </div>
          <div class="space-y-8 order-1 md:order-2">
            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Wallet class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Your Digital Ticket Wallet</h3>
                <p class="text-gray-600">Life is chaotic enough. Keep your upcoming passes and past memories organized in one secure place. Just pull up your QR code and walk in.</p>
              </div>
            </div>
            
            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Ticket class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Secure Ticket Transfers</h3>
                <p class="text-gray-600">Plans change, and that's okay. Safely pass your ticket to a friend without the fear of scams. We regenerate the code to keep the system clean and secure.</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <ImageIcon class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Relive the Memories</h3>
                <p class="text-gray-600">The impact lasts longer than the night. Access high-quality photo galleries directly from the event page to celebrate the moments that matter and fuel your next outing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

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
          :href="getEventLink(event)"
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

            <div class="mt-4 flex flex-col space-y-2 text-sm text-gray-500 font-medium px-5">
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4 text-primary" />
                <span>{{ new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) }} • {{ event.startTime }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Globe v-if="event.isVirtual" class="w-4 h-4 text-primary" />
                <MapPin v-else class="w-4 h-4 text-primary" />
                <span>{{ event.isVirtual ? 'Virtual' : event.location }}</span>
              </div>
            </div>

            <div v-if="event.tiers && event.tiers.length" class="absolute bottom-3 right-3 bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-white">
              From {{ getMinPrice(event.tiers) }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-5 flex flex-col flex-grow">
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
    
    <!-- Live Social Proof Toast -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="transform translate-y-10 opacity-0 sm:translate-y-0 sm:translate-x-10"
      enter-to-class="transform translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition duration-400 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 sm:translate-x-0"
      leave-to-class="transform translate-y-10 opacity-0 sm:translate-y-0 sm:translate-x-10"
    >
      <div v-if="activeToast" class="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[100] flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-2xl shadow-xl max-w-sm">
        <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
          <Ticket class="w-5 h-5" />
        </div>
        <div>
          <p class="text-sm text-gray-900 leading-snug">
            <span class="font-bold">{{ activeToast.name }}</span> from <span class="font-bold text-primary">{{ activeToast.campus }}</span> just bought
            <span class="font-semibold">{{ activeToast.qty }}x {{ activeToast.tier }}</span> tickets!
          </p>
          <p class="text-xs text-gray-400 mt-0.5">{{ activeToast.time }} ago</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });

import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Globe, MapPin, Calendar, Users, CreditCard, Wallet, Share2, Ticket, Image as ImageIcon, Sparkles } from 'lucide-vue-next';

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
  return null; // Return null for the main ticketr.org domain
};

const activeSlug = ref(resolveSubdomain());

const { data, pending: loading } = await useFetch(
  activeSlug.value ? `${config.public.apiBase}/events/tenant/${activeSlug.value}` : `${config.public.apiBase}/events/public/all`
);

const getEventLink = (event) => {
  if (activeSlug.value) {
    return `/event/${event.slug}?tenant=${activeSlug.value}`;
  }
  
  const tenantSlug = event.tenant?.slug || 'thebig5';
  const host = reqUrl.hostname;
  
  if (host === 'localhost' || host === '127.0.0.1') {
     return `/event/${event.slug}?tenant=${tenantSlug}`;
  }
  
  return `https://${tenantSlug}.ticketr.org/event/${event.slug}`;
};

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

const defaultSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80',
    alt: 'Large event crowd with stage lighting',
    heading: 'We Understand the Chaos of Events',
    subheading: 'Our system is built to take away the stress. From gate scanning to instant payouts, we make managing your event easy so you can focus on making an impact.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1600&q=80',
    alt: 'Conference and gala dinner setting',
    heading: 'Stop Being an Introvert',
    subheading: 'Every penny counts. With installment plans and referral rewards, stepping out to attend that big campus event has never been easier or more affordable.',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
    alt: 'Tech conference with audience',
    heading: 'Grow Your Campus Community',
    subheading: 'More than a ticketing platform. We help you build operational systems, recover lost sales, and make sure your events are seen by everyone.',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1600&q=80',
    alt: 'Concert with lights and crowd',
    heading: 'Your Campus Life, Managed',
    subheading: 'All your tickets, memories, and photos in one place. We manage the logistics behind the scenes so you can just show up, connect, and have fun.',
  },
];

const heroSlides = ref([...defaultSlides]);

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
  if (typeof window === 'undefined') return;
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
}

import { watchEffect } from 'vue';

watchEffect(() => {
  if (activeSlug.value && events.value && events.value.length > 0) {
    let newSlides = [];
    events.value.forEach(ev => {
      const subheading = ev.description ? (ev.description.length > 100 ? ev.description.substring(0, 100) + '...' : ev.description) : '';
      if (ev.carouselImages && ev.carouselImages.length > 0) {
         ev.carouselImages.forEach((img, idx) => {
            newSlides.push({
               id: `${ev._id}-carousel-${idx}`,
               image: img,
               alt: ev.title,
               heading: ev.title,
               subheading: subheading
            });
         });
      } else if (ev.bannerUrl) {
         newSlides.push({
            id: `${ev._id}-banner`,
            image: ev.bannerUrl,
            alt: ev.title,
            heading: ev.title,
            subheading: subheading
         });
      }
    });
    
    if (newSlides.length > 0) {
       heroSlides.value = newSlides;
    } else {
       heroSlides.value = [...defaultSlides];
    }
  } else {
    heroSlides.value = [...defaultSlides];
  }
  
  // reset slide index and timer
  currentSlide.value = 0;
  resetAutoSlide();
});

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

// Social Proof Logic
const activeToast = ref(null);
const campuses = ['UNILAG', 'YABATECH', 'College of Medicine (CMUL)', 'Medilag', 'Akoka'];
const names = ['David', 'Sarah', 'Tobi', 'Amaka', 'Femi', 'Nneka', 'Daniel', 'Zainab', 'Emmanuel', 'Chika'];
const tiers = ['VIP', 'Regular', 'VVIP', 'Early Bird', 'Table for 4'];

function showRandomToast() {
  if (typeof window === 'undefined') return;
  
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomCampus = campuses[Math.floor(Math.random() * campuses.length)];
  const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
  const randomQty = Math.floor(Math.random() * 4) + 1;
  const randomTime = Math.floor(Math.random() * 10) + 1 + ' mins';
  
  activeToast.value = {
    name: randomName,
    campus: randomCampus,
    tier: randomTier,
    qty: randomQty,
    time: randomTime
  };
  
  setTimeout(() => {
    activeToast.value = null;
  }, 5000); // Hide after 5 seconds
}

let toastInterval = null;

onMounted(() => {
  resetAutoSlide();
  
  // Show first toast after 3 seconds, then randomly every 12-25 seconds
  if (typeof window !== 'undefined' && !tenantInfo.value) {
    setTimeout(() => {
      showRandomToast();
      toastInterval = setInterval(() => {
        showRandomToast();
      }, Math.floor(Math.random() * 13000) + 12000);
    }, 3000);
  }
});

onBeforeUnmount(() => {
  if (slideInterval) clearInterval(slideInterval);
  if (toastInterval) clearInterval(toastInterval);
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
