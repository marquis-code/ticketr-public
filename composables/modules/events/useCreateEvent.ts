import { ref } from 'vue';
import { eventsApi } from '@/api_factory/modules/events';

export const useCreateEvent = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const createEvent = async (formData: FormData) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await eventsApi.createEvent(formData);
      return data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, createEvent };
};
