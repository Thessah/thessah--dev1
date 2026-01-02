'use client'

import Image from 'next/image'
import Link from 'next/link'

// Using placeholder images - replace with actual images
import Image1 from '../assets/collection/floral-bloom-desktop.webp'
import Image2 from '../assets/collection/stunning-every-ear.webp'
import Image3 from '../assets/collection/wedding-gifts.jpg'

const collections = [
  {
    id: 1,
    title: 'Wedding',
    image: Image1,
    link: '/shop?category=wedding'
  },
  {
    id: 2,
    title: 'Diamond',
    image: Image2,
    link: '/shop?category=diamond'
  },
  {
    id: 3,
    title: 'Gold',
    image: Image3,
    link: '/shop?category=gold'
  },
  {
    id: 4,
    title: 'Dailywear',
    image: Image1,
    link: '/shop?category=dailywear'
  }
]

export default function TanishqWorld() {
  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-2">
            Tanishq World
          </h2>
          <p className="text-base sm:text-lg text-gray-500 font-light">
            A companion for every occasion
          </p>
        </div>

        {/* Grid Layout - 2x2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={collection.link}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 h-[300px] sm:h-[350px] lg:h-[400px]"
            >
              {/* Background Image */}
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Title */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white drop-shadow-2xl">
                  {collection.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
