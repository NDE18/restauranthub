import { apiClient } from './client'
import type { Order, OrderStatus, CartItem } from '@/types'

export const ordersApi = {
  create: (data: {
    restaurantId: string
    type: string
    items: CartItem[]
    promoCode?: string
    deliveryAddress?: string
    pickupTime?: string
    idempotencyKey?: string
  }) => apiClient.post<Order>('/api/v1/orders', data).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Order>(`/api/v1/orders/${id}`).then((r) => r.data),

  myOrders: () =>
    apiClient.get<Order[]>('/api/v1/orders/me').then((r) => r.data),

  updateStatus: (id: string, status: OrderStatus) =>
    apiClient.patch<Order>(`/api/v1/orders/${id}/status`, null, { params: { status } }).then((r) => r.data),

  cancel: (id: string) =>
    apiClient.post(`/api/v1/orders/${id}/cancel`),

  // Admin
  listByRestaurant: (restaurantId: string, status?: OrderStatus) =>
    apiClient.get<Order[]>('/api/v1/orders', { params: { restaurantId, status } }).then((r) => r.data),
}
