'use client'

import Image from 'next/image'
import Link from 'next/link'
import Image1 from '../assets/collection/floral-bloom-desktop.webp'
import Image2 from '../assets/collection/stunning-every-ear.webp'
import Image3 from '../assets/collection/wedding-gifts.jpg'

const collections = [
  {
    id: 1,
    title: 'Floral Bloom',
    image: Image1, // Replace with your image path
    link: '/shop?collection=floral-bloom',
    size: 'large'
  },
  {
    id: 2,
    title: 'Stunning',
    subtitle: 'every Ear',
    image: Image2, // Replace with your image path
    link: '/shop?category=earrings',
    size: 'small'
  },
  {
    id: 3,
    title: 'Wedding Gifts',
    image: Image3, // Replace with your image path
    link: '/shop?category=wedding',
    size: 'small'
  }
]

export default function CollectionsShowcase() {
  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-2">
            Tanishq Collections
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-light">
            Explore our newly launched collection
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Large Card - Left */}
          <Link
            href={collections[0].link}
            className="group relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
          >
            <Image
              src={collections[0].image}
              alt={collections[0].title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white drop-shadow-lg">
                {collections[0].title}
              </h3>
            </div>
          </Link>

          {/* Small Cards - Right */}
          <div className="grid grid-rows-2 gap-4 sm:gap-6">
            {/* Top Small Card */}
            <Link
              href={collections[1].link}
              className="group relative h-[200px] sm:h-[240px] lg:h-[294px] overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <Image
                src={collections[1].image}
                alt={collections[1].title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-6 right-6 text-right">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white drop-shadow-lg">
                  {collections[1].title}
                </h3>
                {collections[1].subtitle && (
                  <p className="text-xl sm:text-2xl lg:text-3xl font-serif text-white/90 italic drop-shadow-lg">
                    {collections[1].subtitle}
                  </p>
                )}
              </div>
            </Link>

            {/* Bottom Small Card */}
            <Link
              href={collections[2].link}
              className="group relative h-[200px] sm:h-[240px] lg:h-[294px] overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <Image
                src={collections[2].image}
                alt={collections[2].title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-6 right-6 text-right">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white drop-shadow-lg">
                  {collections[2].title}
                </h3>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
