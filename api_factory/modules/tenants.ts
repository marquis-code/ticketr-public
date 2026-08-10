import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const tenantsApi = {
  updateTenant(id: string, data: any) {
    return GATEWAY_ENDPOINT_WITH_AUTH.patch(`/tenants/${id}`, data);
  },
};
