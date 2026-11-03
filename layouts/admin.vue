<template>
  <div class="min-h-screen bg-paper flex">
    <!-- Mobile backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="mobileOpen" class="fixed inset-0 bg-ink/50 z-40 lg:hidden" @click="mobileOpen = false" />
    </Transition>

    <!-- ================= SIDEBAR ================= -->
    <aside
      class="fixed lg:sticky top-0 left-0 z-50 h-screen bg-ink text-paper flex flex-col transition-[width,transform] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] shrink-0"
      :class="[
        collapsed ? 'lg:w-[76px] w-[260px]' : 'w-[260px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="h-[68px] flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <NuxtLink to="/admin/dashboard" class="flex items-center gap-2.5 min-w-0">
          <span class="w-9 h-9 rounded-xl bg-lime flex items-center justify-center shrink-0">
            <Ticket class="w-[18px] h-[18px] text-ink" />
          </span>
          <span v-if="!collapsed" class="font-display text-[20px] font-semibold tracking-[-0.04em] text-paper leading-none">
            ticketr<span class="text-lime">.</span>
          </span>
        </NuxtLink>
        <button class="lg:hidden p-1.5 rounded-lg text-paper/60 hover:text-paper hover:bg-white/10" aria-label="Close menu" @click="mobileOpen = false">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Tenant chip -->
      <div v-if="!collapsed" class="mx-3 mt-3 rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 flex items-center gap-2.5">
        <img v-if="tenant?.logoUrl" :src="tenant.logoUrl" alt="" class="w-7 h-7 rounded-lg object-cover border border-white/15" />
        <span v-else class="w-7 h-7 rounded-lg bg-lime/20 text-lime flex items-center justify-center text-[10px] font-bold">
          {{ initials(tenant?.name || user?.name) }}
        </span>
        <div class="min-w-0">
          <p class="text-[11.5px] font-semibold text-paper truncate">{{ tenant?.name || 'Your organization' }}</p>
          <p class="text-[9px] uppercase tracking-[0.12em] text-paper/40 font-bold">{{ roleLabel }}</p>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto no-scrollbar py-2">
        <template v-for="group in navGroups" :key="group.label">
          <p v-if="!collapsed" class="console-label">{{ group.label }}</p>
          <div v-else class="mx-3 my-2 h-px bg-white/10" />
          <div class="px-2 space-y-0.5">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="console-link"
              :class="{ 'console-link-active': isActive(item) }"
              :title="collapsed ? item.label : undefined"
              @click="mobileOpen = false"
            >
              <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
              <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
              <span
                v-if="!collapsed && item.badge"
                class="ml-auto rounded-full bg-lime text-ink text-[10px] font-bold px-1.5 py-0.5 leading-none"
              >
                {{ item.badge }}
              </span>
            </NuxtLink>
          </div>
        </template>
      </nav>

      <div class="p-2 border-t border-white/10 space-y-1 shrink-0">
        <NuxtLink
          :to="storefrontUrl"
          target="_blank"
          class="console-link"
          :title="collapsed ? 'View storefront' : undefined"
        >
          <ExternalLink class="w-[18px] h-[18px] shrink-0" />
          <span v-if="!collapsed">View storefront</span>
        </NuxtLink>
        <button
          type="button"
          class="console-link w-full"
          :title="collapsed ? 'Expand sidebar' : undefined"
          @click="toggleCollapsed"
        >
          <PanelLeftOpen v-if="collapsed" class="w-[18px] h-[18px] shrink-0" />
          <PanelLeftClose v-else class="w-[18px] h-[18px] shrink-0" />
          <span v-if="!collapsed">Collapse</span>
        </button>
      </div>
    </aside>

    <!-- ================= MAIN ================= -->
    <div class="flex-1 min-w-0 flex flex-col">
      <header class="sticky top-0 z-30 h-[68px] bg-paper/90 backdrop-blur-md border-b border-line shrink-0">
        <div class="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <button class="lg:hidden p-2 -ml-1 rounded-lg text-ink hover:bg-white border border-line" aria-label="Open menu" @click="mobileOpen = true">
              <Menu class="w-5 h-5" />
            </button>
            <div class="min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-muted truncate">{{ sectionLabel }}</p>
              <h1 class="font-display text-[17px] sm:text-lg font-semibold text-ink leading-tight truncate">{{ pageTitle }}</h1>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <NuxtLink to="/admin/events/create" class="btn-primary btn-sm hidden sm:inline-flex">
              <Plus class="w-4 h-4" /> New event
            </NuxtLink>
            <NuxtLink to="/admin/scanner" class="btn-secondary btn-sm" title="Gate scanner">
              <ScanLine class="w-4 h-4" />
              <span class="hidden sm:inline">Scan</span>
            </NuxtLink>

            <div class="relative" ref="menuRef">
              <button
                type="button"
                class="flex items-center gap-2 rounded-full border border-line bg-white pl-1 pr-2.5 py-1 hover:border-ink/25 transition"
                :aria-expanded="userMenu"
                @click="userMenu = !userMenu"
              >
                <span class="w-7 h-7 rounded-full bg-ink text-lime flex items-center justify-center text-[11px] font-bold">
                  {{ initials(user?.name) }}
                </span>
                <ChevronDown class="w-3.5 h-3.5 text-muted" />
              </button>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-to-class="opacity-0"
              >
                <div v-if="userMenu" class="absolute right-0 mt-2 w-60 rounded-xl border border-line bg-white shadow-pop overflow-hidden">
                  <div class="px-4 py-3 border-b border-line">
                    <p class="text-sm font-semibold text-ink truncate">{{ user?.name }}</p>
                    <p class="text-[11px] text-muted truncate">{{ user?.email }}</p>
                  </div>
                  <div class="p-1.5">
                    <NuxtLink to="/admin/settings" class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink hover:bg-paper" @click="userMenu = false">
                      <Settings class="w-4 h-4 text-muted" /> Organization settings
                    </NuxtLink>
                    <NuxtLink to="/admin/settings?tab=team" class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-ink hover:bg-paper" @click="userMenu = false">
                      <Users class="w-4 h-4 text-muted" /> Team & access
                    </NuxtLink>
                    <button type="button" class="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-coral hover:bg-coral/5" @click="confirmLogout = true; userMenu = false">
                      <LogOut class="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-16">
        <div class="mx-auto w-full max-w-[1280px]">
          <slot />
        </div>
      </main>
    </div>

    <!-- Logout -->
    <UiModal :open="confirmLogout" title="Sign out of the console?" description="Your session ends on this device. Tickets and events stay live." eyebrow="Confirm" size="sm" @close="confirmLogout = false">
      <p class="text-sm text-muted">You will need your email and password to sign back in.</p>
      <template #footer>
        <button class="btn-danger" type="button" @click="logout">Sign out</button>
        <button class="btn-secondary" type="button" @click="confirmLogout = false">Stay signed in</button>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import {
  Banknote,
  CalendarDays,
  ChevronDown,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ScanLine,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  X,
} from 'lucide-vue-next';

const route = useRoute();
const config = useRuntimeConfig();
const { state, hydrate, logout } = useAuth();

const mobileOpen = ref(false);
const userMenu = ref(false);
const confirmLogout = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const collapsed = ref(false);

const user = computed(() => state.user);
const tenant = useState<any>('console-tenant', () => null);

const roleLabel = computed(() => {
  switch (state.user?.role) {
    case 'SUPER_ADMIN': return 'Super admin';
    case 'STAFF': return 'Gate staff';
    default: return 'Organizer';
  }
});

const titles: Record<string, { title: string; section: string }> = {
  '/admin/dashboard': { title: 'Overview', section: 'Command center' },
  '/admin/events': { title: 'Events', section: 'Sell' },
  '/admin/events/create': { title: 'Create event', section: 'Sell' },
  '/admin/orders': { title: 'Orders & payouts', section: 'Money' },
  '/admin/payouts': { title: 'Settlements', section: 'Money' },
  '/admin/attendees': { title: 'Attendees', section: 'Operate' },
  '/admin/scanner': { title: 'Gate scanner', section: 'Operate' },
  '/admin/internal-tickets': { title: 'Complimentary tickets', section: 'Operate' },
  '/admin/communications': { title: 'Communications', section: 'Grow' },
  '/admin/settings': { title: 'Settings', section: 'Account' },
  '/admin/audit-logs': { title: 'Audit trail', section: 'Account' },
};

const pageTitle = computed(() => {
  if (route.path.includes('/events/') && route.path.endsWith('/edit')) return 'Edit event';
  if (route.path.includes('/events/') && route.path.endsWith('/attendees')) return 'Attendees';
  return titles[route.path]?.title || 'Console';
});
const sectionLabel = computed(() => {
  if (route.path.includes('/events/')) return 'Sell';
  return titles[route.path]?.section || 'Organizer';
});

const storefrontUrl = computed(() => {
  const slug = tenant.value?.slug;
  const base = String(config.public.publicUrl || '').replace(/\/+$/, '');
  if (base) return slug ? `${base}?tenant=${slug}` : base;
  return '/';
});

const navGroups = computed(() => [
  {
    label: 'Command center',
    items: [{ to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard }],
  },
  {
    label: 'Sell',
    items: [
      { to: '/admin/events', label: 'Events', icon: CalendarDays },
      { to: '/admin/orders', label: 'Orders & payouts', icon: CreditCard, badge: pendingBadge.value || undefined },
      { to: '/admin/payouts', label: 'Settlements', icon: Banknote },
    ],
  },
  {
    label: 'Operate',
    items: [
      { to: '/admin/scanner', label: 'Gate scanner', icon: ScanLine },
      { to: '/admin/attendees', label: 'Attendees', icon: Users },
      { to: '/admin/internal-tickets', label: 'Complimentary', icon: Ticket },
    ],
  },
  {
    label: 'Grow',
    items: [{ to: '/admin/communications', label: 'Communications', icon: Megaphone }],
  },
  {
    label: 'Account',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: Settings },
      { to: '/admin/audit-logs', label: 'Audit trail', icon: ShieldCheck },
    ],
  },
]);

const pendingBadge = useState<number>('pending-approvals', () => 0);

function isActive(item: { to: string }) {
  if (item.to === '/admin/events') return route.path.startsWith('/admin/events');
  if (item.to === '/admin/settings') return route.path.startsWith('/admin/settings');
  return route.path === item.to;
}

function toggleCollapsed() {
  collapsed.value = !collapsed.value;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('ticketr_sidebar_collapsed', collapsed.value ? '1' : '0');
  }
}

function onOutsideClick(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) userMenu.value = false;
}

async function loadTenant() {
  try {
    const profile = await apiRequest<any>('/auth/me');
    tenant.value = profile?.tenant || null;
  } catch {
    /* layout still works without the tenant chip */
  }
}

watch(() => route.path, () => {
  mobileOpen.value = false;
  userMenu.value = false;
});

onMounted(() => {
  hydrate();
  const saved = localStorage.getItem('ticketr_sidebar_collapsed');
  collapsed.value = saved === '1';
  document.addEventListener('click', onOutsideClick);
  loadTenant();
});

onBeforeUnmount(() => document.removeEventListener('click', onOutsideClick));

useHead({
  titleTemplate: (title) => (title ? `${title} · Ticketr Console` : 'Ticketr Console'),
});
</script>
