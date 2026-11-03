<template>
  <div class="p-10 text-center">
    <div class="w-8 h-8 mx-auto rounded-full border-4 border-line border-t-forest animate-spin" />
    <p class="text-sm text-muted mt-3">Opening your dashboard…</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });
onMounted(() => navigateTo('/admin/dashboard', { replace: true }));
</script>
