import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const ordersApi = {
  getTenantOrders() {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/orders/tenant');
  },
};
