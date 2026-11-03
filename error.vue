<template>
  <div class="min-h-screen bg-paper flex items-center justify-center px-5 py-16">
    <div class="w-full max-w-lg text-center">
      <NuxtLink to="/" class="inline-flex items-center gap-2.5 mb-8">
        <span class="w-9 h-9 rounded-xl bg-ink flex items-center justify-center">
          <Ticket class="w-[18px] h-[18px] text-lime" />
        </span>
        <span class="font-display text-[22px] font-semibold tracking-[-0.04em] text-ink">ticketr.</span>
      </NuxtLink>

      <p class="font-display text-[7rem] leading-none font-semibold text-line-strong tracking-[-0.06em]">{{ error.statusCode }}</p>
      <h1 class="font-display text-2xl font-semibold text-ink mt-2">
        {{ error.statusCode === 404 ? 'This page does not exist' : 'Something went wrong' }}
      </h1>
      <p class="text-sm text-muted mt-2">
        {{ error.statusCode === 404 ? 'The link may be old, or the event may have been unpublished.' : (error.message || 'We could not complete that request.') }}
      </p>

      <div class="flex flex-wrap justify-center gap-2 mt-6">
        <button class="btn-primary" type="button" @click="handleError">Go home</button>
        <NuxtLink to="/my-tickets" class="btn-secondary">My tickets</NuxtLink>
        <a href="mailto:support@ticketr.org" class="btn-ghost">Contact support</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ticket } from 'lucide-vue-next';
defineProps<{ error: any }>();
function handleError() {
  clearError({ redirect: '/' });
}
</script>
