import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const ticketsApi = {
  verifyScan(data: { qrCodeHash: string }) {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/tickets/verify-scan', data);
  },
};
