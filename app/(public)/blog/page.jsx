'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Using placeholder images
import Image1 from '../../../assets/collection/floral-bloom-desktop.webp'
import Image2 from '../../../assets/collection/stunning-every-ear.webp'
import Image3 from '../../../assets/collection/wedding-gifts.jpg'

const featuredPosts = [
  {
    id: 1,
    title: 'The Ultimate Guide to Wedding Jewelry',
    excerpt: 'Discover the perfect pieces for your special day',
    image: Image1,
    category: 'Wedding',
    date: 'Dec 15, 2025'
  },
  {
    id: 2,
    title: 'Diamond Care Tips: Keep Your Jewelry Sparkling',
    excerpt: 'Expert advice on maintaining your precious diamonds',
    image: Image2,
    category: 'Care Guide',
    date: 'Dec 10, 2025'
  },
  {
    id: 3,
    title: 'Trending Jewelry Styles for 2025',
    excerpt: 'Stay ahead with the latest jewelry fashion trends',
    image: Image3,
    category: 'Trends',
    date: 'Dec 5, 2025'
  }
]

const blogPosts = [
  {
    id: 4,
    title: 'How to Choose the Perfect Engagement Ring',
    excerpt: 'A comprehensive guide to selecting the ring that symbolizes your love',
    image: Image1,
    category: 'Engagement',
    date: 'Nov 28, 2025',
    author: 'Tanishq Expert'
  },
  {
    id: 5,
    title: 'Gold vs Diamond: Which Investment is Better?',
    excerpt: 'Compare the pros and cons of investing in gold and diamonds',
    image: Image2,
    category: 'Investment',
    date: 'Nov 25, 2025',
    author: 'Financial Advisor'
  },
  {
    id: 6,
    title: 'Traditional Indian Jewelry: Heritage and Beauty',
    excerpt: 'Explore the rich history and cultural significance of Indian jewelry',
    image: Image3,
    category: 'Culture',
    date: 'Nov 20, 2025',
    author: 'Heritage Expert'
  },
  {
    id: 7,
    title: 'Styling Tips: Layering Your Necklaces',
    excerpt: 'Master the art of necklace layering for a trendy look',
    image: Image1,
    category: 'Style',
    date: 'Nov 15, 2025',
    author: 'Fashion Stylist'
  },
  {
    id: 8,
    title: 'Birthstone Guide: Find Your Perfect Gem',
    excerpt: 'Discover the meaning and beauty of each month\'s birthstone',
    image: Image2,
    category: 'Gemstones',
    date: 'Nov 10, 2025',
    author: 'Gemologist'
  },
  {
    id: 9,
    title: 'Jewelry for Every Occasion: A Complete Guide',
    excerpt: 'Choose the right jewelry to complement any event or celebration',
    image: Image3,
    category: 'Guide',
    date: 'Nov 5, 2025',
    author: 'Style Expert'
  }
]

export default function BlogPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredPosts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-white">
      {/* Full Width Hero Slider */}
      <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden bg-gray-900">
        {/* Slides */}
        <div 
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {featuredPosts.map((post, index) => (
            <div key={post.id} className="flex-shrink-0 w-full h-full relative">
              <Image
                src={post.image}
                alt={post.title}
                fill
                priority={index === 0}
                className="object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    <span className="inline-block px-4 py-1.5 bg-amber-600 text-white text-xs font-semibold uppercase tracking-wide mb-4 rounded">
                      {post.category}
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-6xl font-serif text-white mb-4 drop-shadow-2xl">
                      {post.title}
                    </h1>
                    <p className="text-base sm:text-lg text-white/90 mb-6">
                      {post.excerpt}
                    </p>
                    <Link
                      href={`/blog/${post.id}`}
                      className="inline-block bg-white text-gray-900 px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-gray-100 transition-colors rounded shadow-xl"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 z-20">
          {featuredPosts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all ${
                index === currentSlide
                  ? 'w-10 sm:w-12 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Blog Posts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-4">
            Latest Articles
          </h2>
          <p className="text-lg text-gray-600">
            Expert insights, trends, and guides on jewelry
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
            >
              {/* Image */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3 text-sm">
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 font-semibold rounded-full text-xs uppercase">
                    {post.category}
                  </span>
                  <span className="text-gray-500">{post.date}</span>
                </div>
                <h3 className="text-xl font-serif text-gray-900 mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">By {post.author}</span>
                  <span className="text-amber-700 font-semibold text-sm group-hover:underline">
                    Read More →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
