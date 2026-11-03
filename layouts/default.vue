<template>
  <div class="min-h-screen flex flex-col bg-paper">
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:rounded-lg">
      Skip to content
    </a>

    <!-- Trust ticker -->
    <div class="bg-ink text-paper/85 text-[11px] font-semibold tracking-[0.08em] uppercase overflow-hidden">
      <div class="shell-wide flex items-center justify-between gap-4 h-9">
        <p class="flex items-center gap-2 truncate">
          <ShieldCheck class="w-3.5 h-3.5 text-lime shrink-0" />
          <span class="truncate">Every pass is single-use and verified at the gate</span>
        </p>
        <NuxtLink :to="adminUrl" class="hidden sm:inline-flex items-center gap-1.5 hover:text-lime transition shrink-0">
          Organizer console <ArrowUpRight class="w-3 h-3" />
        </NuxtLink>
      </div>
    </div>

    <header class="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <div class="shell-wide h-[68px] flex items-center justify-between gap-4">
        <NuxtLink to="/" class="flex items-center gap-2.5 shrink-0" aria-label="Ticketr home">
          <span class="w-9 h-9 rounded-xl bg-ink flex items-center justify-center">
            <Ticket class="w-[18px] h-[18px] text-lime" />
          </span>
          <span class="font-display text-[22px] font-semibold tracking-[-0.04em] text-ink leading-none">
            ticketr<span class="text-forest">.</span>
          </span>
        </NuxtLink>

        <nav class="hidden lg:flex items-center gap-1" aria-label="Primary">
          <NuxtLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            class="px-3.5 py-2 rounded-full text-[13.5px] font-semibold text-ink/70 hover:text-ink hover:bg-ink/[0.05] transition"
            active-class="!text-ink !bg-ink/[0.06]"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <form class="hidden md:flex items-center relative" role="search" @submit.prevent="submitSearch">
            <Search class="w-4 h-4 text-muted absolute left-3.5 pointer-events-none" />
            <input
              v-model="search"
              type="search"
              placeholder="Search events"
              aria-label="Search events"
              class="w-44 xl:w-56 rounded-full border border-line bg-white/70 pl-10 pr-4 py-2 text-[13px] text-ink placeholder:text-muted/60 focus:bg-white focus:border-forest focus:ring-4 focus:ring-forest/10 outline-none transition-all"
            />
          </form>

          <NuxtLink to="/my-tickets" class="btn-secondary btn-sm hidden sm:inline-flex">
            <TicketCheck class="w-4 h-4" />
            My tickets
          </NuxtLink>

          <NuxtLink :to="adminUrl" class="btn-primary btn-sm hidden sm:inline-flex">
            Host an event
            <ArrowUpRight class="w-4 h-4" />
          </NuxtLink>

          <button
            type="button"
            class="lg:hidden p-2 rounded-full border border-line bg-white text-ink"
            :aria-expanded="menuOpen"
            aria-label="Open menu"
            @click="menuOpen = !menuOpen"
          >
            <X v-if="menuOpen" class="w-5 h-5" />
            <Menu v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="menuOpen" class="lg:hidden border-t border-line bg-paper px-5 pb-5 pt-3">
          <form class="relative mb-3" role="search" @submit.prevent="submitSearch">
            <Search class="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="search"
              type="search"
              placeholder="Search events"
              class="input !pl-10 !py-2.5"
            />
          </form>
          <NuxtLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            class="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-ink hover:bg-white transition"
            @click="menuOpen = false"
          >
            {{ item.label }}
            <ArrowUpRight class="w-4 h-4 text-muted" />
          </NuxtLink>
          <div class="grid grid-cols-2 gap-2 mt-3">
            <NuxtLink to="/my-tickets" class="btn-secondary btn-sm" @click="menuOpen = false">My tickets</NuxtLink>
            <NuxtLink :to="adminUrl" class="btn-primary btn-sm" @click="menuOpen = false">Host an event</NuxtLink>
          </div>
        </div>
      </Transition>
    </header>

    <main id="main" class="flex-1 w-full">
      <slot />
    </main>

    <footer class="mt-auto border-t border-line bg-white">
      <div class="shell-wide py-12 sm:py-16">
        <div class="grid grid-cols-2 lg:grid-cols-12 gap-10">
          <div class="col-span-2 lg:col-span-5">
            <NuxtLink to="/" class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-ink flex items-center justify-center">
                <Ticket class="w-[18px] h-[18px] text-lime" />
              </span>
              <span class="font-display text-[22px] font-semibold tracking-[-0.04em] text-ink">ticketr.</span>
            </NuxtLink>
            <p class="mt-4 text-sm text-muted max-w-xs leading-relaxed">
              The trust layer for live events. Verifiable tickets, honest pricing and face-value resale — for organizers and the people who show up.
            </p>
            <div class="flex flex-wrap gap-2 mt-5">
              <span class="chip !text-[10px]"><ShieldCheck class="w-3 h-3 text-forest" /> Single-use QR</span>
              <span class="chip !text-[10px]"><RefreshCcw class="w-3 h-3 text-forest" /> Verified resale</span>
              <span class="chip !text-[10px]"><Wallet class="w-3 h-3 text-forest" /> Private wallet</span>
            </div>
          </div>

          <div class="lg:col-span-2">
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-muted mb-4">Discover</p>
            <ul class="space-y-2.5 text-sm text-ink/75">
              <li><NuxtLink to="/" class="hover:text-forest transition">All events</NuxtLink></li>
              <li><NuxtLink to="/my-tickets" class="hover:text-forest transition">My tickets</NuxtLink></li>
              <li><NuxtLink to="/#how-it-works" class="hover:text-forest transition">How it works</NuxtLink></li>
            </ul>
          </div>

          <div class="lg:col-span-2">
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-muted mb-4">Organizers</p>
            <ul class="space-y-2.5 text-sm text-ink/75">
              <li><NuxtLink :to="adminUrl" class="hover:text-forest transition">Organizer console</NuxtLink></li>
              <li><NuxtLink :to="`${adminUrl}/signup`" class="hover:text-forest transition">Create an event</NuxtLink></li>
              <li><NuxtLink to="/#pricing" class="hover:text-forest transition">Pricing & fees</NuxtLink></li>
            </ul>
          </div>

          <div class="lg:col-span-3">
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-muted mb-4">Trust & support</p>
            <ul class="space-y-2.5 text-sm text-ink/75">
              <li><NuxtLink to="/#trust" class="hover:text-forest transition">How we prevent ticket fraud</NuxtLink></li>
              <li><NuxtLink to="/#trust" class="hover:text-forest transition">Transfer & resale policy</NuxtLink></li>
              <li><a href="mailto:support@ticketr.org" class="hover:text-forest transition">support@ticketr.org</a></li>
            </ul>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p class="text-xs text-muted">© {{ new Date().getFullYear() }} Ticketr. Built for trustworthy live events.</p>
          <div class="flex items-center gap-4 text-xs text-muted">
            <NuxtLink to="/legal/privacy" class="hover:text-ink transition">Privacy</NuxtLink>
            <NuxtLink to="/legal/terms" class="hover:text-ink transition">Terms</NuxtLink>
            <NuxtLink to="/legal/refunds" class="hover:text-ink transition">Refunds</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpRight, Menu, RefreshCcw, Search, ShieldCheck, Ticket, TicketCheck, Wallet, X } from 'lucide-vue-next';

const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();

const adminUrl = computed(() => appOrigin('admin'));
const menuOpen = ref(false);
const search = ref(typeof route.query.q === 'string' ? route.query.q : '');

const navItems = computed(() => [
  { label: 'Discover events', to: '/' },
  { label: 'My tickets', to: '/my-tickets' },
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'For organizers', to: `${adminUrl.value}/signup` },
]);

function submitSearch() {
  menuOpen.value = false;
  router.push({ path: '/', query: search.value.trim() ? { q: search.value.trim() } : {} });
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  },
);
</script>
