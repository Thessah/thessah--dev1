'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { PlusIcon, TrashIcon, EditIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react'
import PageTitle from '@/components/PageTitle'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function CollectionsPage() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const { data } = await axios.get('/api/store/collections')
      setCollections(data.collections || [])
    } catch (error) {
      toast.error('Error fetching collections')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this collection?')) return
    try {
      await axios.delete(`/api/store/collections/${id}`)
      toast.success('Collection deleted')
      fetchCollections()
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Error deleting collection')
    }
  }

  const handleReorder = async (id, direction) => {
    try {
      await axios.put('/api/store/collections/reorder', { collectionId: id, direction })
      toast.success('Order updated')
      fetchCollections()
    } catch (error) {
      toast.error('Error updating order')
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageTitle title="Manage Collections" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
        <Link
          href="/admin/collections/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <PlusIcon size={20} />
          Add Collection
        </Link>
      </div>

      {collections.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No collections yet</p>
          <Link
            href="/admin/collections/new"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create First Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <div
              key={collection._id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {/* Image Preview */}
              {collection.image && (
                <div className="w-full h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {collection.title}
                </h3>
                {collection.subtitle && (
                  <p className="text-sm text-gray-600 mb-2">{collection.subtitle}</p>
                )}
                <div className="mb-3 space-y-1">
                  <p className="text-xs text-gray-500">
                    Link: <span className="font-mono text-gray-700">{collection.link}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Status:{' '}
                    <span
                      className={
                        collection.isActive
                          ? 'text-green-600 font-semibold'
                          : 'text-red-600 font-semibold'
                      }
                    >
                      {collection.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={`/admin/collections/${collection._id}`}
                    className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm flex items-center justify-center gap-2 hover:bg-blue-200 transition"
                  >
                    <EditIcon size={16} />
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(collection._id)}
                    className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm flex items-center justify-center gap-2 hover:bg-red-200 transition"
                  >
                    <TrashIcon size={16} />
                    Delete
                  </button>
                </div>

                {/* Reorder Buttons */}
                <div className="flex gap-1 mt-3">
                  <button
                    onClick={() => handleReorder(collection._id, 'up')}
                    disabled={index === 0}
                    className="flex-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs flex items-center justify-center gap-1 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronUpIcon size={14} />
                    Up
                  </button>
                  <button
                    onClick={() => handleReorder(collection._id, 'down')}
                    disabled={index === collections.length - 1}
                    className="flex-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs flex items-center justify-center gap-1 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronDownIcon size={14} />
                    Down
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
