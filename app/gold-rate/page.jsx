'use client'

import { useState } from 'react'
import GoldRateWidget from '@/components/GoldRateWidget'
import Link from 'next/link'

export default function GoldRatePage() {
  const [grams, setGrams] = useState('')
  const [karat, setKarat] = useState(22)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1">
          <li><Link href="/" className="hover:text-gray-900">Home</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium" aria-current="page">Gold Rate</li>
        </ol>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">Live Gold Rate</h1>
      <p className="text-sm text-gray-600 mb-6">Check the latest indicative gold rate per gram and estimate the metal value based on weight and purity.</p>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <GoldRateWidget weightGrams={grams ? Number(grams) : undefined} purityKarat={karat} />

        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Estimate Calculator</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Purity</label>
              <div className="flex gap-2">
                {[24,22].map(v => (
                  <button
                    key={v}
                    onClick={() => setKarat(v)}
                    className={`px-3 py-1.5 rounded border text-sm ${karat===v? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {v}K
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Weight (grams)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                placeholder="e.g. 5.250"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-gray-500">This is a guidance-only estimate. Final invoice includes making charges, stones and taxes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
