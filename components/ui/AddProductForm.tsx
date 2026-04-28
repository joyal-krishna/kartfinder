'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wishlist } from '@/types/database'

export default function AddProductForm({ wishlists }: { wishlists: Wishlist[] }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedWishlist, setSelectedWishlist] = useState(wishlists[0]?.id || '')
  const [showCreateWishlist, setShowCreateWishlist] = useState(false)
  const [newWishlistName, setNewWishlistName] = useState('')
  const router = useRouter()

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), wishlistId: selectedWishlist }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add product')
      setUrl('')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateWishlist(e: React.FormEvent) {
    e.preventDefault()
    if (!newWishlistName.trim()) return
    const res = await fetch('/api/wishlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newWishlistName }),
    })
    const data = await res.json()
    if (res.ok) {
      setSelectedWishlist(data.id)
      setShowCreateWishlist(false)
      setNewWishlistName('')
      router.refresh()
    }
  }

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-gray-900 mb-1">Add a product</h2>
      <p className="text-sm text-gray-500 mb-4">Paste any Amazon, Flipkart, Meesho or store URL</p>

      <form onSubmit={handleAdd}>
        <div className="flex gap-2 mb-3">
          <input
            className="input flex-1"
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://www.amazon.in/dp/..."
            required
          />
          <button type="submit" disabled={loading || !selectedWishlist} className="btn-primary whitespace-nowrap">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Fetching...
              </span>
            ) : 'Add product'}
          </button>
        </div>

        {/* Wishlist selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Save to:</span>
          {wishlists.length > 0 ? (
            <select
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              value={selectedWishlist}
              onChange={e => setSelectedWishlist(e.target.value)}
            >
              {wishlists.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-gray-400">No wishlists yet</span>
          )}
          <button
            type="button"
            onClick={() => setShowCreateWishlist(v => !v)}
            className="text-sm text-brand-600 hover:underline"
          >
            + New wishlist
          </button>
        </div>

        {showCreateWishlist && (
          <form onSubmit={handleCreateWishlist} className="flex gap-2 mt-3">
            <input
              className="input flex-1"
              placeholder="Wishlist name (e.g. Electronics)"
              value={newWishlistName}
              onChange={e => setNewWishlistName(e.target.value)}
            />
            <button type="submit" className="btn-secondary text-sm px-3">Create</button>
          </form>
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  )
}
