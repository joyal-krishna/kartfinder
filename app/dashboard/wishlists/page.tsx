import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function WishlistsPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: wishlists } = await supabase
    .from('wishlists')
    .select('*, products(id, current_price, quantity, platform)')
    .eq('user_id', session!.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wishlists</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your wishlists</p>
        </div>
      </div>

      {!wishlists?.length ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🗂️</div>
          <p className="font-medium text-gray-700">No wishlists yet</p>
          <p className="text-sm text-gray-400 mt-1">Go to Dashboard and create your first wishlist.</p>
          <Link href="/dashboard" className="btn-primary inline-block mt-4 text-sm">Go to Dashboard</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlists.map(w => {
            const products = (w.products || []) as Array<{ current_price: number; quantity: number; platform: string }>
            const total = products.reduce((s, p) => s + p.current_price * p.quantity, 0)
            const platforms = [...new Set(products.map(p => p.platform))]
            return (
              <Link key={w.id} href={`/dashboard/wishlists/${w.id}`} className="card p-5 hover:shadow-md transition-shadow cursor-pointer block">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{w.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${w.is_public ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                    {w.is_public ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>
                {w.description && <p className="text-sm text-gray-500 mb-3">{w.description}</p>}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{products.length} items</span>
                  {total > 0 && <span className="font-semibold text-brand-600">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>}
                </div>
                {platforms.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {platforms.map(p => (
                      <span key={p} className={`badge-${p} text-xs px-2 py-0.5 rounded-full font-medium`}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
