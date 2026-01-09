'use client'

import { useEffect, useMemo, useState } from 'react'

// A modern, self-contained live gold rate card with an inline calculator.
export default function GoldRateWidget({ weightGrams, purityKarat = 22, currency = '₹', showCalculator = true }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rates, setRates] = useState(null)

  // Local calculator state (uses props as initial values)
  const [purity, setPurity] = useState(purityKarat >= 24 ? 24 : 22)
  const [grams, setGrams] = useState(typeof weightGrams === 'number' || typeof weightGrams === 'string' ? String(weightGrams) : '')

  const loadRates = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/gold-rate', { cache: 'no-store' })
      const data = await res.json()
      if (!data?.success) throw new Error('Failed to load rates')
      setRates(data)
    } catch (e) {
      setError('Unable to fetch live rates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRates()
  }, [])

  const perGram = useMemo(() => {
    if (!rates?.rates) return null
    return purity >= 24 ? rates.rates.perGram24K : rates.rates.perGram22K
  }, [rates, purity])

  const estValue = useMemo(() => {
    if (!perGram) return null
    const g = grams !== '' ? Number(grams) : undefined
    if (!g || Number.isNaN(g)) return null
    return perGram * g
  }, [perGram, grams])

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-200 animate-pulse" />
          <span className="font-semibold">Live Gold Rate</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {!loading && rates?.lastUpdated && (
            <span className="text-white/90">Updated {new Date(rates.lastUpdated).toLocaleTimeString()}</span>
          )}
          <button
            onClick={loadRates}
            className="rounded-full bg-white/15 hover:bg-white/25 px-2 py-1 transition"
            title="Refresh"
            aria-label="Refresh rates"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 md:p-5">
        {loading ? (
          <div className="text-sm text-gray-500">Fetching rates…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <div className="space-y-4">
            {/* Rate tiles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-gray-50 p-3">
                <div className="text-[11px] text-gray-500 mb-0.5">24K per gram</div>
                <div className="text-lg font-semibold text-gray-900">{currency} {rates.rates.perGram24K?.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border bg-gray-50 p-3">
                <div className="text-[11px] text-gray-500 mb-0.5">22K per gram</div>
                <div className="text-lg font-semibold text-gray-900">{currency} {rates.rates.perGram22K?.toLocaleString()}</div>
              </div>
            </div>

            {/* Calculator */}
            {showCalculator && (
              <div className="rounded-xl border p-3 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Estimate Calculator</h3>
                  <div className="inline-flex rounded-lg border overflow-hidden">
                    {[24, 22].map((k) => (
                      <button
                        key={k}
                        onClick={() => setPurity(k)}
                        className={`px-3 py-1.5 text-sm ${purity===k? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        aria-pressed={purity===k}
                      >
                        {k}K
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Weight (grams)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      placeholder="e.g. 7.250"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Per gram ({purity}K)</label>
                    <div className="h-[38px] flex items-center justify-between px-3 border rounded-lg bg-gray-50 text-sm">
                      <span className="text-gray-500">Rate</span>
                      <span className="font-semibold text-gray-900">{perGram ? `${currency} ${perGram.toLocaleString()}` : '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {[1, 5, 10, 20].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGrams(String(g))}
                      className="px-3 py-1.5 text-xs border rounded-full hover:bg-gray-50"
                    >
                      {g}g
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3">
                  <div className="text-xs text-amber-800">Estimated Metal Value</div>
                  <div className="text-2xl font-semibold text-amber-900">{estValue ? `${currency} ${estValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}</div>
                  <p className="text-[11px] text-amber-800/80 mt-1">Guidance only. Final price includes making, stones and taxes.</p>
                </div>
              </div>
            )}

            {rates?.disclaimer && (
              <p className="text-[11px] text-gray-500">{rates.disclaimer}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
