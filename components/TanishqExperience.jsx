'use client'

import Image from 'next/image'
import Link from 'next/link'

// Using placeholder images - replace with actual images
import Image1 from '../assets/collection/floral-bloom-desktop.webp'
import Image2 from '../assets/collection/stunning-every-ear.webp'
import Image3 from '../assets/collection/wedding-gifts.jpg'

const experiences = [
  {
    id: 1,
    title: 'VISIT OUR STORE',
    image: Image1,
    link: '/find-store'
  },
  {
    id: 2,
    title: 'BOOK AN APPOINTMENT',
    image: Image2,
    link: '/book-appointment'
  },
  {
    id: 3,
    title: 'TALK TO AN EXPERT',
    image: Image3,
    link: '/contact-expert'
  },
  {
    id: 4,
    title: 'DIGI GOLD',
    image: Image1,
    link: '/digital-gold'
  },
  {
    id: 5,
    title: 'BLOGS',
    image: Image2,
    link: '/blog'
  },
  {
    id: 6,
    title: 'JEWELLERY GUIDE',
    image: Image3,
    link: '/jewellery-guide'
  }
]

export default function TanishqExperience() {
  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-2">
            Tanishq Experience
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-light">
            Find a Boutique or Book a Consultation
          </p>
        </div>

        {/* Grid Layout - 3 columns x 2 rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience) => (
            <Link
              key={experience.id}
              href={experience.link}
              className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 bg-white"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={experience.image}
                  alt={experience.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              
              {/* Title */}
              <div className="p-4 text-center bg-white">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 uppercase tracking-wide">
                  {experience.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
