'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import PageTitle from '@/components/PageTitle'

export default function Section3Settings() {
  const [heading, setHeading] = useState({
    title: 'Top Deals',
    subtitle: ''
  })
  const [editingHeading, setEditingHeading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/store/settings')
      if (data.settings?.section3Heading) {
        setHeading(data.settings.section3Heading)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleHeadingChange = (e) => {
    const { name, value } = e.target
    setHeading(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveHeading = async () => {
    setLoading(true)
    try {
      const { data } = await axios.put('/api/store/settings', {
        section3Heading: heading
      })
      
      if (data.success) {
        toast.success('Section 3 heading updated!')
        setEditingHeading(false)
      }
    } catch (error) {
      console.error('Error saving heading:', error)
      toast.error('Failed to save heading')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <PageTitle title="Section 3 Settings" />

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={heading.subtitle}
                  onChange={handleHeadingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
              {heading.subtitle && <p className="text-gray-600">{heading.subtitle}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
