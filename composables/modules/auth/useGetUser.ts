import { ref } from 'vue';
import { authApi } from '@/api_factory/modules/auth';

export const useGetUser = () => {
  const user = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchUser = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await authApi.me();
      user.value = data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  };

  return { user, loading, error, fetchUser };
};
