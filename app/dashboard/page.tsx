import { createServerClient } from '@/lib/supabase-server'
import AddProductForm from '@/components/ui/AddProductForm'
import WishlistGrid from '@/components/ui/WishlistGrid'
import StatsBar from '@/components/ui/StatsBar'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: wishlists } = await supabase
    .from('wishlists')
    .select('*, products(*)')
    .eq('user_id', session!.user.id)
    .order('created_at', { ascending: false })

  const allProducts = wishlists?.flatMap(w => w.products || []) ?? []

  const stats = {
    totalValue: allProducts.reduce((s, p) => s + (p.current_price * p.quantity), 0),
    totalItems: allProducts.reduce((s, p) => s + p.quantity, 0),
    wishlists: wishlists?.length ?? 0,
    platforms: [...new Set(allProducts.map(p => p.platform))].length,
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">All your wishlists and saved products</p>
      </div>

      <StatsBar stats={stats} />

      <div className="mt-8">
        <AddProductForm wishlists={wishlists ?? []} />
      </div>

      <div className="mt-8">
        <WishlistGrid wishlists={wishlists ?? []} />
      </div>
    </div>
  )
}
