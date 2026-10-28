import api from './api';
import type { Recommendation, TripPreferences } from '../types';

export const itineraryService = {
  getRecommendations: (prefs: Partial<TripPreferences>) =>
    api.post<{ recommendations: Recommendation[]; is_demo: boolean }>(
      '/api/v1/recommendations', prefs
    ).then((r) => r.data),

  generate: (payload: any) =>
    api.post('/api/v1/itinerary/generate', payload).then((r) => r.data),

  regenerateDay: (tripId: string, dayNumber: number, payload: any) =>
    api.post(`/api/v1/itinerary/${tripId}/day/${dayNumber}/regenerate`, payload).then((r) => r.data),

  replaceActivity: (tripId: string, payload: any) =>
    api.post(`/api/v1/itinerary/${tripId}/activity/replace`, payload).then((r) => r.data),

  updateActivity: (tripId: string, payload: { activity_id: string; updates: any }) =>
    api.put(`/api/v1/itinerary/${tripId}/activity`, payload).then((r) => r.data),

  downloadPDF: async (tripId: string, filename: string) => {
    const res = await api.get(`/api/v1/export/${tripId}/pdf`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
