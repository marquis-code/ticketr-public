<template>
  <div class="min-h-screen w-full flex flex-col bg-gray-50">
    <ClientOnly>
      <Toaster position="top-right" richColors />
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage class="flex-grow flex flex-col" />
    </NuxtLayout>
  </div>
</template>

<script setup>
import '~/assets/css/main.css';
import { Toaster } from 'vue-sonner';
</script>
