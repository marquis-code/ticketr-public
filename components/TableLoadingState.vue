<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
    <div class="relative mb-6">
      <div class="w-20 h-20 bg-indigo-50/50 rounded-full flex items-center justify-center border-2 border-indigo-100 shadow-sm relative overflow-hidden">
        <AppLoader size="lg" color="indigo" :stroke-width="2" />
      </div>
      <div class="absolute -bottom-1 -right-1 flex gap-1">
        <div class="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style="animation-delay: 0ms"></div>
        <div class="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style="animation-delay: 150ms"></div>
        <div class="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style="animation-delay: 300ms"></div>
      </div>
    </div>
    <h3 class="text-base font-bold text-indigo-900 mb-1">Crunching numbers...</h3>
    <p class="text-xs text-indigo-400/80 font-medium tracking-wide uppercase">{{ message }}</p>
  </div>
</template>

<script setup>
import { Loader2 } from 'lucide-vue-next';
defineProps({
  message: { type: String, default: 'Fetching data' }
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
