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
          <Lock class="w-5 h-5 text-forest" />
        </span>
        <h1 class="font-display text-2xl font-semibold text-ink mt-4">Choose a new password</h1>
        <p class="text-sm text-muted mt-1.5">Use at least 8 characters with a letter and a number.</p>

        <p v-if="!token" class="mt-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-[12.5px] text-amber-900">
          This link is missing its token. Request a new reset link.
        </p>

        <form v-else class="mt-6 space-y-3.5" @submit.prevent="submit">
          <div>
            <label class="label" for="password">New password</label>
            <input id="password" v-model="password" type="password" autocomplete="new-password" class="input !py-3" />
          </div>
          <div>
            <label class="label" for="confirm">Confirm password</label>
            <input id="confirm" v-model="confirm" type="password" autocomplete="new-password" class="input !py-3" />
          </div>
          <p v-if="error" class="field-error">{{ error }}</p>
          <button type="submit" class="btn-primary w-full !py-3.5" :disabled="loading">
            {{ loading ? 'Updating…' : 'Update password' }}
          </button>
        </form>

        <NuxtLink to="/admin/forgot-password" class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-forest mt-5 hover:underline">
          <ArrowLeft class="w-3.5 h-3.5" /> Request a new link
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Lock, Ticket } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({ layout: false });

const route = useRoute();
const token = ref(typeof route.query.token === 'string' ? route.query.token : '');
const password = ref('');
const confirm = ref('');
const loading = ref(false);
const error = ref('');

async function submit() {
  error.value = '';
  if (password.value.length < 8 || !/[a-zA-Z]/.test(password.value) || !/[0-9]/.test(password.value)) {
    error.value = 'Use at least 8 characters with a letter and a number.';
    return;
  }
  if (password.value !== confirm.value) {
    error.value = 'The passwords do not match.';
    return;
  }
  loading.value = true;
  try {
    await apiRequest('/auth/reset-password', {
      method: 'POST',
      auth: false,
      body: { token: token.value, password: password.value },
    });
    toast.success('Password updated — sign in with your new password.');
    await navigateTo('/admin/login');
  } catch (err) {
    error.value = errorMessage(err);
  } finally {
    loading.value = false;
  }
}

useSeoMeta({ title: 'Reset password | Ticketr', robots: 'noindex, nofollow' });
</script>
