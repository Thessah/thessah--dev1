'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import Image from 'next/image'

export default function HeroBannersPage() {
  const { user, isSignedIn, loading: authLoading } = useAuth()
  const router = useRouter()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [formData, setFormData] = useState({
    badge: '',
    subtitle: '',
    title: '',
    description: '',
    cta: '',
    link: '',
    image: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  // Verify admin access
  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession')
    if (!authLoading && !isSignedIn && !adminSession) {
      router.push('/store/login')
    }
  }, [authLoading, isSignedIn, router])

  // Fetch banners
  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession')
    if (!isSignedIn && !adminSession) return
    fetchBanners()
  }, [isSignedIn])

  const fetchBanners = async () => {
    try {
      const res = await axios.get('/api/admin/hero-banners')
      setBanners(res.data.banners || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast.error('Failed to fetch banners')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const formDataObj = new FormData()
      formDataObj.append('badge', formData.badge)
      formDataObj.append('subtitle', formData.subtitle)
      formDataObj.append('title', formData.title)
      formDataObj.append('description', formData.description)
      formDataObj.append('cta', formData.cta)
      formDataObj.append('link', formData.link)
      
      if (imageFile) {
        formDataObj.append('imageFile', imageFile)
      }

      // Get headers based on auth method
      let headers = {}
      const adminSession = localStorage.getItem('adminSession')
      
      if (adminSession) {
        headers['x-admin-session'] = adminSession
      } else if (user) {
        const token = await user.getIdToken()
        headers['Authorization'] = `Bearer ${token}`
      }

      const url = editingBanner 
        ? '/api/admin/hero-banners'
        : '/api/admin/hero-banners'

      if (editingBanner) {
        formDataObj.append('id', editingBanner._id)
        await axios.put(url, formDataObj, { headers })
        toast.success('Banner updated successfully')
      } else {
        await axios.post(url, formDataObj, { headers })
        toast.success('Banner created successfully')
      }

      resetForm()
      fetchBanners()
    } catch (error) {
      console.error('Error saving banner:', error)
      toast.error(error.response?.data?.error || 'Failed to save banner')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      // Get headers based on auth method
      let headers = {}
      const adminSession = localStorage.getItem('adminSession')
      
      if (adminSession) {
        headers['x-admin-session'] = adminSession
      } else if (user) {
        const token = await user.getIdToken()
        headers['Authorization'] = `Bearer ${token}`
      }
      
      await axios.delete('/api/admin/hero-banners', {
        data: { id },
        headers
      })
      toast.success('Banner deleted successfully')
      fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast.error('Failed to delete banner')
    }
  }

  const handleEdit = (banner) => {
    setEditingBanner(banner)
    setFormData({
      badge: banner.badge || '',
      subtitle: banner.subtitle || '',
      title: banner.title || '',
      description: banner.description || '',
      cta: banner.cta || '',
      link: banner.link || '',
      image: banner.image || ''
    })
    if (banner.image) {
      setPreviewUrl(banner.image)
    }
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      badge: '',
      subtitle: '',
      title: '',
      description: '',
      cta: '',
      link: '',
      image: ''
    })
    setImageFile(null)
    setPreviewUrl('')
    setEditingBanner(null)
    setShowForm(false)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hero Banners</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={20} />
            Add Banner
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingBanner ? 'Edit Banner' : 'Create New Banner'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    placeholder="e.g., 0% deduction on exchange"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="e.g., India's new strength"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Your old gold."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    name="cta"
                    value={formData.cta}
                    onChange={handleInputChange}
                    placeholder="e.g., EXPLORE NOW"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="e.g., /shop"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Banner description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                  <div className="relative w-full h-64">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banners List */}
        <div className="space-y-4">
          {banners.length > 0 ? (
            banners.map((banner) => (
              <div key={banner._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex gap-4 p-4">
                  {banner.image && (
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{banner.title}</h3>
                    {banner.badge && <p className="text-sm text-gray-600">{banner.badge}</p>}
                    {banner.subtitle && <p className="text-sm text-gray-600">{banner.subtitle}</p>}
                    {banner.description && <p className="text-sm text-gray-600 mt-2">{banner.description}</p>}
                    <p className="text-sm text-orange-600 mt-2">Button: {banner.cta} → {banner.link}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">No banners created yet. Create your first banner!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
