import { apiClient } from './client'
import type { Restaurant, BusinessHours, Page } from '@/types'

export const restaurantsApi = {
  list: (params?: { city?: string; cuisineType?: string; page?: number; size?: number }) =>
    apiClient.get<Page<Restaurant>>('/api/v1/restaurants', { params }).then((r) => r.data),

  nearby: (lat: number, lng: number, radius = 5000) =>
    apiClient.get<Restaurant[]>('/api/v1/restaurants/nearby', { params: { lat, lng, radius } }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Restaurant>(`/api/v1/restaurants/${id}`).then((r) => r.data),

  getSchedule: (id: string) =>
    apiClient.get<{ schedule: BusinessHours[] }>(`/api/v1/restaurants/${id}/schedule`).then((r) => r.data),

  create: (data: Partial<Restaurant>) =>
    apiClient.post<Restaurant>('/api/v1/restaurants', data).then((r) => r.data),

  update: (id: string, data: Partial<Restaurant>) =>
    apiClient.patch<Restaurant>(`/api/v1/restaurants/${id}`, data).then((r) => r.data),
}
