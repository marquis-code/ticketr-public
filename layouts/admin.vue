<template>
  <div class="min-h-screen flex bg-[#f8fafc]">
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"></div>

    <!-- Sidebar -->
    <aside :class="['fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out', isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0', isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64']">
      <div class="h-16 px-4 border-b border-gray-200 flex items-center justify-between shrink-0 overflow-hidden">
        <NuxtLink to="/admin/dashboard" class="flex items-center gap-2">
          <img src="/logo.png" alt="Ticketr" class="h-7 w-auto shrink-0" :class="{'mx-auto': isSidebarCollapsed}" />
        </NuxtLink>
        <button @click="isSidebarOpen = false" class="lg:hidden text-gray-500 hover:text-gray-700 shrink-0">
          <X class="w-6 h-6" />
        </button>
      </div>

      <nav class="flex-1 py-6 px-3 space-y-1.5 overflow-hidden">
        <NuxtLink to="/admin/dashboard" class="nav-link flex items-center gap-3" :class="{ 'nav-link-active': route.path === '/admin/dashboard' }">
          <LayoutDashboard class="w-5 h-5 shrink-0" />
          <span :class="{'hidden lg:hidden': isSidebarCollapsed, 'block': !isSidebarCollapsed}" class="whitespace-nowrap">Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/admin/events" class="nav-link flex items-center gap-3" :class="{ 'nav-link-active': route.path.startsWith('/admin/events') }">
          <CalendarDays class="w-5 h-5 shrink-0" />
          <span :class="{'hidden lg:hidden': isSidebarCollapsed, 'block': !isSidebarCollapsed}" class="whitespace-nowrap">Events Management</span>
        </NuxtLink>
        <NuxtLink to="/admin/attendees" class="nav-link flex items-center gap-3" :class="{ 'nav-link-active': route.path === '/admin/attendees' }">
          <Users class="w-5 h-5 shrink-0" />
          <span :class="{'hidden lg:hidden': isSidebarCollapsed, 'block': !isSidebarCollapsed}" class="whitespace-nowrap">Attendees</span>
        </NuxtLink>
        <NuxtLink to="/admin/orders" class="nav-link flex items-center gap-3" :class="{ 'nav-link-active': route.path.includes('/orders') }">
          <CreditCard class="w-5 h-5 shrink-0" />
          <span :class="{'hidden lg:hidden': isSidebarCollapsed, 'block': !isSidebarCollapsed}" class="whitespace-nowrap">Orders & Financials</span>
        </NuxtLink>
        <NuxtLink to="/admin/internal-tickets" class="nav-link flex items-center gap-3" :class="{ 'nav-link-active': route.path.includes('/internal-tickets') }">
          <CreditCard class="w-5 h-5 shrink-0" />
          <span :class="{'hidden lg:hidden': isSidebarCollapsed, 'block': !isSidebarCollapsed}" class="whitespace-nowrap">Internal Tickets</span>
        </NuxtLink>
        <NuxtLink to="/admin/scanner" class="nav-link flex items-center gap-3" :class="{ 'nav-link-active': route.path.includes('/scanner') }">
          <Scan class="w-5 h-5 shrink-0" />
          <span :class="{'hidden lg:hidden': isSidebarCollapsed, 'block': !isSidebarCollapsed}" class="whitespace-nowrap">Gate Scanner</span>
        </NuxtLink>
        <NuxtLink to="/admin/communications" class="nav-link flex items-center gap-3" :class="{ 'nav-link-active': route.path.includes('/communications') }">
          <Megaphone class="w-5 h-5 shrink-0" />
          <span :class="{'hidden lg:hidden': isSidebarCollapsed, 'block': !isSidebarCollapsed}" class="whitespace-nowrap">Communications</span>
        </NuxtLink>
        <NuxtLink to="/admin/settings" class="nav-link flex items-center gap-3" :class="{ 'nav-link-active': route.path.includes('/settings') }">
          <Palette class="w-5 h-5 shrink-0" />
          <span :class="{'hidden lg:hidden': isSidebarCollapsed, 'block': !isSidebarCollapsed}" class="whitespace-nowrap">Branding & Payouts</span>
        </NuxtLink>
        <NuxtLink to="/admin/audit-logs" class="nav-link flex items-center gap-3" :class="{ 'nav-link-active': route.path.includes('/audit-logs') }">
          <ShieldCheck class="w-5 h-5 shrink-0" />
          <span :class="{'hidden lg:hidden': isSidebarCollapsed, 'block': !isSidebarCollapsed}" class="whitespace-nowrap">Audit Logs</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-200 bg-gray-50/50 flex flex-col gap-2">
        <button @click="isSidebarCollapsed = !isSidebarCollapsed" class="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors" title="Toggle Sidebar">
          <PanelLeftClose v-if="!isSidebarCollapsed" class="w-4 h-4 shrink-0" />
          <PanelLeftOpen v-else class="w-4 h-4 shrink-0" />
          <span v-if="!isSidebarCollapsed">Collapse</span>
        </button>

        <button @click="showLogoutModal = true" class="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors bg-white" title="Logout">
          <LogOut class="w-4 h-4 shrink-0" />
          <span :class="{'hidden lg:hidden': isSidebarCollapsed, 'block': !isSidebarCollapsed}">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
      <!-- Standard Top Header -->
      <header class="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div class="flex items-center gap-4">
          <button @click="isSidebarOpen = true" class="lg:hidden text-gray-600 hover:text-gray-900 p-1 -ml-1">
            <Menu class="w-6 h-6" />
          </button>
          
          <div class="hidden lg:flex items-center text-sm text-gray-500 font-medium">
            <span class="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold mr-2 uppercase tracking-wide">Organizer</span>
            {{ routeName }}
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="hidden sm:block text-right">
              <div class="text-sm font-bold text-gray-900">{{ user?.name || 'Administrator' }}</div>
              <div class="text-[11px] text-gray-500 font-medium">{{ user?.email }}</div>
            </div>
            <div class="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700">
              {{ (user?.name || 'A').charAt(0).toUpperCase() }}
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto w-full relative">
        <slot />
      </main>
    </div>

    <!-- Logout Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div class="bg-white border border-gray-200 w-full max-w-sm p-6 rounded-2xl relative shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
        <p class="text-sm text-gray-500 mb-6">Are you sure you want to sign out of your account?</p>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button @click="showLogoutModal = false" class="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl sm:rounded-lg hover:bg-gray-200 transition">Cancel</button>
          <button @click="confirmLogout" class="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-semibold text-white bg-red-600 rounded-xl sm:rounded-lg hover:bg-red-700 transition">Yes, Logout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { LayoutDashboard, CalendarDays, CreditCard, Scan, Megaphone, Palette, ShieldCheck, PanelLeftClose, PanelLeftOpen, X, LogOut, Menu, Users } from 'lucide-vue-next';

const isSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);
const showLogoutModal = ref(false);
const user = ref(null);
const router = useRouter();
const route = useRoute();

const routeName = computed(() => {
  const path = route.path;
  if (path === '/admin/dashboard') return 'Dashboard';
  if (path.includes('/events')) return 'Events Management';
  if (path.includes('/attendees')) return 'Attendees Management';
  if (path.includes('/orders')) return 'Orders & Financials';
  if (path.includes('/internal-tickets')) return 'Internal & Special Tickets';
  if (path.includes('/scanner')) return 'Gate Scanner';
  if (path.includes('/communications')) return 'Communications';
  if (path.includes('/settings')) return 'Branding & Settings';
  if (path.includes('/audit-logs')) return 'Audit Logs';
  return '';
});

onMounted(() => {
  if (import.meta.client) {
    user.value = JSON.parse(localStorage.getItem('ticketr_admin_user') || '{}');
  }
});

// Close sidebar on route change on mobile
watch(() => route.path, () => {
  isSidebarOpen.value = false;
});

function confirmLogout() {
  if (import.meta.client) {
    localStorage.removeItem('ticketr_admin_token');
    localStorage.removeItem('ticketr_admin_user');
  }
  router.push('/admin/login');
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all overflow-hidden;
}
.nav-link-active {
  @apply bg-indigo-50 text-indigo-700;
}
</style>
