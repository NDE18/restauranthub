import { apiClient } from './client'
import type { Payment } from '@/types'

export const paymentsApi = {
  createIntent: (orderId: string, idempotencyKey?: string) =>
    apiClient.post<Payment>('/api/v1/payments/intent', { orderId, idempotencyKey }).then((r) => r.data),

  confirm: (paymentId: string) =>
    apiClient.post<Payment>('/api/v1/payments/confirm', null, { params: { paymentId } }).then((r) => r.data),

  refund: (paymentId: string) =>
    apiClient.post<Payment>('/api/v1/payments/refund', null, { params: { paymentId } }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Payment>(`/api/v1/payments/${id}`).then((r) => r.data),

  myInvoices: () =>
    apiClient.get<Payment[]>('/api/v1/payments/me/invoices').then((r) => r.data),
}
