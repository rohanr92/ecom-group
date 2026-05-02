'use client'
import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

export type CartItem = {
  id: number | string
  name: string
  brand: string
  price: number
  image: string
  size: string
  color: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number | string, size: string, color: string) => void
  updateQty: (id: number | string, size: string, color: string, qty: number) => void
  clearCart: () => void
  totalCount: number
  totalPrice: number
  cartLoaded: boolean
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const loaded = useRef(false)
  const [cartLoaded, setCartLoaded] = useState(false)

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sl_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    loaded.current = true
    setCartLoaded(true)
  }, [])

  // Save to localStorage only after initial load is complete
  useEffect(() => {
    if (!loaded.current) return
    try {
      localStorage.setItem('sl_cart', JSON.stringify(items))
    } catch {}
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      const exists = prev.find(i =>
        String(i.id) === String(newItem.id) &&
        i.size === newItem.size &&
        i.color === newItem.color
      )
      if (exists) {
        return prev.map(i =>
          String(i.id) === String(newItem.id) && i.size === newItem.size && i.color === newItem.color
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      }
      return [...prev, newItem]
    })
  }

  const removeItem = (id: number | string, size: string, color: string) => {
    setItems(prev => prev.filter(i =>
      !(String(i.id) === String(id) && i.size === size && i.color === color)
    ))
  }

  const updateQty = (id: number | string, size: string, color: string, qty: number) => {
    if (qty < 1) { removeItem(id, size, color); return }
    setItems(prev => prev.map(i =>
      String(i.id) === String(id) && i.size === size && i.color === color
        ? { ...i, quantity: qty }
        : i
    ))
  }

  const clearCart = () => {
    setItems([])
    try { localStorage.removeItem('sl_cart') } catch {}
  }

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalCount, totalPrice, cartLoaded }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
