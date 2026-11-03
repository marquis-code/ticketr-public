<script setup lang="ts">
definePageMeta({ layout: false });
const route = useRoute();
const token = typeof route.query.token === 'string' ? route.query.token : '';
await navigateTo(`/admin/reset-password${token ? `?token=${encodeURIComponent(token)}` : ''}`, { redirectCode: 301 });
</script>
<template><div /></template>
