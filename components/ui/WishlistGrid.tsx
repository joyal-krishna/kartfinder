'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wishlist, Product } from '@/types/database'

const PLATFORM_BADGE: Record<string, string> = {
  amazon: 'badge-amazon',
  flipkart: 'badge-flipkart',
  meesho: 'badge-meesho',
  other: 'badge-other',
}

const PLATFORM_LABEL: Record<string, string> = {
  amazon: 'Amazon', flipkart: 'Flipkart', meesho: 'Meesho', other: 'Other'
}

function ProductCard({ product }: { product: Product }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function deleteProduct() {
    if (!confirm('Remove this product?')) return
    setDeleting(true)
    await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
    router.refresh()
  }

  const discount = product.original_price > product.current_price
    ? Math.round(((product.original_price - product.current_price) / product.original_price) * 100)
    : 0

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg group transition-colors">
      {/* Image */}
      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-xl">
            {product.platform === 'amazon' ? '📦' : product.platform === 'flipkart' ? '🛒' : product.platform === 'meesho' ? '🎀' : '🏪'}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate leading-tight">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={PLATFORM_BADGE[product.platform]}>{PLATFORM_LABEL[product.platform]}</span>
          {discount > 0 && (
            <span className="text-xs text-green-600 font-medium">{discount}% off</span>
          )}
        </div>
        {product.note && <p className="text-xs text-gray-400 mt-0.5 truncate">{product.note}</p>}
      </div>

      {/* Price + actions */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="text-right">
          {product.current_price > 0 ? (
            <>
              <p className="text-sm font-bold text-gray-900">₹{product.current_price.toLocaleString('en-IN')}</p>
              {discount > 0 && (
                <p className="text-xs text-gray-400 line-through">₹{product.original_price.toLocaleString('en-IN')}</p>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-400">No price</p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline">View ↗</a>
          <span className="text-gray-300">·</span>
          <button onClick={deleteProduct} disabled={deleting} className="text-xs text-red-400 hover:text-red-600">Remove</button>
        </div>
      </div>
    </div>
  )
}

function WishlistCard({ wishlist }: { wishlist: Wishlist & { products?: Product[] } }) {
  const router = useRouter()
  const products = wishlist.products || []
  const total = products.reduce((s, p) => s + p.current_price * p.quantity, 0)

  async function togglePublic() {
    await fetch(`/api/wishlists/${wishlist.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: !wishlist.is_public }),
    })
    router.refresh()
  }

  async function copyShareLink() {
    const url = `${window.location.origin}/share/${wishlist.share_token}`
    await navigator.clipboard.writeText(url)
    alert('Share link copied!')
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-900">{wishlist.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{products.length} items · Total ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="flex items-center gap-2">
          {wishlist.is_public && (
            <button onClick={copyShareLink} className="text-xs text-brand-600 hover:underline">Copy link</button>
          )}
          <button
            onClick={togglePublic}
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
              wishlist.is_public
                ? 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100'
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {wishlist.is_public ? '🌐 Public' : '🔒 Private'}
          </button>
        </div>
      </div>

      {/* Products */}
      <div className="divide-y divide-gray-50">
        {products.length === 0 ? (
          <p className="text-sm text-gray-400 p-4 text-center">No products yet. Paste a URL above to add one.</p>
        ) : (
          products.slice(0, 5).map(p => <ProductCard key={p.id} product={p} />)
        )}
        {products.length > 5 && (
          <Link href={`/dashboard/wishlists/${wishlist.id}`} className="block text-center text-sm text-brand-600 hover:underline py-3">
            View all {products.length} products →
          </Link>
        )}
      </div>
    </div>
  )
}

export default function WishlistGrid({ wishlists }: { wishlists: Wishlist[] }) {
  if (!wishlists.length) return (
    <div className="card p-12 text-center">
      <div className="text-5xl mb-3">🗂️</div>
      <p className="font-medium text-gray-700">No wishlists yet</p>
      <p className="text-sm text-gray-400 mt-1">Create a wishlist above and start adding products.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-900">Your wishlists</h2>
      {wishlists.map(w => <WishlistCard key={w.id} wishlist={w as Wishlist & { products?: Product[] }} />)}
    </div>
  )
}
