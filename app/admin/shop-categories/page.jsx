'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import PageTitle from '@/components/PageTitle'
import { Edit2, Trash2, Plus } from 'lucide-react'

export default function AdminShopCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [heading, setHeading] = useState({
    title: '',
    subtitle: '',
    visible: true
  })
  const [selectedCategories, setSelectedCategories] = useState([])
  const [categoryOrder, setCategoryOrder] = useState([])
  const [editingHeading, setEditingHeading] = useState(false)
  const [selectingDisplay, setSelectingDisplay] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesRes, settingsRes] = await Promise.all([
        axios.get('/api/store/shop-categories'),
        axios.get('/api/store/settings')
      ])
      
      setCategories(categoriesRes.data.categories || [])
      if (settingsRes.data.settings?.shopCategoriesHeading) {
        setHeading(settingsRes.data.settings.shopCategoriesHeading)
      }
      
      // Load selected categories for display
      const displaySettings = settingsRes.data.settings?.shopCategoriesDisplay
      if (displaySettings?.selectedIds) {
        setSelectedCategories(displaySettings.selectedIds)
        setCategoryOrder(displaySettings.order || displaySettings.selectedIds)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    }
  }

  const handleHeadingChange = (e) => {
    const { name, value, type, checked } = e.target
    setHeading(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSaveHeading = async () => {
    setLoading(true)
    try {
      await axios.put('/api/store/settings', {
        shopCategoriesHeading: heading
      })
      toast.success('Heading updated successfully')
      setEditingHeading(false)
    } catch (error) {
      toast.error('Failed to update heading')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (categoryId) => {
    if (!confirm('Delete this category?')) return

    try {
      await axios.delete(`/api/store/shop-categories/${categoryId}`)
      toast.success('Category deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete category')
    }
  }

  const toggleCategorySelection = (categoryId) => {
    setSelectedCategories(prev => {
      const updated = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
      
      // Keep max 7 selected
      return updated.slice(0, 7)
    })
  }

  const saveCategorySelection = async () => {
    setLoading(true)
    try {
      await axios.put('/api/store/settings', {
        shopCategoriesDisplay: {
          selectedIds: selectedCategories,
          order: selectedCategories
        }
      })
      toast.success('Category selection updated')
      setSelectingDisplay(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to save category selection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <PageTitle title="Shop Categories" />

        {/* Heading Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Section Heading</h3>
            {!editingHeading && (
              <button
                onClick={() => setEditingHeading(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {editingHeading ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={heading.title}
                  onChange={handleHeadingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={heading.subtitle}
                  onChange={handleHeadingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="visible"
                    checked={heading.visible}
                    onChange={handleHeadingChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Visible on homepage
                  </span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveHeading}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingHeading(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-xl font-serif text-gray-900 mb-1">{heading.title}</h4>
              <p className="text-gray-600">{heading.subtitle}</p>
              <p className="text-sm text-gray-500 mt-2">
                {heading.visible ? '✓ Visible' : '✗ Hidden'}
              </p>
            </div>
          )}
        </div>

        {/* Display Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Display on Homepage (Max 7)</h3>
            {!selectingDisplay && (
              <button
                onClick={() => setSelectingDisplay(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit Selection
              </button>
            )}
          </div>

          {selectingDisplay ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select up to 7 categories to display. Click to toggle selection.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    onClick={() => toggleCategorySelection(category._id.toString())}
                    className={`p-4 rounded-lg cursor-pointer border-2 transition ${
                      selectedCategories.includes(category._id.toString())
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id.toString())}
                        onChange={() => {}}
                        className="w-4 h-4 rounded mt-1"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{category.title}</h4>
                        <p className="text-sm text-gray-500">{category.link}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={saveCategorySelection}
                  disabled={loading || selectedCategories.length === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Selection'}
                </button>
                <button
                  onClick={() => setSelectingDisplay(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedCategories.length > 0 ? (
                categories
                  .filter(c => selectedCategories.includes(c._id.toString()))
                  .map((category) => (
                    <div key={category._id} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <h4 className="font-medium text-gray-900">{category.title}</h4>
                      <p className="text-sm text-gray-500">{category.link}</p>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 col-span-3">No categories selected. Click "Edit Selection" to choose.</p>
              )}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Categories</h3>
          <Link
            href="/admin/shop-categories/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Category
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {category.image && (
                  <div className="w-full h-40 bg-gray-200 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">Link: {category.link}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="flex-1 bg-red-100 text-red-600 px-3 py-2 rounded hover:bg-red-200 text-center text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">No categories yet</p>
            <Link
              href="/admin/shop-categories/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first category
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
