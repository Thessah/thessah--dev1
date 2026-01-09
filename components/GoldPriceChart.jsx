'use client'

import { useState, useMemo } from 'react'

// Generate sample historical data (in production, fetch from API)
function generateHistoricalData(days = 30) {
  const data = []
  const now = new Date()
  const basePrice = 527 // AED per gram 24K
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Simulate price fluctuations
    const variation = (Math.random() - 0.5) * 2 // +/- 1 AED
    const price = basePrice + variation + Math.sin(i / 5) * 0.5
    
    data.push({
      date: date.toISOString().split('T')[0],
      dateObj: date,
      price: Math.round(price * 100) / 100,
      priceOunce: Math.round((price * 31.1034768) * 100) / 100
    })
  }
  
  return data
}

export default function GoldPriceChart({ karat = 24, currency = 'AED' }) {
  const [timeframe, setTimeframe] = useState('30d')
  const [hoveredPoint, setHoveredPoint] = useState(null)
  
  const historicalData = useMemo(() => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    const data = generateHistoricalData(days)
    
    // Apply karat factor
    if (karat !== 24) {
      return data.map(d => ({
        ...d,
        price: Math.round((d.price * (karat / 24)) * 100) / 100,
        priceOunce: Math.round((d.priceOunce * (karat / 24)) * 100) / 100
      }))
    }
    return data
  }, [timeframe, karat])
  
  const { min, max, range } = useMemo(() => {
    const prices = historicalData.map(d => d.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return { min, max, range: max - min }
  }, [historicalData])
  
  // Chart dimensions
  const width = 800
  const height = 300
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  
  // Generate SVG path
  const pathData = historicalData.map((d, i) => {
    const x = padding.left + (i / (historicalData.length - 1)) * chartWidth
    const y = padding.top + (1 - (d.price - min) / range) * chartHeight
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')
  
  // Area fill path
  const areaPath = pathData + 
    ` L ${padding.left + chartWidth} ${padding.top + chartHeight}` +
    ` L ${padding.left} ${padding.top + chartHeight} Z`
  
  const latestPrice = historicalData[historicalData.length - 1]
  const firstPrice = historicalData[0]
  const priceChange = latestPrice.price - firstPrice.price
  const priceChangePct = ((priceChange / firstPrice.price) * 100).toFixed(2)
  const isPositive = priceChange >= 0
  
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border bg-white">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">{karat}K Gold Price in {currency}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {currency} {hoveredPoint ? hoveredPoint.price.toLocaleString() : latestPrice.price.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">per gram</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '↑' : '↓'} {currency} {Math.abs(priceChange).toFixed(2)} ({isPositive ? '+' : ''}{priceChangePct}%)
              </span>
              <span className="text-xs text-gray-400">• {timeframe}</span>
            </div>
          </div>
          
          {/* Timeframe selector */}
          <div className="inline-flex rounded-lg border overflow-hidden">
            {['7d', '30d', '90d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-medium ${
                  timeframe === tf 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-4">
        <div className="relative overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
              const y = padding.top + (1 - fraction) * chartHeight
              const price = min + range * fraction
              return (
                <g key={fraction}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#6b7280"
                  >
                    {price.toFixed(2)}
                  </text>
                </g>
              )
            })}
            
            {/* Area fill */}
            <path
              d={areaPath}
              fill="url(#gradient)"
              opacity="0.3"
            />
            
            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Interactive points */}
            {historicalData.map((d, i) => {
              const x = padding.left + (i / (historicalData.length - 1)) * chartWidth
              const y = padding.top + (1 - (d.price - min) / range) * chartHeight
              
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={hoveredPoint === d ? '#f59e0b' : 'transparent'}
                  stroke={hoveredPoint === d ? '#fff' : 'transparent'}
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(d)}
                />
              )
            })}
            
            {/* Hover tooltip line */}
            {hoveredPoint && (() => {
              const index = historicalData.indexOf(hoveredPoint)
              const x = padding.left + (index / (historicalData.length - 1)) * chartWidth
              return (
                <>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                  />
                  <text
                    x={x}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                  >
                    {new Date(hoveredPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </text>
                </>
              )
            })()}
            
            {/* X-axis labels */}
            {historicalData.filter((_, i) => {
              const step = Math.floor(historicalData.length / 6)
              return i % step === 0 || i === historicalData.length - 1
            }).map((d, i) => {
              const index = historicalData.indexOf(d)
              const x = padding.left + (index / (historicalData.length - 1)) * chartWidth
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#9ca3af"
                >
                  {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              )
            })}
          </svg>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">High</div>
            <div className="text-sm font-semibold text-gray-900">{currency} {max.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">Low</div>
            <div className="text-sm font-semibold text-gray-900">{currency} {min.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">Per Ounce</div>
            <div className="text-sm font-semibold text-gray-900">{currency} {latestPrice.priceOunce.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
