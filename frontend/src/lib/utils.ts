import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMMM yyyy', { locale: fr })
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), "dd MMM yyyy 'à' HH:mm", { locale: fr })
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  CREATED: 'Créée',
  PAID: 'Payée',
  IN_PREPARATION: 'En préparation',
  READY: 'Prête',
  PICKED_UP: 'Retirée',
  DELIVERED: 'Livrée',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
}

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  NO_SHOW: 'Absent',
  COMPLETED: 'Terminée',
}

export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  CREATED: 'Créée',
  ASSIGNED: 'Livreur assigné',
  PICKED_UP: 'Récupérée',
  IN_TRANSIT: 'En route',
  DELIVERED: 'Livrée',
  FAILED: 'Échec',
  CANCELLED: 'Annulée',
}

export const TIER_LABELS: Record<string, string> = {
  BRONZE: 'Bronze',
  SILVER: 'Argent',
  GOLD: 'Or',
  PLATINUM: 'Platine',
}

export const TIER_COLORS: Record<string, string> = {
  BRONZE: 'text-orange-600',
  SILVER: 'text-slate-500',
  GOLD: 'text-yellow-500',
  PLATINUM: 'text-violet-600',
}
