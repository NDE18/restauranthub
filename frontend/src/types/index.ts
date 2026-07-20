// ============================================================
// Domaine utilisateur
// ============================================================
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'
  emailVerified: boolean
  twoFaEnabled: boolean
  roles: string[]
  createdAt: string
}

// ============================================================
// Restaurants
// ============================================================
export interface Restaurant {
  id: string
  name: string
  description?: string
  phone?: string
  email?: string
  addressLine1: string
  city: string
  postalCode?: string
  country: string
  latitude?: number
  longitude?: number
  cuisineType?: string
  capacityTotal?: number
  status: 'ACTIVE' | 'CLOSED' | 'SUSPENDED'
  createdAt: string
}

export interface BusinessHours {
  dayOfWeek: string
  openTime: string
  closeTime: string
  closed: boolean
}

// ============================================================
// Menus
// ============================================================
export interface MenuItem {
  id: string
  restaurantId: string
  categoryId: string
  categoryName: string
  name: string
  description?: string
  price: number
  available: boolean
  allergens: string[]
  tags: string[]
  imageUrl?: string
  nutritionalInfo?: {
    calories?: number
    proteins?: number
    carbs?: number
    fats?: number
  }
  options?: MenuItemOption[]
}

export interface MenuItemOption {
  name: string
  required: boolean
  choices: { label: string; priceModifier: number }[]
}

export interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

// ============================================================
// Réservations
// ============================================================
export interface Reservation {
  id: string
  restaurantId: string
  userId: string
  reservationDate: string
  startTime: string
  endTime?: string
  guestsCount: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED'
  specialRequests?: string
  createdAt: string
}

export interface CreateReservationPayload {
  restaurantId: string
  reservationDate: string
  startTime: string
  guestsCount: number
  specialRequests?: string
  idempotencyKey?: string
}

// ============================================================
// Commandes
// ============================================================
export type OrderType = 'CLICK_AND_COLLECT' | 'DELIVERY' | 'ON_SITE'
export type OrderStatus =
  | 'CREATED'
  | 'PAID'
  | 'IN_PREPARATION'
  | 'READY'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'

export interface OrderItem {
  menuItemId: string
  itemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Order {
  id: string
  userId: string
  restaurantId: string
  type: OrderType
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  deliveryFee: number
  totalAmount: number
  createdAt: string
}

export interface CartItem {
  menuItemId: string
  itemName: string
  quantity: number
  unitPrice: number
  imageUrl?: string
}

// ============================================================
// Paiement
// ============================================================
export type PaymentStatus =
  | 'PENDING'
  | 'REQUIRES_ACTION'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'

export interface Payment {
  id: string
  orderId: string
  amount: number
  currency: string
  status: PaymentStatus
  clientSecret?: string
  invoiceUrl?: string
  createdAt: string
}

// ============================================================
// Livraison
// ============================================================
export type DeliveryStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED'

export interface Delivery {
  id: string
  orderId: string
  restaurantId: string
  customerId: string
  deliveryAddress: string
  status: DeliveryStatus
  estimatedMinutes?: number
  deliveryFee?: number
  driverLat?: number
  driverLng?: number
  createdAt: string
}

// ============================================================
// Fidélité
// ============================================================
export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'

export interface LoyaltyAccount {
  userId: string
  pointsBalance: number
  totalPointsEarned: number
  tier: LoyaltyTier
  referralCode: string
}

export interface LoyaltyTransaction {
  id: string
  type: 'CREDIT' | 'DEBIT' | 'EXPIRY'
  points: number
  description: string
  referenceId?: string
  createdAt: string
}

export interface Reward {
  id: string
  name: string
  description?: string
  pointsCost: number
  minTier: LoyaltyTier
}

// ============================================================
// Analytics
// ============================================================
export interface DashboardKpi {
  restaurantId: string
  period: string
  totalRevenue: number
  ordersCount: number
  avgBasket: number
  revenueByDay: { date: string; revenue: number }[]
}

// ============================================================
// Pagination
// ============================================================
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
