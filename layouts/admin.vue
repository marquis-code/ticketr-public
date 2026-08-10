<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="glass-card border-b border-gray-200/80 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-6">
            <NuxtLink to="/admin/dashboard" class="flex items-center space-x-3" @click="isMenuOpen = false">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center font-bold text-lg text-white">
                <Ticket class="w-5 h-5 text-white" />
              </div>
              <span class="font-bold text-lg text-gray-900 hidden sm:block">Ticketr Admin</span>
            </NuxtLink>

            <!-- Desktop Nav -->
            <nav class="hidden md:flex items-center gap-2">
              <NuxtLink to="/admin/dashboard" class="nav-link" active-class="nav-link-active">Dashboard</NuxtLink>
              <NuxtLink to="/admin/events" class="nav-link" active-class="nav-link-active">Events</NuxtLink>
              <NuxtLink to="/admin/orders" class="nav-link" active-class="nav-link-active">Orders & Financials</NuxtLink>
              <NuxtLink to="/admin/scanner" class="nav-link" active-class="nav-link-active">Gate Scanner</NuxtLink>
              <NuxtLink to="/admin/settings" class="nav-link" active-class="nav-link-active">Branding & Payouts</NuxtLink>
            </nav>
          </div>
          
          <div class="flex items-center gap-4">
            <NuxtLink to="/admin/events/create" class="btn-primary text-xs !py-2 !px-3.5 hidden sm:inline-flex">
              + Create Event
            </NuxtLink>
            
            <!-- Mobile Menu Button -->
            <button @click="isMenuOpen = !isMenuOpen" class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
              <Menu v-if="!isMenuOpen" class="w-6 h-6" />
              <X v-else class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile Menu Dropdown -->
      <div v-if="isMenuOpen" class="md:hidden border-t border-gray-100 bg-white shadow-lg absolute w-full pb-4">
        <nav class="flex flex-col px-4 pt-2 space-y-1">
          <NuxtLink to="/admin/dashboard" class="mobile-nav-link" active-class="mobile-nav-link-active" @click="isMenuOpen = false">Dashboard</NuxtLink>
          <NuxtLink to="/admin/events" class="mobile-nav-link" active-class="mobile-nav-link-active" @click="isMenuOpen = false">Events</NuxtLink>
          <NuxtLink to="/admin/orders" class="mobile-nav-link" active-class="mobile-nav-link-active" @click="isMenuOpen = false">Orders & Financials</NuxtLink>
          <NuxtLink to="/admin/scanner" class="mobile-nav-link" active-class="mobile-nav-link-active" @click="isMenuOpen = false">Gate Scanner</NuxtLink>
          <NuxtLink to="/admin/settings" class="mobile-nav-link" active-class="mobile-nav-link-active" @click="isMenuOpen = false">Branding & Payouts</NuxtLink>
          <div class="pt-2">
            <NuxtLink to="/admin/events/create" class="btn-primary text-xs w-full justify-center !py-2.5" @click="isMenuOpen = false">
              + Create Event
            </NuxtLink>
          </div>
        </nav>
      </div>
    </header>

    <main class="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Menu, X, Ticket } from 'lucide-vue-next';

const isMenuOpen = ref(false);
</script>

<style scoped>
.nav-link {
  @apply text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 px-3 py-2 rounded-lg text-xs font-semibold transition-colors;
}
.nav-link-active {
  @apply bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary;
}
.mobile-nav-link {
  @apply block px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors;
}
.mobile-nav-link-active {
  @apply bg-primary/10 text-primary;
}
</style>
