'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '@/lib/useAuth'
import Image from 'next/image'

export default function ApproveProductsPage() {
  const { getToken } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingProducts()
  }, [])

  const fetchPendingProducts = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/admin/products/pending', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (productId) => {
    try {
      const token = await getToken()
      await axios.post(`/api/admin/products/${productId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(products.filter(p => p._id !== productId))
      alert('Product approved!')
    } catch (error) {
      console.error('Error approving product:', error)
      alert('Failed to approve product')
    }
  }

  const handleReject = async (productId) => {
    try {
      const token = await getToken()
      await axios.post(`/api/admin/products/${productId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(products.filter(p => p._id !== productId))
      alert('Product rejected!')
    } catch (error) {
      console.error('Error rejecting product:', error)
      alert('Failed to reject product')
    }
  }

  if (loading) return <div className="p-8">Loading pending products...</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Approve Products</h1>
      
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow p-6 flex gap-6">
            {product.images?.[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                width={120}
                height={120}
                className="rounded object-cover"
              />
            )}
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <div className="flex gap-4 text-sm">
                <span className="font-medium">Price: ₹{product.price}</span>
                <span>Category: {product.category}</span>
                <span>Stock: {product.stock}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleApprove(product._id)}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(product._id)}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No pending products for approval
        </div>
      )}
    </div>
  )
}
