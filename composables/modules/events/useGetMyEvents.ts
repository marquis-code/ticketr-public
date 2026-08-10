import { ref } from 'vue';
import { eventsApi } from '@/api_factory/modules/events';

export const useGetMyEvents = () => {
  const events = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchEvents = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await eventsApi.getMyEvents();
      events.value = data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  };

  return { events, loading, error, fetchEvents };
};
