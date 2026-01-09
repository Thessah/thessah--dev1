import { NextResponse } from 'next/server'

const OUNCE_TO_GRAM = 31.1034768

async function fetchFromGoldAPI() {
  const token = process.env.GOLDAPI_TOKEN || process.env.NEXT_PUBLIC_GOLDAPI_TOKEN
  if (!token) return null
  try {
    const res = await fetch('https://www.goldapi.io/api/XAU/INR', {
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
  const fallback24 = 7000 // INR per gram 24K (example fallback)
  const fallback22 = Math.round(fallback24 * (22 / 24))
  return NextResponse.json({
    success: true,
    rates: { perGram24K: fallback24, perGram22K: fallback22 },
    lastUpdated: now,
    disclaimer: 'Live provider not configured. Showing indicative fallback rates.'
  }, { status: 200 })
}
import { NextResponse } from 'next/server'

// Simple gold rate endpoint with safe fallback.
// Supports future providers via env vars without exposing keys client-side.
// Env (optional):
// - GOLD_RATE_PROVIDER = 'goldapi' | 'metalsapi'
// - GOLD_API_KEY = '<provider-key>'
// - GOLD_BASE_CURRENCY = 'INR' (default)

export async function GET() {
  const baseCurrency = process.env.GOLD_BASE_CURRENCY || 'INR'
  const provider = (process.env.GOLD_RATE_PROVIDER || '').toLowerCase()
  const apiKey = process.env.GOLD_API_KEY

  // Helper to format a consistent response
  const makeResponse = ({ source, rates, disclaimer, raw }) => (
    NextResponse.json({
      success: true,
      baseCurrency,
      rates, // { perGram24K, perGram22K }
      lastUpdated: new Date().toISOString(),
      source,
      disclaimer,
      raw: raw || null
    })
  )

  // Fallback safe static (admin can wire provider later)
  const fallback = () => makeResponse({
    source: 'static-fallback',
    rates: {
      perGram24K: 6400, // INR/gram (approx placeholder)
      perGram22K: Math.round(6400 * 0.916),
    },
    disclaimer: 'Indicative rates for display. Configure provider for live prices.'
  })

  try {
    if (!provider || !apiKey) return fallback()

    // NOTE: We intentionally avoid documenting/vendor-locking exact URLs.
    // You can wire a real provider here safely using server-side key.
    if (provider === 'goldapi') {
      // Example (pseudo): fetch 24K per gram in base currency.
      // const res = await fetch(`https://example.goldapi.io/v1/gold/${baseCurrency}/gram`, { headers: { 'x-access-token': apiKey } })
      // const data = await res.json()
      // const perGram24K = data?.price_24k
      // const perGram22K = Math.round(perGram24K * 0.916)
      // return makeResponse({ source: 'goldapi', rates: { perGram24K, perGram22K }, disclaimer: data?.disclaimer, raw: data })
      return fallback()
    }

    if (provider === 'metalsapi') {
      // Example flow: get XAU in base currency, convert troy ounce -> gram, then purity factors.
      // Fallback until wired.
      return fallback()
    }

    return fallback()
  } catch (err) {
    return fallback()
  }
}
