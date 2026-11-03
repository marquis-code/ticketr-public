<template>
  <div class="flex flex-col items-center justify-center text-center px-4 py-14 sm:py-16">
    <div class="w-14 h-14 rounded-2xl bg-paper border border-line flex items-center justify-center text-ink/50 mb-4">
      <slot name="icon">
        <Inbox class="w-6 h-6" />
      </slot>
    </div>
    <h3 class="font-display text-lg font-semibold text-ink">{{ title }}</h3>
    <p v-if="message" class="text-sm text-muted mt-1.5 max-w-sm leading-relaxed">{{ message }}</p>
    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Inbox } from 'lucide-vue-next';

withDefaults(
  defineProps<{ title: string; message?: string }>(),
  { message: '' },
);
</script>
