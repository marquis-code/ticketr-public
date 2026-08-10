import { ref } from 'vue';
import { authApi } from '@/api_factory/modules/auth';

export const useLogin = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await authApi.login({ email, password });
      return data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Login failed';
      return null;
    } finally {
      loading.value = false;
    }
  };

  return { loading, error, login };
};
