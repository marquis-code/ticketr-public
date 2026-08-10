<template>
  <Toaster position="top-right" richColors />
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
import '~/assets/css/main.css';
import { Toaster } from 'vue-sonner';
</script>
