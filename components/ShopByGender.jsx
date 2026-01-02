'use client'

import Image from 'next/image'
import Link from 'next/link'

// Using placeholder images - replace with actual images
import Image1 from '../assets/collection/floral-bloom-desktop.webp'
import Image2 from '../assets/collection/stunning-every-ear.webp'
import Image3 from '../assets/collection/wedding-gifts.jpg'

const genderCategories = [
  {
    id: 1,
    title: 'Women Jewellery',
    image: Image1,
    link: '/shop?gender=women'
  },
  {
    id: 2,
    title: 'Men Jewellery',
    image: Image2,
    link: '/shop?gender=men'
  },
  {
    id: 3,
    title: 'Kids Jewellery',
    image: Image3,
    link: '/shop?gender=kids'
  }
]

export default function ShopByGender() {
  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-2">
            Curated For You
          </h2>
          <p className="text-base sm:text-lg text-gray-500 font-light">
            Shop By Gender
          </p>
        </div>

        {/* Three Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {genderCategories.map((category) => (
            <Link
              key={category.id}
              href={category.link}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Background Image */}
              <div className="aspect-[3/4] relative">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              
              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <h3 className="text-xl sm:text-2xl font-serif text-white drop-shadow-lg">
                  {category.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
