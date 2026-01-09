'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { useSelector } from 'react-redux'
import ProductCard from '@/components/ProductCard'

const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export default function CategoryPage() {
  const params = useParams()
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || ''
  const normalizedSlug = decodeURIComponent(slug).toLowerCase()
  const products = useSelector((state) => state.product.list || [])
  const [categoryTitle, setCategoryTitle] = useState('')

  useEffect(() => {
    const fetchCategoryName = async () => {
      try {
        const res = await axios.get('/api/store/categories')
        const cats = Array.isArray(res.data?.categories) ? res.data.categories : []
        const match = cats.find((c) =>
          (c.slug && c.slug.toLowerCase() === normalizedSlug) ||
          slugify(c.name) === normalizedSlug
        )
        if (match?.name) {
          setCategoryTitle(match.name)
          return
        }
      } catch (e) {
        // silent fail; fall back to slug formatting
      }
      // Fallback: prettify slug
      const pretty = normalizedSlug
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ')
      setCategoryTitle(pretty || 'Category')
    }

    fetchCategoryName()
  }, [normalizedSlug])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const cat = (p.category || '').toLowerCase()
      const catSlug = slugify(p.category || '')
      const altSlug = (p.categorySlug || '').toLowerCase()
      return (
        cat === normalizedSlug ||
        catSlug === normalizedSlug ||
        altSlug === normalizedSlug
      )
    })
  }, [products, normalizedSlug])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1">
          <li>
            <Link href="/" className="hover:text-gray-900">Home</Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium" aria-current="page">{categoryTitle || 'Category'}</li>
        </ol>
      </nav>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{categoryTitle}</h1>
          <p className="text-sm text-gray-500">{filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-600">
          No products found in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
