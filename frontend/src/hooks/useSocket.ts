'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000'

export function useMenuSocket(
  restaurantId: string,
  onAvailabilityChange: (itemId: string, available: boolean) => void
) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!restaurantId) return

    socketRef.current = io(`${WS_URL}/ws/menus`, { transports: ['websocket'] })
    socketRef.current.emit('subscribe', { restaurantId })
    socketRef.current.on('availabilityChanged', ({ itemId, available }) => {
      onAvailabilityChange(itemId, available)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [restaurantId, onAvailabilityChange])
}

export function useDeliverySocket(
  deliveryId: string,
  onLocation: (lat: number, lng: number) => void,
  onStatus: (status: string) => void
) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!deliveryId) return

    socketRef.current = io(`${WS_URL}/ws/deliveries`, { transports: ['websocket'] })
    socketRef.current.emit('trackDelivery', { deliveryId })
    socketRef.current.on('driverLocation', ({ lat, lng }) => onLocation(lat, lng))
    socketRef.current.on('statusChanged', ({ status }) => onStatus(status))

    return () => {
      socketRef.current?.disconnect()
    }
  }, [deliveryId, onLocation, onStatus])
}
