<template>
  <div>
    <AttendeeRoster v-if="eventId" :event-id="eventId" />
    <div v-else class="surface p-6">
      <p class="text-sm text-muted">Event not specified.</p>
      <NuxtLink to="/admin/events" class="btn-primary btn-sm mt-3">Back to events</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' });
const route = useRoute();
const eventId = computed(() => String(route.params.id || ''));
useSeoMeta({ title: 'Event attendees', robots: 'noindex, nofollow' });
</script>
