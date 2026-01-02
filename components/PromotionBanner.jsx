'use client'

import Link from 'next/link'

export default function PromotionBanner() {
  return (
    <section className="w-full bg-amber-50 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Section - Gift of Choice */}
          <div className="flex flex-col justify-center">
            {/* Decorative Cross Icon */}
            <div className="mb-8">
              <div className="relative w-20 h-20">
                {/* Vertical bar */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-20 bg-red-600"></div>
                </div>
                {/* Horizontal bar */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-20 bg-red-600"></div>
                </div>
                {/* Center circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-red-600 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-4xl sm:text-5xl font-serif text-red-600 mb-4">
              #GiftOfChoice
            </h3>
            <p className="text-gray-700 text-sm mb-2">
              Breathtaking gifts for your loved one's
            </p>
            <p className="text-lg font-bold text-red-600 mb-8">
              STARTING AT ₹10,000
            </p>
            <div>
              <Link
                href="/shop?collection=gifts"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-600 hover:text-white transition-all duration-300 rounded-full text-sm"
              >
                Explore Now
                <span>›</span>
              </Link>
            </div>
          </div>

          {/* Right Section - Exchange Gold */}
          <div className="flex flex-col justify-center">
            {/* Branding */}
            <p className="text-amber-500 text-xs font-semibold tracking-widest mb-6">
              TANISHQ
            </p>

            {/* Main Heading */}
            <h2 className="text-4xl sm:text-5xl font-serif text-gray-900 mb-3 leading-tight">
              Exchange your Old Gold
            </h2>
            
            {/* Red accent text */}
            <p className="text-2xl sm:text-3xl font-serif text-red-600 mb-6">
              for 100% Value!
            </p>

            {/* Descriptive text */}
            <div className="mb-8">
              <p className="text-blue-600 text-sm mb-1">
                Unlock full value for your old gold today with
              </p>
              <p className="text-gray-900 font-semibold">
                our Exchange Program!
              </p>
            </div>

            {/* CTA Button */}
            <div>
              <Link
                href="/exchange-gold"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-amber-500 text-amber-500 font-semibold hover:bg-amber-500 hover:text-white transition-all duration-300 rounded-full text-sm"
              >
                Know more
                <span>›</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
