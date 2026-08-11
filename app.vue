<template>
  <ClientOnly>
    <Toaster 
      position="top-center" 
      :toastOptions="{
        style: {
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '100px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
          color: '#0f172a',
          fontSize: '14px',
          fontWeight: '600',
          padding: '12px 24px',
        }
      }" 
    />
  </ClientOnly>
  <div class="min-h-screen w-full flex flex-col bg-gray-50">
    <NuxtLayout>
      <NuxtPage class="flex-grow flex flex-col" />
    </NuxtLayout>
  </div>
</template>

<script setup>
import '~/assets/css/main.css';
import { Toaster } from 'vue-sonner';
</script>
