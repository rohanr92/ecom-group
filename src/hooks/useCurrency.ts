import { useState, useEffect } from 'react'

const RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.36,
  AUD: 1.53, JPY: 149.5, BDT: 110.5,
}
const SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', CAD: 'CA$',
  AUD: 'AU$', JPY: '¥', BDT: '৳',
}

export function useCurrency() {
  const [currency, setCurrency] = useState('USD')
  const [rate,     setRate]     = useState(1)
  const [symbol,   setSymbol]   = useState('$')

  useEffect(() => {
    const saved = localStorage.getItem('sl_currency') ?? 'USD'
    setCurrency(saved)
    setRate(RATES[saved] ?? 1)
    setSymbol(SYMBOLS[saved] ?? '$')
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail
      setCurrency(d.code); setRate(d.rate); setSymbol(d.symbol)
    }
    window.addEventListener('currencyChange', handler)
    return () => window.removeEventListener('currencyChange', handler)
  }, [])

  const convert = (usdPrice: number) => {
    const v = usdPrice * rate
    if (currency === 'JPY') return `${symbol}${Math.round(v).toLocaleString()}`
    return `${symbol}${v.toFixed(2)}`
  }

  return { currency, rate, symbol, convert }
}
