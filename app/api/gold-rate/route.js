import { NextResponse } from 'next/server'

const OUNCE_TO_GRAM = 31.1034768

async function fetchFromGoldAPI() {
  const token = process.env.GOLDAPI_TOKEN || process.env.NEXT_PUBLIC_GOLDAPI_TOKEN
  if (!token) return null
  try {
    const res = await fetch('https://www.goldapi.io/api/XAU/AED', {
      headers: { 'x-access-token': token, 'Accept': 'application/json' },
      // Avoid caching for fresh rates
      cache: 'no-store'
    })
    if (!res.ok) return null
    const data = await res.json()
    // goldapi returns price per troy ounce in target currency
    const perOunce = Number(data?.price)
    if (!perOunce || Number.isNaN(perOunce)) return null
    const perGram24K = perOunce / OUNCE_TO_GRAM
    const perGram22K = perGram24K * (22 / 24)
    return {
      perGram24K: Math.round(perGram24K),
      perGram22K: Math.round(perGram22K),
      source: 'goldapi.io'
    }
  } catch {
    return null
  }
}

export async function GET() {
  // Try live provider, fallback to static hint
  const live = await fetchFromGoldAPI()
  const now = new Date().toISOString()

  if (live) {
    return NextResponse.json({
      success: true,
      rates: { perGram24K: live.perGram24K, perGram22K: live.perGram22K },
      lastUpdated: now,
      disclaimer: 'Indicative rates. Actual buying price may vary with taxes, making charges and stones.'
    }, { status: 200 })
  }

  // Fallback: conservative default numbers to avoid breaking UI
  const fallback24 = 275 // AED per gram 24K (example fallback)
  const fallback22 = Math.round(fallback24 * (22 / 24))
  return NextResponse.json({
    success: true,
    rates: { perGram24K: fallback24, perGram22K: fallback22 },
    lastUpdated: now,
    disclaimer: 'Live provider not configured. Showing indicative AED fallback rates.'
  }, { status: 200 })
}
