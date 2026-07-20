import { apiClient } from './client'
import type { Reservation, CreateReservationPayload } from '@/types'

export const reservationsApi = {
  getAvailability: (restaurantId: string, date: string, guests: number) =>
    apiClient.get<string[]>('/api/v1/reservations/availability', {
      params: { restaurantId, date, guests },
    }).then((r) => r.data),

  create: (data: CreateReservationPayload) =>
    apiClient.post<Reservation>('/api/v1/reservations', data).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Reservation>(`/api/v1/reservations/${id}`).then((r) => r.data),

  update: (id: string, data: Partial<CreateReservationPayload>) =>
    apiClient.patch<Reservation>(`/api/v1/reservations/${id}`, data).then((r) => r.data),

  cancel: (id: string) =>
    apiClient.delete(`/api/v1/reservations/${id}`),

  myReservations: () =>
    apiClient.get<Reservation[]>('/api/v1/reservations/me').then((r) => r.data),

  // Admin
  listByRestaurant: (restaurantId: string, date?: string) =>
    apiClient.get<Reservation[]>('/api/v1/reservations', { params: { restaurantId, date } }).then((r) => r.data),
}
