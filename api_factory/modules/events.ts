import { GATEWAY_ENDPOINT_WITH_AUTH } from '../axios.config';

export const eventsApi = {
  getMyEvents() {
    return GATEWAY_ENDPOINT_WITH_AUTH.get('/events/admin/my-events');
  },
  createEvent(formData: FormData) {
    return GATEWAY_ENDPOINT_WITH_AUTH.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteEvent(id: string) {
    return GATEWAY_ENDPOINT_WITH_AUTH.delete(`/events/${id}`);
  },
  getEventAttendees(eventId: string) {
    return GATEWAY_ENDPOINT_WITH_AUTH.get(`/events/${eventId}/attendees`);
  },
};
