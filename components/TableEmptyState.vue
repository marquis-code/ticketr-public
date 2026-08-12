<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
    <div class="relative mb-6 group">
      <div class="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
      <div class="w-24 h-24 bg-gradient-to-tr from-indigo-50 to-purple-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl relative animate-bounce-slow">
        <Ghost class="w-10 h-10 text-indigo-400" stroke-width="1.5" />
      </div>
      <Sparkles class="w-5 h-5 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
    </div>
    <h3 class="text-lg font-bold text-gray-800 mb-2 font-display">{{ title }}</h3>
    <p class="text-sm text-gray-500 max-w-sm">{{ message }}</p>
  </div>
</template>

<script setup>
import { Ghost, Sparkles } from 'lucide-vue-next';
defineProps({
  title: { type: String, default: 'Nothing here yet!' },
  message: { type: String, default: 'We couldn\'t find any records to show you.' }
});
</script>

<style scoped>
.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}
@keyframes bounce-slow {
  0%, 100% { transform: translateY(-5%); }
  50% { transform: translateY(5%); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
