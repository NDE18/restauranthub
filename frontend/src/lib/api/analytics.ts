import { apiClient } from './client'
import type { DashboardKpi } from '@/types'

export const analyticsApi = {
  getDashboard: (restaurantId: string, period: 'day' | 'week' | 'month' = 'month') =>
    apiClient.get<DashboardKpi>('/api/v1/analytics/dashboard', { params: { restaurantId, period } }).then((r) => r.data),

  getSales: (restaurantId: string) =>
    apiClient.get('/api/v1/analytics/sales', { params: { restaurantId } }).then((r) => r.data),

  getCustomers: (restaurantId: string) =>
    apiClient.get('/api/v1/analytics/customers', { params: { restaurantId } }).then((r) => r.data),

  getRecommendations: (userId: string) =>
    apiClient.get(`/api/v1/analytics/recommendations/${userId}`).then((r) => r.data),

  exportReport: (restaurantId: string, format: 'pdf' | 'excel' = 'pdf') =>
    apiClient.post('/api/v1/analytics/reports/export', null, { params: { restaurantId, format } }).then((r) => r.data),
}
