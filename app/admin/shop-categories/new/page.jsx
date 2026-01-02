'use client'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import PageTitle from '@/components/PageTitle'

export default function NewCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [form, setForm] = useState({
    title: '',
    image: '',
    link: '/shop',
    order: 0,
    isActive: true
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageUrl(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!imageFile) {
      toast.error('Please select an image file')
      return
    }

    setLoading(true)

    try {
      // Upload image
      const formData = new FormData()
      formData.append('image', imageFile)

      const uploadRes = await axios.post('/api/store/collections/upload', formData)
      
      if (!uploadRes.data.url) {
        throw new Error('No image URL received')
      }

      // Create category
      await axios.post('/api/store/shop-categories', {
        ...form,
        image: uploadRes.data.url
      })

      toast.success('Category created successfully')
      router.push('/admin/shop-categories')
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Error creating category'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageTitle title="Add Shop Category" />

      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/shop-categories" className="text-blue-600 hover:text-blue-700">
          Shop Categories
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">New Category</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Category Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              placeholder="e.g., Earrings"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Upload Category Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:border-blue-400 transition"
            />
            <p className="text-xs text-gray-500 mt-2">
              ✓ JPG, PNG, WebP (Max 5MB) {imageFile ? '✓ Selected' : ''}
            </p>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Image Preview
              </label>
              <div className="w-full max-w-md h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Link URL
            </label>
            <input
              type="text"
              name="link"
              value={form.link}
              onChange={handleInputChange}
              placeholder="/shop?category=earrings"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Display Order (0 = first)
            </label>
            <input
              type="number"
              name="order"
              value={form.order}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-900">
                Active (visible on homepage)
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !imageFile}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
            <Link
              href="/admin/shop-categories"
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
