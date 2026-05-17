/**
 * FoodHunt — Turnuva sabitleri ve yardımcıları
 */
import type { Restaurant } from '../../api'

export const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#18181B"/><text x="200" y="160" text-anchor="middle" fill="#A1A1AA" font-size="48">&#127869;</text></svg>'
)

export const MEAL_TYPES = [
  { id: 'all',       label: 'Hepsi',          emoji: '🍽' },
  { id: 'protein',   label: 'Protein',        emoji: '🥩' },
  { id: 'cheat',     label: 'Cheat Meal',     emoji: '🍔' },
  { id: 'healthy',   label: 'Sağlıklı',       emoji: '🥗' },
  { id: 'quick',     label: 'Hızlı Atıştırma', emoji: '⚡' },
  { id: 'dessert',   label: 'Tatlı',          emoji: '🍰' },
  { id: 'breakfast', label: 'Kahvaltı',       emoji: '🥐' },
  { id: 'seafood',   label: 'Deniz Ürünü',    emoji: '🐟' },
] as const

export const PLATFORM_LINKS = [
  { key: 'yemeksepeti', label: "Yemeksepeti'de Sipariş Ver", url: 'https://www.yemeksepeti.com' },
  { key: 'getir',       label: "Getir'de Sipariş Ver",       url: 'https://getir.com' },
  { key: 'trendyol',    label: "Trendyol Go'da Sipariş Ver", url: 'https://www.trendyol.com/trendyol-go' },
] as const

/** Round name (Final / Yarı / Çeyrek / Son N) */
export function getRoundName(remaining: number, _total: number): string {
  if (remaining === 2) return 'Final'
  if (remaining === 4) return 'Yarı Final'
  if (remaining === 8) return 'Çeyrek Final'
  return `Son ${remaining}`
}

/** Restoran dizisini 2'li eşleştirmelere böl */
export function createPairs(arr: Restaurant[]): Restaurant[][] {
  const pairs: Restaurant[][] = []
  for (let i = 0; i < arr.length; i += 2) {
    if (i + 1 < arr.length) pairs.push([arr[i], arr[i + 1]])
  }
  return pairs
}
