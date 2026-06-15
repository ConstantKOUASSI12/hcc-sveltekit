// src/lib/api/index.ts
import { api } from './client';
import type {
  Adherent, Match, News
} from '$lib/types';

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    first_name: string; last_name: string;
    email: string; password: string; contact: string;
  }) => api.post<Adherent>('/api/auth/register', data),
};

// ── Adhérents ─────────────────────────────────────────────
export const adherentsApi = {
  update:   (id: number, data: Pick<Adherent, 'first_name' | 'last_name' | 'email' | 'contact'>) =>
    api.put<Adherent>(`/api/adherents/${id}`, data),
  validate: (adherent_id: number, role_id: number) =>
    api.patch<Adherent>('/api/adherents/validate', { adherent_id, role_id }),
};

// ── Matchs ────────────────────────────────────────────────
export const matchsApi = {
  getAll:      ()                          => api.get<Match[]>('/api/matchs/'),
  getOne:      (id: number)                => api.get<Match>(`/api/matchs/${id}`),
  create:      (data: Partial<Match>)      => api.post<Match>('/api/matchs/', data),
  update:      (id: number, d: Partial<Match>) => api.put<Match>(`/api/matchs/${id}`, d),
  subscribe:   (id: number)                => api.post(`/api/matchs/${id}/subscription`, {}),
  unsubscribe: (id: number)                => api.delete(`/api/matchs/${id}/unsubscribe`),
};

// ── News ──────────────────────────────────────────────────
export const newsApi = {
  create: (d: { title: string; content: string }) => api.post<News>('/api/news/', d),
  delete: (id: number)                            => api.delete(`/api/news/${id}`),
};
