<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="relative bg-gray-100 rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col transform transition-all overflow-hidden border border-gray-200">
        <!-- Header -->
        <div class="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">Email Preview</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <!-- Body (Iframe for isolated rendering) -->
        <div class="flex-1 bg-gray-100 p-4 lg:p-8 overflow-y-auto">
          <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 min-h-full">
            <iframe 
              ref="previewFrame" 
              class="w-full h-full min-h-[500px]" 
              :srcdoc="wrappedHtml" 
              frameborder="0"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  htmlContent: {
    type: String,
    default: ''
  }
});
defineEmits(['close']);

const wrappedHtml = computed(() => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', sans-serif; background-color: #ffffff; padding: 20px; color: #111827; line-height: 1.6; margin: 0; }
      </style>
    </head>
    <body>
      ${props.htmlContent}
    </body>
    </html>
  `;
});
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
