import { ref } from 'vue';
import { ordersApi } from '@/api_factory/modules/orders';

export const useGetTenantOrders = () => {
  const orders = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await ordersApi.getTenantOrders();
      orders.value = data;
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  };

  return { orders, loading, error, fetchOrders };
};
