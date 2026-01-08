'use client'

export default function ApproveProductsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Product Approval</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">
          Product auto-approval is enabled. All products are automatically approved when added by store owners.
        </p>
      </div>
    </div>
  )
}
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
