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
