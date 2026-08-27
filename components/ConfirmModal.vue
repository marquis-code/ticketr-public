<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 lg:p-8 transform transition-all">
        <h3 class="text-xl font-bold text-gray-900">{{ title }}</h3>
        <p class="mt-2 text-sm text-gray-500 leading-relaxed">{{ description }}</p>
        
        <div class="mt-6 flex items-center justify-end gap-3">
          <button 
            type="button" 
            @click="$emit('close')"
            class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            Cancel
          </button>
          <button 
            type="button" 
            @click="$emit('confirm')"
            class="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
<script setup>
defineProps({
  isOpen: Boolean,
  title: String,
  description: String
});
defineEmits(['close', 'confirm']);
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
