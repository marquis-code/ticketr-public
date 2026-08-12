<template>
  <Loader2 :class="[sizeClasses, colorClasses, 'animate-spin']" :stroke-width="strokeWidth" />
</template>

<script setup>
import { computed } from 'vue';
import { Loader2 } from 'lucide-vue-next';

const props = defineProps({
  size: {
    type: String,
    default: 'md', // xs, sm, md, lg, xl
  },
  color: {
    type: String,
    default: 'primary', // primary, white, gray, indigo
  },
  strokeWidth: {
    type: Number,
    default: 2.5
  }
});

const sizeClasses = computed(() => {
  switch(props.size) {
    case 'xs': return 'w-3 h-3';
    case 'sm': return 'w-4 h-4';
    case 'md': return 'w-6 h-6';
    case 'lg': return 'w-8 h-8';
    case 'xl': return 'w-12 h-12';
    default: return 'w-6 h-6';
  }
});

const colorClasses = computed(() => {
  switch(props.color) {
    case 'white': return 'text-white';
    case 'gray': return 'text-gray-500';
    case 'indigo': return 'text-indigo-600';
    case 'primary': 
    default: return 'text-primary';
  }
});
</script>
