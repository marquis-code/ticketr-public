import { ref } from 'vue';
import { ticketsApi } from '@/api_factory/modules/tickets';

export const useVerifyScan = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const verifyScan = async (qrCodeHash: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await ticketsApi.verifyScan({ qrCodeHash });
      return data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, verifyScan };
};
