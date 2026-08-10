import { ref } from 'vue';
import { tenantsApi } from '@/api_factory/modules/tenants';

export const useUpdateTenant = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const updateTenant = async (id: string, payload: any) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await tenantsApi.updateTenant(id, payload);
      return data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, updateTenant };
};
