'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'

export default function ShopByCategory() {
  const [categories, setCategories] = useState([])
  const [heading, setHeading] = useState({
    title: '',
    subtitle: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, settingsRes] = await Promise.all([
          axios.get('/api/store/categories'),
          axios.get('/api/store/settings')
        ])

        // Always set heading from settings first, with fallback to defaults
        if (settingsRes.data.settings?.shopCategoriesHeading) {
          const dbHeading = settingsRes.data.settings.shopCategoriesHeading
          setHeading({
            title: dbHeading.title || 'Find Your Perfect Match',
            subtitle: dbHeading.subtitle || 'Shop by Categories'
          })
        } else {
          // Fallback defaults if no settings found
          setHeading({
            title: 'Find Your Perfect Match',
            subtitle: 'Shop by Categories'
          })
        }

        // Get categories and filter by selected IDs
        if (categoriesRes.data.categories && categoriesRes.data.categories.length > 0) {
          const allCategories = categoriesRes.data.categories
          const displaySettings = settingsRes.data.settings?.shopCategoriesDisplay
          
          if (displaySettings?.selectedIds && displaySettings.selectedIds.length > 0) {
            // Filter to show only selected categories
            const selectedCategories = allCategories.filter(cat => 
              displaySettings.selectedIds.includes(cat._id.toString())
            )
            
            // Map to the format expected by the component
            const displayCategories = selectedCategories.map(cat => ({
              _id: cat._id,
              title: cat.name,
              image: cat.image,
              link: `/category/${cat.slug || cat._id}`,
              isActive: true
            }))
            
            setCategories(displayCategories.slice(0, 7))
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
    
    // Poll every 10 seconds for updates
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])
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

        {/* Category Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category._id || category.id}
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
                    <div className="aspect-square relative bg-gray-200">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
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
            
            {/* Add View All Card if we have categories */}
            <Link
              href="/browse-history"
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500"
            >
              <div className="aspect-square bg-gradient-to-br from-amber-50 to-amber-100 flex flex-col items-center justify-center p-6">
                <p className="text-5xl sm:text-6xl font-bold text-amber-800 mb-2">10+</p>
                <p className="text-sm text-gray-600 mb-4">Categories to chose from</p>
                <p className="text-base font-semibold text-gray-900 uppercase tracking-wide">VIEW ALL</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories available</p>
          </div>
        )}
      </div>
    </section>
  )
}
