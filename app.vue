<template>
  <div>
    <ClientOnly>
      <Toaster position="top-right" richColors />
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import '~/assets/css/main.css';
import { Toaster } from 'vue-sonner';
</script>
