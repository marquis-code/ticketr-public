import { ref } from 'vue';
import { eventsApi } from '@/api_factory/modules/events';

export const useGetEventAttendees = () => {
  const attendees = ref([]);
  const eventData = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchAttendees = async (eventId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await eventsApi.getEventAttendees(eventId);
      attendees.value = data.attendees;
      eventData.value = data.event;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  };

  return { attendees, eventData, loading, error, fetchAttendees };
};
