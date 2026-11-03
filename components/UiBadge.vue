<template>
  <span :class="classes">
    <span v-if="dot" class="status-dot" :class="dotClass" />
    <slot>{{ label || humanStatus(value) }}</slot>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value?: string;
    label?: string;
    tone?: 'green' | 'amber' | 'red' | 'ink' | 'muted' | 'lime';
    dot?: boolean;
  }>(),
  { dot: false },
);

const resolvedTone = computed(() => props.tone || statusTone(props.value));

const classes = computed(() => {
  const map: Record<string, string> = {
    green: 'chip-soft',
    amber: 'chip border-transparent bg-amber-100 text-amber-900',
    red: 'chip-coral',
    ink: 'chip-ink',
    muted: 'chip-muted',
    lime: 'chip-lime',
  };
  return map[resolvedTone.value] || 'chip-muted';
});

const dotClass = computed(() => {
  const map: Record<string, string> = {
    green: 'bg-forest',
    amber: 'bg-amber-500',
    red: 'bg-coral',
    ink: 'bg-paper',
    muted: 'bg-muted',
    lime: 'bg-ink',
  };
  return map[resolvedTone.value] || 'bg-muted';
});
</script>
