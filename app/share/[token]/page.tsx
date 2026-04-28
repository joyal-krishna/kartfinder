import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function SharedWishlistPage({ params }: { params: { token: string } }) {
  const supabase = createServerClient()

  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('*, products(*), profiles!user_id(full_name)')
    .eq('share_token', params.token)
    .eq('is_public', true)
    .single()

  if (!wishlist) notFound()

  const products = (wishlist as any).products || []
  const total = products.reduce((s: number, p: { current_price: number; quantity: number }) => s + p.current_price * p.quantity, 0)
  const owner = (wishlist as { profiles?: { full_name?: string } }).profiles?.full_name || 'Someone'

  const PLATFORM_BADGE: Record<string, string> = {
    amazon: 'badge-amazon', flipkart: 'badge-flipkart', meesho: 'badge-meesho', other: 'badge-other'
  }
  const PLATFORM_LABEL: Record<string, string> = {
    amazon: 'Amazon', flipkart: 'Flipkart', meesho: 'Meesho', other: 'Other'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm">
            <span>🛒</span> Kart Finder
          </Link>
        </div>

        <div className="card p-6 mb-6">
          <p className="text-sm text-gray-500 mb-1">{owner}&apos;s wishlist</p>
          <h1 className="text-2xl font-bold text-gray-900">{wishlist.name}</h1>
          {wishlist.description && <p className="text-gray-500 text-sm mt-1">{wishlist.description}</p>}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">{products.length} items</p>
            {total > 0 && <p className="text-sm font-medium text-brand-600">Total: ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>}
          </div>
        </div>

        {/* Products */}
        <div className="space-y-3">
          {products.map((p: {
            id: string; name: string; platform: string; image_url?: string;
            current_price: number; original_price: number; url: string; note?: string
          }) => {
            const discount = p.original_price > p.current_price
              ? Math.round(((p.original_price - p.current_price) / p.original_price) * 100)
              : 0

            return (
              <div key={p.id} className="card p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-2xl">
                      {p.platform === 'amazon' ? '📦' : p.platform === 'flipkart' ? '🛒' : p.platform === 'meesho' ? '🎀' : '🏪'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 leading-tight">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={PLATFORM_BADGE[p.platform]}>{PLATFORM_LABEL[p.platform]}</span>
                    {discount > 0 && <span className="text-xs text-green-600 font-medium">{discount}% off</span>}
                  </div>
                  {p.note && <p className="text-xs text-gray-400 mt-0.5">{p.note}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  {p.current_price > 0 ? (
                    <>
                      <p className="font-bold text-gray-900">₹{p.current_price.toLocaleString('en-IN')}</p>
                      {discount > 0 && <p className="text-xs text-gray-400 line-through">₹{p.original_price.toLocaleString('en-IN')}</p>}
                    </>
                  ) : null}
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline block mt-1">
                    Buy ↗
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-3">Want to track your own wishlists?</p>
          <Link href="/auth/signup" className="btn-primary">Create free account →</Link>
        </div>
      </div>
    </div>
  )
}
