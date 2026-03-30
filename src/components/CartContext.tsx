'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type CartItem = {
  id: number
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
  removeItem: (id: number, size: string, color: string) => void
  updateQty: (id: number, size: string, color: string, qty: number) => void
  clearCart: () => void
  totalCount: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sl_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    setReady(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (ready) localStorage.setItem('sl_cart', JSON.stringify(items))
  }, [items, ready])

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === newItem.id && i.size === newItem.size && i.color === newItem.color)
      if (exists) {
        return prev.map(i =>
          i.id === newItem.id && i.size === newItem.size && i.color === newItem.color
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      }
      return [...prev, newItem]
    })
  }

  const removeItem = (id: number, size: string, color: string) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size && i.color === color)))
  }

  const updateQty = (id: number, size: string, color: string, qty: number) => {
    if (qty < 1) { removeItem(id, size, color); return }
    setItems(prev => prev.map(i =>
      i.id === id && i.size === size && i.color === color ? { ...i, quantity: qty } : i
    ))
  }

  const clearCart = () => setItems([])

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}