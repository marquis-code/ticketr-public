<template>
  <div class="min-h-screen flex items-center justify-center p-6 w-full bg-gray-50">
    <div class="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8 shadow-xl mx-auto my-auto">
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
          <Ticket class="w-7 h-7 text-white" />
        </div>
        <h1 class="font-display text-2xl font-bold text-gray-900">{{ tenantName || 'Organizer Portal' }}</h1>
        <p class="text-sm text-gray-500 mt-1">Event Management & Analytics</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="admin@organization.edu"
            required
            class="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              class="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition pr-10"
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

        <div v-if="errorMsg" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
          {{ errorMsg }}
        </div>

        <button type="submit" :disabled="submitting" class="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2">
          <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ submitting ? 'Signing in...' : 'Sign In' }}</span>
        </button>
      </form>

      <p class="text-center text-xs text-gray-400 mt-6">
        Powered by <span class="font-semibold text-primary">Ticketr</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue-sonner';
import { Ticket, Eye, EyeOff } from 'lucide-vue-next';

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const route = useRoute();
const { tenantSlug } = useSubdomain();

const tenantName = ref('');
const submitting = ref(false);
const errorMsg = ref('');
const showPassword = ref(false);
const form = ref({ email: '', password: '' });

// Fetch tenant info
onMounted(async () => {
  if (tenantSlug) {
    try {
      const res = await fetch(`${config.public.apiBase}/events/tenant/${tenantSlug}`);
      if (res.ok) {
        const data = await res.json();
        if (data.tenant) tenantName.value = data.tenant.name;
      }
    } catch {}
  }
});

async function handleLogin() {
  submitting.value = true;
  errorMsg.value = '';

  try {
    const res = await fetch(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    });

    if (res.ok) {
      const data = await res.json();
      // Verify the user belongs to this tenant
      if (data.user.role !== 'ORGANIZER') {
        errorMsg.value = 'Access denied. This portal is for organizers only.';
        return;
      }
      localStorage.setItem('ticketr_admin_token', data.accessToken);
      localStorage.setItem('ticketr_admin_user', JSON.stringify(data.user));
      localStorage.setItem('ticketr_admin_tenant', tenantSlug || '');
      useRouter().push('/admin/admin');
    } else {
      const err = await res.json();
      errorMsg.value = err.message || 'Invalid credentials';
    }
  } catch (err) {
    errorMsg.value = 'Network connection error';
  } finally {
    submitting.value = false;
  }
}
</script>
