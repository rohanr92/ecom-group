'use client'

import React from 'react'
import Link from 'next/link'
import { X, Check, ShoppingBag } from 'lucide-react'
import { CartItem, useCart } from './CartContext'
import { useCurrency } from '@/hooks/useCurrency'

type Props = {
  item: CartItem
  onClose: () => void
}

export default function AddedToCartModal({ item, onClose }: Props) {
  const { totalCount, totalPrice } = useCart()
  const { convert } = useCurrency()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white w-[90vw] max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[#4a6741]">
            <Check size={16} strokeWidth={2.5} />
            <span className="text-[12px] font-semibold tracking-[0.15em] uppercase">Added to your bag</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <X size={18} strokeWidth={1.5} color="#1a1a1a" />
          </button>
        </div>

        {/* Product row */}
        <div className="flex gap-4 px-6 py-5">
          <div className="w-24 aspect-[2.5/3.8] overflow-hidden bg-[#f5f2ed] shrink-0">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center gap-1.5">
            <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">{item.brand}</p>
            <p className="font-[family-name:var(--font-display)] text-lg italic text-[#1a1a1a] leading-snug">
              {item.name}
            </p>
            <p className="text-[12px] text-gray-500 tracking-wide">Size: {item.size}</p>
            <p className="text-[12px] text-gray-500 tracking-wide">Color: {item.color}</p>
            <p className="font-[family-name:var(--font-display)] text-xl font-light text-[#1a1a1a] mt-1">
              {convert(item.price)}
            </p>
          </div>
        </div>

        {/* Cart summary */}
        <div className="mx-6 mb-5 px-4 py-3 bg-[#f8f6f1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} strokeWidth={1.5} color="#6b6b6b" />
            <span className="text-[12px] text-gray-500 tracking-wide">
              {totalCount} {totalCount === 1 ? 'item' : 'items'} in bag
            </span>
          </div>
          <span className="font-[family-name:var(--font-display)] text-base font-light text-[#1a1a1a]">
            {convert(totalPrice)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 px-6 pb-6">
          <Link
            href="/checkout"
            onClick={onClose}
            className="w-full h-12 bg-[#1a1a1a] text-white text-[12px] font-semibold tracking-[0.2em] uppercase flex items-center justify-center hover:bg-[#333] transition-colors no-underline"
          >
            Checkout
          </Link>
          <Link
            href="/cart"
            onClick={onClose}
            className="w-full h-12 border border-gray-300 text-[#1a1a1a] text-[12px] tracking-[0.15em] uppercase flex items-center justify-center hover:border-[#1a1a1a] transition-colors no-underline"
          >
            View Shopping Bag ({totalCount})
          </Link>
          <button
            onClick={onClose}
            className="text-[11px] text-gray-400 tracking-wide underline bg-transparent border-none cursor-pointer hover:text-[#1a1a1a] mt-1"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  )
}