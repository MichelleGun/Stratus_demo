import { rng, pick, gauss } from '../lib/prng'

export const REGIONS = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] as const
export const PRODUCTS = ['Laptop Stand', 'USB-C Hub', 'Noise Headset', 'Webcam HD', 'Desk Lamp', 'Keyboard'] as const
const BASE_PRICE: Record<string, number> = { 'Laptop Stand': 49, 'USB-C Hub': 39, 'Noise Headset': 129, 'Webcam HD': 89, 'Desk Lamp': 35, Keyboard: 79 }

export interface SaleRow {
  date: string
  quarter: number
  region: string
  product: string
  units: number
  price: number
  margin: number
}

let cache: SaleRow[] | null = null
export function sales(n = 50_000): SaleRow[] {
  if (cache && cache.length === n) return cache
  const r = rng(101)
  const rows: SaleRow[] = new Array(n)
  for (let i = 0; i < n; i++) {
    const day = Math.floor((i / n) * 365)
    const d = new Date(Date.UTC(2026, 0, 1 + day))
    const product = pick(r, PRODUCTS)
    const region = REGIONS[Math.min(4, Math.floor(Math.pow(r(), 1.4) * 5))]
    rows[i] = {
      date: d.toISOString().slice(0, 10),
      quarter: Math.floor(d.getUTCMonth() / 3) + 1,
      region,
      product,
      units: 1 + Math.floor(r() * 24),
      price: Math.round(BASE_PRICE[product] * (0.9 + r() * 0.2)),
      margin: Math.max(4, Math.min(48, Math.round(24 + gauss(r) * 9))),
    }
  }
  cache = rows
  return rows
}

export function money(n: number) {
  return '$' + Math.round(n).toLocaleString('en-AU')
}
export function moneyK(n: number) {
  return n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? '$' + (n / 1e3).toFixed(1) + 'k' : '$' + Math.round(n)
}
