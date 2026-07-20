import { apiClient } from './client'
import type { MenuItem } from '@/types'

export const menusApi = {
  getByRestaurant: (restaurantId: string) =>
    apiClient.get<MenuItem[]>(`/api/v1/menus/${restaurantId}`).then((r) => r.data),

  searchItems: (restaurantId: string, params?: { category?: string; tags?: string }) =>
    apiClient.get<MenuItem[]>(`/api/v1/menus/${restaurantId}/items`, { params }).then((r) => r.data),

  getItem: (id: string) =>
    apiClient.get<MenuItem>(`/api/v1/menus/items/${id}`).then((r) => r.data),

  updateAvailability: (id: string, available: boolean) =>
    apiClient.patch<MenuItem>(`/api/v1/menus/items/${id}/availability`, { available }).then((r) => r.data),

  createItem: (restaurantId: string, data: Partial<MenuItem>) =>
    apiClient.post<MenuItem>(`/api/v1/menus/${restaurantId}/items`, data).then((r) => r.data),

  updateItem: (id: string, data: Partial<MenuItem>) =>
    apiClient.patch<MenuItem>(`/api/v1/menus/items/${id}`, data).then((r) => r.data),

  deleteItem: (id: string) =>
    apiClient.delete(`/api/v1/menus/items/${id}`),
}
