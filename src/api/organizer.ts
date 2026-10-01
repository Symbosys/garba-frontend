import { apiRequest, toQueryString } from '../lib/api-client';
import type { Paginated, OrganizerEvent, EventSlot } from './types';

export interface SlotPayload {
  id?: string;
  title?: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  entryFee: number;
  currency?: string;
  capacity?: number;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  venueName?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  contactEmail?: string;
  contactPhone?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  slots?: SlotPayload[];
}

export const organizerApi = {
  getEvents: (page = 1, limit = 20) =>
    apiRequest<Paginated<OrganizerEvent>>(`/organizer/events${toQueryString({ page, limit })}`),

  getEvent: (eventId: string) =>
    apiRequest<OrganizerEvent>(`/organizer/events/${eventId}`),

  createEvent: (formData: FormData) =>
    apiRequest<OrganizerEvent>('/organizer/events', {
      method: 'POST',
      body: formData,
    }),

  updateEvent: (eventId: string, data: UpdateEventPayload) =>
    apiRequest<OrganizerEvent>(`/organizer/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteEvent: (eventId: string) =>
    apiRequest<void>(`/organizer/events/${eventId}`, {
      method: 'DELETE',
    }),

  addEventImages: (eventId: string, formData: FormData) =>
    apiRequest<{ count: number }>(`/organizer/events/${eventId}/images`, {
      method: 'POST',
      body: formData,
    }),

  deleteEventImage: (eventId: string, imageId: string) =>
    apiRequest<void>(`/organizer/events/${eventId}/images/${imageId}`, {
      method: 'DELETE',
    }),

  addEventSlot: (eventId: string, slot: SlotPayload) =>
    apiRequest<EventSlot>(`/organizer/events/${eventId}/slots`, {
      method: 'POST',
      body: JSON.stringify(slot),
    }),

  updateEventSlot: (eventId: string, slotId: string, slot: Partial<SlotPayload>) =>
    apiRequest<EventSlot>(`/organizer/events/${eventId}/slots/${slotId}`, {
      method: 'PATCH',
      body: JSON.stringify(slot),
    }),

  deleteEventSlot: (eventId: string, slotId: string) =>
    apiRequest<void>(`/organizer/events/${eventId}/slots/${slotId}`, {
      method: 'DELETE',
    }),
};
