<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 font-sans px-4">
    <div class="w-full max-w-md bg-white px-6 py-8 sm:p-8 rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
      <div class="text-center mb-8">
        <h1 class="font-display text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p class="text-sm text-gray-500">Enter your new password below.</p>
      </div>

      <form v-if="!successMsg" @submit.prevent="handleSubmit" class="space-y-5">
        <div class="space-y-4">
          <div class="relative group">
            <label class="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
            <div class="relative shadow-sm rounded-xl">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all pr-12"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-primary focus:outline-none transition-colors"
              >
                <Eye v-if="!showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div class="relative group">
            <label class="block text-sm font-bold text-gray-700 mb-1.5">Confirm Password</label>
            <div class="relative shadow-sm rounded-xl">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all pr-12"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-primary focus:outline-none transition-colors"
              >
                <Eye v-if="!showConfirmPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="errorMsg" class="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
          <p class="text-red-700 text-sm font-medium">{{ errorMsg }}</p>
        </div>

        <button 
          type="submit" 
          :disabled="submitting" 
          class="w-full btn-primary py-4 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all mt-4"
        >
          <AppLoader v-if="submitting" size="sm" color="white" />
          <span v-else>Reset Password</span>
        </button>
      </form>

      <div v-else class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <p class="text-gray-900 font-medium">{{ successMsg }}</p>
        <NuxtLink to="/admin/login" class="inline-block mt-6 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
          Proceed to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { Eye, EyeOff } from 'lucide-vue-next';

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const route = useRoute();

const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const submitting = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

async function handleSubmit() {
  const token = route.query.token;
  if (!token) {
    errorMsg.value = 'Invalid or missing reset token. Please request a new link.';
    return;
  }
  
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match';
    return;
  }

  submitting.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const endpoint = `${config.public.apiBase}/auth/reset-password`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: password.value }),
    });

    if (res.ok) {
      const data = await res.json();
      successMsg.value = data.message || 'Password has been reset successfully';
    } else {
      const err = await res.json();
      errorMsg.value = err.message || 'Failed to reset password';
    }
  } catch (err) {
    errorMsg.value = 'Network connection error';
  } finally {
    submitting.value = false;
  }
}
</script>
