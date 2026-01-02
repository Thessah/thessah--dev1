'use client'

import { useEffect, useState } from 'react'

export default function GoldRateWidget({ weightGrams, purityKarat = 22, currency = '₹' }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rates, setRates] = useState(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/gold-rate', { cache: 'no-store' })
        const data = await res.json()
        if (!alive) return
        if (!data?.success) throw new Error('Failed to load rates')
        setRates(data)
      } catch (e) {
        if (!alive) return
        setError('Unable to fetch live rates')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  const perGram = (() => {
    if (!rates?.rates) return null
    return purityKarat >= 24 ? rates.rates.perGram24K : rates.rates.perGram22K
  })()

  const estValue = (() => {
    if (!perGram || !weightGrams) return null
    return perGram * Number(weightGrams)
  })()

  return (
    <div className="border rounded-lg p-3 md:p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-semibold text-gray-900">Live Gold Rate</span>
        </div>
        {!loading && rates?.lastUpdated && (
          <span className="text-xs text-gray-500">Updated {new Date(rates.lastUpdated).toLocaleTimeString()}</span>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Fetching rates…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between bg-gray-50 rounded px-2 py-1.5">
              <span className="text-gray-600">24K / gm</span>
              <span className="font-semibold text-gray-900">{currency} {rates.rates.perGram24K?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded px-2 py-1.5">
              <span className="text-gray-600">22K / gm</span>
              <span className="font-semibold text-gray-900">{currency} {rates.rates.perGram22K?.toLocaleString()}</span>
            </div>
          </div>

          {weightGrams ? (
            <div className="mt-2 border-t pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Est. Metal Value ({purityKarat}K · {weightGrams}g)</span>
                <span className="font-semibold text-gray-900">{currency} {estValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">For reference only. Final price includes making, stones and taxes.</p>
            </div>
          ) : null}

          {rates?.disclaimer && (
            <p className="text-[11px] text-gray-400 mt-1">{rates.disclaimer}</p>
          )}
        </div>
      )}
    </div>
  )
}
