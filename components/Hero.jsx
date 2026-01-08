'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

export default function Hero() {
  const [slides, setSlides] = useState([])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentTranslate, setCurrentTranslate] = useState(0)
  const [prevTranslate, setPrevTranslate] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)

  // Fetch banners from store API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        console.log('Fetching banners from /api/store/hero-banners...');
        const res = await axios.get('/api/store/hero-banners')
        console.log('Banners response:', res.data);
        
        if (res.data.banners && res.data.banners.length > 0) {
          // Filter only active banners
          const activeBanners = res.data.banners.filter(b => b.isActive !== false)
          console.log('Active banners:', activeBanners.length);
          
          if (activeBanners.length > 0) {
            // Convert database banners to slides format
            const dbSlides = activeBanners.map(banner => ({
              image: banner.image || '',
              mobileImage: banner.mobileImage || banner.image || '',
              badge: banner.badge || '',
              subtitle: banner.subtitle || '',
              title: banner.title || '',
              description: banner.description || '',
              cta: banner.cta || '',
              link: banner.link || '/shop',
              showTitle: banner.showTitle !== undefined ? banner.showTitle : true,
              showSubtitle: banner.showSubtitle !== undefined ? banner.showSubtitle : true,
              showBadge: banner.showBadge !== undefined ? banner.showBadge : true,
              showButton: banner.showButton !== undefined ? banner.showButton : true
            }))
            console.log('Slides loaded:', dbSlides.length);
            setSlides(dbSlides)
          }
        } else {
          console.log('No banners found, slides will be empty');
        }
      } catch (error) {
        console.error('Error fetching banners:', error)
        // If no banners available, slides will remain empty
      }
    }
    fetchBanners()
  }, [])

  // Handle infinite loop reset
  useEffect(() => {
    if (index === slides.length) {
      setTimeout(() => {
        setIsTransitioning(false)
        setIndex(0)
      }, 700)
      setTimeout(() => setIsTransitioning(true), 750)
    } else if (index === -1) {
      setTimeout(() => {
        setIsTransitioning(false)
        setIndex(slides.length - 1)
      }, 700)
      setTimeout(() => setIsTransitioning(true), 750)
    }
  }, [index])

  const prev = () => {
    setPaused(true)
    setIndex((i) => i - 1)
    setTimeout(() => setPaused(false), 8000)
  }

  const next = () => {
    setPaused(true)
    setIndex((i) => i + 1)
    setTimeout(() => setPaused(false), 8000)
  }

  const handleDragStart = (e) => {
    setIsDragging(true)
    setPaused(true)
    setStartX(e.type.includes('mouse') ? e.pageX : e.touches[0].clientX)
  }

  const handleDragMove = (e) => {
    if (!isDragging) return
    const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX
    const diff = currentPosition - startX
    setCurrentTranslate(prevTranslate + diff)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    const movedBy = currentTranslate - prevTranslate
    
    if (movedBy < -100) {
      setIndex((i) => i + 1)
    } else if (movedBy > 100) {
      setIndex((i) => i - 1)
    }
    
    setCurrentTranslate(0)
    setPrevTranslate(0)
    setTimeout(() => setPaused(false), 8000)
  }

  // Create infinite loop array
  const infiniteSlides = [...slides.slice(-1), ...slides, ...slides.slice(0, 1)]
  const actualIndex = index + 1

  // Don't render if no slides
  if (slides.length === 0) {
    return null
  }

  return (
    <section className="relative w-full bg-white py-6 sm:py-8">
      {/* Carousel Container with Peek Effect */}
      <div className="relative h-[420px] sm:h-[520px] lg:h-[620px] overflow-hidden px-4 sm:px-8">
        {/* Slides Track */}
        <div
          className="flex items-center h-full gap-4 ease-out cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(calc(-${actualIndex * 100}% - ${actualIndex * 16}px + ${currentTranslate}px))`,
            transition: isDragging || !isTransitioning ? 'none' : 'transform 700ms'
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {infiniteSlides.map((slide, i) => (
            <div
              key={i}
              className="flex-shrink-0 h-full"
              style={{ width: '100%' }}
            >
              {/* Main Slide Container - Full View with Rounded Corners */}
              <div className="relative w-full h-full overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl">
                {/* Background image - Fills space */}
                {/* Desktop image - hidden on mobile */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={i === 0}
                  className="object-cover hidden sm:block"
                  sizes="(max-width: 768px) 0vw, 85vw"
                />
                {/* Mobile image - shown on mobile only */}
                <Image
                  src={slide.mobileImage}
                  alt={slide.title}
                  fill
                  priority={i === 0}
                  className="object-cover sm:hidden"
                  sizes="(max-width: 768px) 92vw, 0vw"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="px-6 sm:px-12 lg:px-20 max-w-2xl text-white">
                    {slide.showBadge && slide.badge && slide.badge.trim() && (
                      <span className="inline-block mb-4 px-4 py-1.5 border border-white/60 rounded-full text-xs tracking-wide bg-white/10 backdrop-blur">
                        {slide.badge}
                      </span>
                    )}

                    {slide.showSubtitle && slide.subtitle && slide.subtitle.trim() && (
                      <p className="text-sm sm:text-lg mb-2 tracking-wide text-white/90">
                        {slide.subtitle}
                      </p>
                    )}

                    {slide.showTitle && slide.title && slide.title.trim() && (
                      <h1 className="text-3xl sm:text-4xl lg:text-6xl font-serif font-bold mb-4 drop-shadow-2xl">
                        {slide.title}
                      </h1>
                    )}

                    {slide.description && slide.description.trim() && (
                      <p className="text-sm sm:text-base lg:text-lg text-white/85 mb-6 max-w-xl">
                        {slide.description}
                      </p>
                    )}

                    {slide.showButton && slide.cta && slide.cta.trim() && slide.link && (
                      <Link
                        href={slide.link}
                        onClick={() => setPaused(true)}
                        className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:scale-105 shadow-xl rounded"
                      >
                        {slide.cta}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 rounded-full p-3 sm:p-3.5 shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 rounded-full p-3 sm:p-3.5 shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setPaused(true)
                setIndex(i)
                setTimeout(() => setPaused(false), 8000)
              }}
              className={`rounded-full transition-all ${
                i === (index < 0 ? slides.length - 1 : index >= slides.length ? 0 : index)
                  ? 'w-10 sm:w-12 h-1.5 bg-red-600'
                  : 'w-1.5 h-1.5 bg-gray-400 hover:bg-gray-600'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Collections heading */}
      {/* <div className="py-8 bg-white text-center">
        <div className="flex justify-center mb-2 text-red-600">♦</div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif">
          Tanishq Collections
        </h2>
      </div> */}
    </section>
  )
}
