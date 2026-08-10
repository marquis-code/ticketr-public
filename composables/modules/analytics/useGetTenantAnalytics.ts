import { ref } from 'vue';
import { analyticsApi } from '@/api_factory/modules/analytics';

export const useGetTenantAnalytics = () => {
  const analytics = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchAnalytics = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await analyticsApi.getTenantAnalytics();
      analytics.value = data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  };

  return { analytics, loading, error, fetchAnalytics };
};
