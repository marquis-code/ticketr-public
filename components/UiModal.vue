<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" :aria-label="title">
        <div class="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" @click="closable && $emit('close')"></div>
        <Transition
          appear
          enter-active-class="transition duration-250 ease-[cubic-bezier(.2,.8,.2,1)]"
          enter-from-class="opacity-0 translate-y-4 sm:scale-[0.98]"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        >
          <div
            v-if="open"
            class="relative w-full bg-white border border-line rounded-t-[24px] sm:rounded-[22px] shadow-pop
              max-h-[92vh] overflow-y-auto"
            :class="widthClass"
          >
            <div class="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b border-line">
              <div class="min-w-0">
                <p v-if="eyebrow" class="text-[10px] font-bold uppercase tracking-[0.16em] text-muted mb-1">{{ eyebrow }}</p>
                <h2 class="font-display text-xl sm:text-2xl font-semibold text-ink leading-tight">{{ title }}</h2>
                <p v-if="description" class="text-sm text-muted mt-1.5">{{ description }}</p>
              </div>
              <button
                v-if="closable"
                type="button"
                class="shrink-0 rounded-full p-2 -mr-1 text-muted hover:text-ink hover:bg-paper transition"
                aria-label="Close dialog"
                @click="$emit('close')"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="px-5 sm:px-6 py-5">
              <slot />
            </div>

            <div v-if="$slots.footer" class="px-5 sm:px-6 py-4 border-t border-line bg-paper/60 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    eyebrow?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closable?: boolean;
  }>(),
  { size: 'md', closable: true },
);

const emit = defineEmits<{ close: [] }>();

const widthClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'sm:max-w-sm';
    case 'lg': return 'sm:max-w-2xl';
    case 'xl': return 'sm:max-w-4xl';
    default: return 'sm:max-w-lg';
  }
});

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open && props.closable) emit('close');
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));

watch(
  () => props.open,
  (isOpen) => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isOpen ? 'hidden' : '';
  },
);

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = '';
});
</script>
