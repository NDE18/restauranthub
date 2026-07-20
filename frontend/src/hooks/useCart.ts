'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  restaurantId: string | null
  addItem: (item: CartItem, restaurantId: string) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clear: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addItem: (item, restaurantId) => {
        const { items, restaurantId: currentRestaurant } = get()

        // Réinitialiser si changement de restaurant
        if (currentRestaurant && currentRestaurant !== restaurantId) {
          set({ items: [{ ...item, quantity: 1 }], restaurantId })
          return
        }

        const existing = items.find((i) => i.menuItemId === item.menuItemId)
        if (existing) {
          set({
            items: items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
            restaurantId,
          })
        } else {
          set({ items: [...items, { ...item, quantity: 1 }], restaurantId })
        }
      },

      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        })),

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        }))
      },

      clear: () => set({ items: [], restaurantId: null }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: 'restaurant-cart' }
  )
)
