<template>
  <div class="min-h-screen bg-paper flex items-center justify-center px-5 py-12">
    <div class="w-full max-w-md">
      <NuxtLink to="/" class="flex items-center gap-2.5 justify-center mb-8">
        <span class="w-9 h-9 rounded-xl bg-ink flex items-center justify-center">
          <Ticket class="w-[18px] h-[18px] text-lime" />
        </span>
        <span class="font-display text-[22px] font-semibold tracking-[-0.04em] text-ink">ticketr.</span>
      </NuxtLink>

      <div class="surface p-6 sm:p-8">
        <span class="w-11 h-11 rounded-2xl bg-paper border border-line flex items-center justify-center">
          <KeyRound class="w-5 h-5 text-forest" />
        </span>
        <h1 class="font-display text-2xl font-semibold text-ink mt-4">Reset your password</h1>
        <p class="text-sm text-muted mt-1.5">
          Enter the email on your organizer account. We’ll send a secure link that expires in one hour.
        </p>

        <form class="mt-6 space-y-3.5" @submit.prevent="submit">
          <div>
            <label class="label" for="email">Email</label>
            <input id="email" v-model.trim="email" type="email" autocomplete="email" required class="input !py-3" placeholder="you@organization.com" />
          </div>
          <p v-if="error" class="field-error">{{ error }}</p>
          <p v-if="message" class="text-[12.5px] font-medium text-forest bg-forest/5 border border-forest/15 rounded-lg px-3.5 py-2.5">{{ message }}</p>
          <button type="submit" class="btn-primary w-full !py-3.5" :disabled="loading">
            {{ loading ? 'Sending…' : 'Send reset link' }}
          </button>
        </form>

        <NuxtLink to="/admin/login" class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-forest mt-5 hover:underline">
          <ArrowLeft class="w-3.5 h-3.5" /> Back to sign in
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, KeyRound, Ticket } from 'lucide-vue-next';

definePageMeta({ layout: false });

const email = ref('');
const loading = ref(false);
const error = ref('');
const message = ref('');

async function submit() {
  error.value = '';
  message.value = '';
  loading.value = true;
  try {
    const data = await apiRequest<any>('/auth/forgot-password', {
      method: 'POST',
      auth: false,
      body: { email: email.value },
    });
    message.value = data?.message || 'If that email exists, a reset link is on its way.';
  } catch (err) {
    error.value = errorMessage(err);
  } finally {
    loading.value = false;
  }
}

useSeoMeta({ title: 'Forgot password | Ticketr', robots: 'noindex, nofollow' });
</script>
