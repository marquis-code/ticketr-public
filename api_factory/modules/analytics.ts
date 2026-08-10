import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const analyticsApi = {
  getTenantAnalytics() {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/analytics/tenant');
  },
};
