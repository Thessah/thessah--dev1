'use client'

import Image from 'next/image'
import Link from 'next/link'

// Using placeholder images - replace with actual category images
import Image1 from '../assets/collection/floral-bloom-desktop.webp'
import Image2 from '../assets/collection/stunning-every-ear.webp'
import Image3 from '../assets/collection/wedding-gifts.jpg'

const categories = [
  {
    id: 1,
    title: 'EARRINGS',
    image: Image1,
    link: '/shop?category=earrings'
  },
  {
    id: 2,
    title: 'FINGER RINGS',
    image: Image2,
    link: '/shop?category=rings'
  },
  {
    id: 3,
    title: 'PENDANTS',
    image: Image3,
    link: '/shop?category=pendants'
  },
  {
    id: 4,
    title: 'MANGALSUTRA',
    image: Image1,
    link: '/shop?category=mangalsutra'
  },
  {
    id: 5,
    title: 'BRACELETS',
    image: Image2,
    link: '/shop?category=bracelets'
  },
  {
    id: 6,
    title: 'BANGLES',
    image: Image3,
    link: '/shop?category=bangles'
  },
  {
    id: 7,
    title: 'CHAINS',
    image: Image1,
    link: '/shop?category=chains'
  },
  {
    id: 8,
    title: 'VIEW ALL',
    image: null,
    link: '/categories',
    isViewAll: true
  }
]

export default function ShopByCategory() {
  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-2">
            Find Your Perfect Match
          </h2>
          <p className="text-base sm:text-lg text-gray-500 font-light">
            Shop by Categories
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.link}
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500"
            >
              {category.isViewAll ? (
                // View All Card
                <div className="aspect-square bg-gradient-to-br from-amber-50 to-amber-100 flex flex-col items-center justify-center p-6">
                  <div className="text-center">
                    <p className="text-5xl sm:text-6xl font-bold text-amber-800 mb-2">10+</p>
                    <p className="text-sm text-gray-600 mb-1">Categories to chose from</p>
                  </div>
                  <p className="mt-4 text-base font-semibold text-gray-900 uppercase tracking-wide">
                    {category.title}
                  </p>
                </div>
              ) : (
                // Regular Category Card
                <>
                  <div className="aspect-square relative">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-sm sm:text-base font-semibold text-white uppercase tracking-wide">
                      {category.title}
                    </h3>
                  </div>
                </>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
