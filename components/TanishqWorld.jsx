'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import axios from 'axios'

export default function TanishqWorld() {
  const [heading, setHeading] = useState({
    title: 'Tanishq World',
    subtitle: 'A companion for every occasion'
  })
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const settingsRes = await axios.get('/api/store/settings')
      console.log('🔍 Full settings response:', settingsRes.data.settings)

      // Load heading
      const dbHeading = settingsRes.data.settings?.section4Heading
      if (dbHeading) {
        setHeading({
          title: dbHeading.title || 'Tanishq World',
          subtitle: dbHeading.subtitle || 'A companion for every occasion'
        })
      }

      // Load collections
      if (settingsRes.data.settings?.section4Collections) {
        const dbCollections = settingsRes.data.settings.section4Collections
        console.log('📦 Collections from DB:', dbCollections)
        // Filter out empty collections (must have at least title and image)
        const validCollections = dbCollections.filter(col => col.title && col.image)
        console.log('✅ Valid collections:', validCollections)
        setCollections(validCollections)
      } else {
        console.log('❌ No section4Collections in settings')
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching section 4 data:', error)
      setLoading(false)
    }
  }

  console.log('Current state - collections:', collections, 'loading:', loading)

  if (collections.length === 0 && !loading) {
    console.log('⚠️ Not rendering - no valid collections')
    return null // Don't render if no collections selected
  }

  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-2">
            {heading.title}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 font-light">
            {heading.subtitle}
          </p>
        </div>

        {/* Grid Layout - 2x2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {collections.map((collection, index) => (
            <Link
              key={index}
              href={collection.link || '#'}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 h-[300px] sm:h-[350px] lg:h-[400px]"
            >
              {/* Background Image */}
              {collection.image && (
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              )}
              
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
