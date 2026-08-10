<template>
  <div class="min-h-screen flex w-full bg-white">
    <!-- Left Side: Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
      <div class="w-full max-w-md py-8">
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Ticket class="w-7 h-7 text-white" />
          </div>
          <h1 class="font-display text-3xl font-bold text-gray-900">Create your Portal</h1>
          <p class="text-sm text-gray-500 mt-2">Set up your organization to start selling tickets.</p>
        </div>

        <form @submit.prevent="handleSignup" class="space-y-4">
          <!-- User Details -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Jane Doe"
                required
                class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="jane@example.com"
                required
                class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <Eye v-if="!showPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <hr class="border-gray-100 my-6" />

          <!-- Organization Details -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Organization Name</label>
            <input
              v-model="form.organizationName"
              type="text"
              placeholder="e.g. Acme Events"
              required
              class="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Portal URL</label>
            <div class="flex items-center">
              <span class="bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg px-3 py-3 text-sm text-gray-500 font-medium select-none">
                ticketr.org/
              </span>
              <input
                v-model="form.tenantSlug"
                type="text"
                placeholder="acme-events"
                required
                @input="form.tenantSlug = form.tenantSlug.toLowerCase().replace(/[^a-z0-9-]/g, '')"
                class="w-full bg-gray-50 border border-gray-200 rounded-r-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition"
              />
            </div>
            <p class="text-[11px] text-gray-500 mt-1.5">This will be your public URL where users can find your events.</p>
          </div>

          <div v-if="errorMsg" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
            {{ errorMsg }}
          </div>

          <button type="submit" :disabled="submitting" class="w-full btn-primary py-3 mt-4 text-sm flex items-center justify-center gap-2">
            <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ submitting ? 'Creating account...' : 'Create Account' }}</span>
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-8">
          Already have an account? 
          <NuxtLink to="/admin/login" class="font-semibold text-primary hover:underline">Sign in</NuxtLink>
        </p>
      </div>
    </div>

    <!-- Right Side: Image -->
    <div class="hidden lg:flex flex-1 relative bg-gray-900 min-h-screen w-full">
      <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop" alt="Exciting live event" class="absolute inset-0 w-full h-full object-cover opacity-80" />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"></div>
      <div class="absolute bottom-12 left-12 right-12 text-white z-10">
        <h2 class="font-display text-4xl font-bold mb-4">Start selling in minutes.</h2>
        <p class="text-lg text-gray-200 max-w-lg">Join thousands of organizers powering their events with Ticketr.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Ticket, Eye, EyeOff } from 'lucide-vue-next';

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const submitting = ref(false);
const errorMsg = ref('');
const showPassword = ref(false);

const form = ref({
  name: '',
  email: '',
  password: '',
  organizationName: '',
  tenantSlug: '',
});

async function handleSignup() {
  submitting.value = true;
  errorMsg.value = '';

  try {
    const res = await fetch(`${config.public.apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form.value,
        role: 'ORGANIZER' // Critical: create as organizer
      }),
    });

    if (res.ok) {
      const data = await res.json();
      
      // Auto-login upon successful registration
      localStorage.setItem('ticketr_admin_token', data.accessToken);
      localStorage.setItem('ticketr_admin_user', JSON.stringify(data.user));
      localStorage.setItem('ticketr_admin_tenant', form.value.tenantSlug);
      
      useRouter().push('/admin/dashboard');
    } else {
      const err = await res.json();
      errorMsg.value = err.message || 'Failed to create account. Please try again.';
    }
  } catch (err) {
    errorMsg.value = 'Network connection error';
  } finally {
    submitting.value = false;
  }
}
</script>
