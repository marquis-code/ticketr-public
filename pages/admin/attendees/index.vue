<template>
  <div class="space-y-4">
    <section class="surface p-4 sm:p-5">
      <div class="flex flex-col sm:flex-row sm:items-end gap-3">
        <div class="flex-1 min-w-0">
          <label class="label" for="event">Event</label>
          <select id="event" v-model="eventId" class="input !py-2.5">
            <option value="">Select an event…</option>
            <option v-for="event in events" :key="event._id" :value="event._id">
              {{ event.title }} — {{ formatDate(event.startDate, { day: 'numeric', month: 'short' }) }}
            </option>
          </select>
        </div>
        <NuxtLink v-if="eventId" :to="`/admin/scanner?eventId=${eventId}`" class="btn-secondary btn-sm shrink-0">
          <ScanLine class="w-3.5 h-3.5" /> Open scanner
        </NuxtLink>
      </div>
    </section>

    <div v-if="eventsError" class="surface p-4 border-coral/30 bg-coral/5 flex items-start gap-3">
      <AlertTriangle class="w-5 h-5 text-coral shrink-0 mt-0.5" />
      <p class="text-sm text-ink flex-1">{{ eventsError }}</p>
      <button class="btn-secondary btn-sm" type="button" @click="loadEvents">Retry</button>
    </div>

    <div v-if="!eventId" class="surface">
      <UiEmpty
        title="Choose an event"
        message="Select an event to see its attendee roster, check-in progress and ticket actions."
        class="!py-14"
      >
        <template #icon><Users class="w-6 h-6" /></template>
      </UiEmpty>
    </div>

    <AttendeeRoster v-else :event-id="eventId" />
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, ScanLine, Users } from 'lucide-vue-next';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const events = ref<any[]>([]);
const eventsError = ref('');
const eventId = ref(typeof route.query.eventId === 'string' ? route.query.eventId : '');

async function loadEvents() {
  eventsError.value = '';
  try {
    const data = await apiRequest<any>('/events/tenant?limit=100');
    events.value = data?.data || [];
    if (!eventId.value && events.value.length === 1) eventId.value = events.value[0]._id;
  } catch (err) {
    eventsError.value = errorMessage(err, 'Could not load events.');
  }
}

watch(eventId, (value) => {
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', `/admin/attendees${value ? `?eventId=${value}` : ''}`);
  }
});

onMounted(loadEvents);
useSeoMeta({ title: 'Attendees', robots: 'noindex, nofollow' });
</script>
