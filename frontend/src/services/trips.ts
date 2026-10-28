import api from './api';
import type { Trip } from '../types';

export const tripsService = {
  list: () => api.get<Trip[]>('/api/v1/trips').then((r) => r.data),

  get: (id: string) => api.get<Trip>(`/api/v1/trips/${id}`).then((r) => r.data),

  create: (payload: Partial<Trip>) =>
    api.post<Trip>('/api/v1/trips', payload).then((r) => r.data),

  update: (id: string, payload: Partial<Trip>) =>
    api.put<Trip>(`/api/v1/trips/${id}`, payload).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/api/v1/trips/${id}`).then((r) => r.data),

  saveItinerary: (id: string, payload: { days: any[]; budget_estimate?: any }) =>
    api.post(`/api/v1/trips/${id}/save-itinerary`, payload).then((r) => r.data),
};
