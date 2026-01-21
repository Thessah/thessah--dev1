'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { useSelector } from 'react-redux'
import ProductCard from '@/components/ProductCard'
import { FilterIcon, XIcon } from 'lucide-react'

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
  const [fetchedProducts, setFetchedProducts] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ priceRange: [0, 100000], categories: [] })
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const fetchCategoryNameAndProducts = async () => {
      try {
        setLoading(true)
        // Fetch category name
        const res = await axios.get('/api/store/categories')
        const cats = Array.isArray(res.data?.categories) ? res.data.categories : []
        const match = cats.find((c) =>
          (c.slug && c.slug.toLowerCase() === normalizedSlug) ||
          slugify(c.name) === normalizedSlug
        )
        if (match?.name) {
          setCategoryTitle(match.name)
        } else {
          // Fallback: prettify slug
          const pretty = normalizedSlug
            .split('-')
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join(' ')
          setCategoryTitle(pretty || 'Category')
        }
        // Fetch products for this category directly from API
        const prodRes = await axios.get(`/api/products?category=${encodeURIComponent(match?.name || normalizedSlug)}`)
        setFetchedProducts(Array.isArray(prodRes.data?.products) ? prodRes.data.products : [])
      } catch (e) {
        setFetchedProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchCategoryNameAndProducts()
  }, [normalizedSlug])

  // Prefer fetchedProducts if available, else fallback to Redux filtered
  const filteredProducts = useMemo(() => {
    let products = Array.isArray(fetchedProducts) ? fetchedProducts : 
      products && Array.isArray(products) ? products.filter((p) => {
        const normalize = (val) => (val || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const catSlug = normalize(p.category);
        const altSlug = normalize(p.categorySlug);
        const catName = (p.category || '').toString().trim().toLowerCase();
        return (
          catSlug === normalizedSlug ||
          altSlug === normalizedSlug ||
          catName === normalizedSlug.replace(/-/g, ' ')
        );
      }) : [];
    
    // Apply filters
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
      products = products.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      default:
        products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return products;
  }, [products, normalizedSlug, fetchedProducts, filters, sortBy])

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

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900">{categoryTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b">
        {/* Filter Toggle */}
        <button
          onClick={() => {}}
          className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
        >
          <FilterIcon size={18} />
          Filter
        </button>

        {/* Price Filter Chip */}
        {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, 100000] }))}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            <span>₹{filters.priceRange[0].toLocaleString('en-IN')} - ₹{filters.priceRange[1].toLocaleString('en-IN')}</span>
            <XIcon size={14} />
          </button>
        )}

        {/* Sort Dropdown */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
          >
            <option value="newest">Best Matches</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-600">Loading…</div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-600">
          No products found in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
