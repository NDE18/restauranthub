import { apiClient } from './client'
import type { LoyaltyAccount, LoyaltyTransaction, Reward } from '@/types'

export const loyaltyApi = {
  getMyAccount: (userId: string) =>
    apiClient.get<LoyaltyAccount>('/api/v1/loyalty/me', { params: { user_id: userId } }).then((r) => r.data),

  getTransactions: (userId: string) =>
    apiClient.get<LoyaltyTransaction[]>('/api/v1/loyalty/me/transactions', { params: { user_id: userId } }).then((r) => r.data),

  getRewards: () =>
    apiClient.get<Reward[]>('/api/v1/loyalty/rewards').then((r) => r.data),

  redeem: (rewardId: string, userId: string) =>
    apiClient.post('/api/v1/loyalty/redeem', { rewardId }, { params: { user_id: userId } }).then((r) => r.data),

  generateReferral: (userId: string) =>
    apiClient.post('/api/v1/loyalty/referral', null, { params: { user_id: userId } }).then((r) => r.data),

  applyReferral: (code: string, userId: string) =>
    apiClient.post('/api/v1/loyalty/referral/apply', { code }, { params: { user_id: userId } }).then((r) => r.data),
}
