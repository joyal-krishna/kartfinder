'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Wishlist, Product } from '@/types/database'

const PLATFORM_BADGE: Record<string, string> = {
  amazon: 'badge-amazon', flipkart: 'badge-flipkart', meesho: 'badge-meesho', other: 'badge-other'
}
const PLATFORM_LABEL: Record<string, string> = {
  amazon: 'Amazon', flipkart: 'Flipkart', meesho: 'Meesho', other: 'Other'
}

function PriceAlertModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [target, setTarget] = useState(String(Math.floor(product.current_price * 0.9)))
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function save() {
    setSaving(true)
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, targetPrice: parseFloat(target) }),
    })
    setDone(true)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🔔</div>
            <p className="font-semibold text-gray-900">Alert set!</p>
            <p className="text-sm text-gray-500 mt-1">We'll email you when the price drops to ₹{parseFloat(target).toLocaleString('en-IN')}</p>
            <button onClick={onClose} className="btn-primary mt-4 w-full">Done</button>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-gray-900 mb-1">Set price alert</h3>
            <p className="text-sm text-gray-500 mb-1 truncate">{product.name}</p>
            <p className="text-xs text-gray-400 mb-4">Current price: ₹{product.current_price.toLocaleString('en-IN')}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alert me when price drops to</label>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-500">₹</span>
              <input
                className="input flex-1"
                type="number"
                value={target}
                onChange={e => setTarget(e.target.value)}
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Setting...' : 'Set alert'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function WishlistDetailClient({ wishlist }: { wishlist: Wishlist & { products?: Product[] } }) {
  const router = useRouter()
  const [alertProduct, setAlertProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(wishlist.is_public)
  const [copied, setCopied] = useState(false)

  const products = wishlist.products || []
  const total = products.reduce((s, p) => s + p.current_price * p.quantity, 0)

  async function deleteProduct(id: string) {
    if (!confirm('Remove this product?')) return
    setDeleting(id)
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function togglePublic() {
    const next = !isPublic
    setIsPublic(next)
    await fetch(`/api/wishlists/${wishlist.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: next }),
    })
    router.refresh()
  }

  async function copyShareLink() {
    const url = `${window.location.origin}/share/${wishlist.share_token}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <Link href="/dashboard/wishlists" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">← Wishlists</Link>
          <h1 className="text-2xl font-bold text-gray-900">{wishlist.name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} items · Total ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <button onClick={togglePublic} className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${isPublic ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
            {isPublic ? '🌐 Public' : '🔒 Private'}
          </button>
          {isPublic && (
            <button onClick={copyShareLink} className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              {copied ? '✅ Copied!' : '🔗 Share'}
            </button>
          )}
        </div>
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className="card p-12 text-center mt-6">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-medium text-gray-700">No products in this wishlist</p>
          <Link href="/dashboard" className="btn-primary inline-block mt-4 text-sm">Add products</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {products.map(p => {
            const discount = p.original_price > p.current_price
              ? Math.round(((p.original_price - p.current_price) / p.original_price) * 100)
              : 0

            return (
              <div key={p.id} className="card p-4 flex items-center gap-4">
                {/* Image */}
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-2xl">
                      {p.platform === 'amazon' ? '📦' : p.platform === 'flipkart' ? '🛒' : p.platform === 'meesho' ? '🎀' : '🏪'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 leading-tight">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={PLATFORM_BADGE[p.platform]}>{PLATFORM_LABEL[p.platform]}</span>
                    {discount > 0 && <span className="text-xs text-green-600 font-medium">{discount}% off</span>}
                  </div>
                  {p.note && <p className="text-xs text-gray-400 mt-1">{p.note}</p>}
                </div>

                {/* Price + actions */}
                <div className="flex-shrink-0 text-right">
                  {p.current_price > 0 ? (
                    <>
                      <p className="font-bold text-gray-900">₹{p.current_price.toLocaleString('en-IN')}</p>
                      {discount > 0 && <p className="text-xs text-gray-400 line-through">₹{p.original_price.toLocaleString('en-IN')}</p>}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">No price</p>
                  )}
                  <div className="flex items-center gap-2 justify-end mt-1.5">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:underline">Buy ↗</a>
                    <span className="text-gray-200">|</span>
                    {p.current_price > 0 && (
                      <>
                        <button onClick={() => setAlertProduct(p)} className="text-xs text-gray-400 hover:text-brand-500">🔔</button>
                        <span className="text-gray-200">|</span>
                      </>
                    )}
                    <button
                      onClick={() => deleteProduct(p.id)}
                      disabled={deleting === p.id}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {alertProduct && (
        <PriceAlertModal product={alertProduct} onClose={() => setAlertProduct(null)} />
      )}
    </div>
  )
}
