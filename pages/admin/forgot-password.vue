<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 font-sans px-4">
    <div class="w-full max-w-md bg-white px-6 py-8 sm:p-8 rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
      <div class="text-center mb-8">
        <h1 class="font-display text-2xl font-bold text-gray-900 mb-2">Forgot Password</h1>
        <p class="text-sm text-gray-500">Enter your email and we'll send you a reset link.</p>
      </div>

      <form v-if="!successMsg" @submit.prevent="handleSubmit" class="space-y-5">
        <div class="space-y-4">
          <div class="relative group">
            <label class="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
            <input
              v-model="email"
              type="email"
              placeholder="admin@organization.edu"
              required
              class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all shadow-sm"
            />
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
          <span v-else>Send Reset Link</span>
        </button>
        
        <NuxtLink to="/admin/login" class="block w-full text-center mt-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          Back to Login
        </NuxtLink>
      </form>

      <div v-else class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <p class="text-gray-900 font-medium">{{ successMsg }}</p>
        <NuxtLink to="/admin/login" class="inline-block mt-6 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
          Return to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

definePageMeta({ layout: false });

const config = useRuntimeConfig();

const email = ref('');
const submitting = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

async function handleSubmit() {
  submitting.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const endpoint = `${config.public.apiBase}/auth/forgot-password`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    });

    if (res.ok) {
      const data = await res.json();
      successMsg.value = data.message || 'If the email exists, a reset link has been sent.';
    } else {
      const err = await res.json();
      errorMsg.value = err.message || 'Failed to send reset link';
    }
  } catch (err) {
    errorMsg.value = 'Network connection error';
  } finally {
    submitting.value = false;
  }
}
</script>
