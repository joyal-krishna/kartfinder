import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import WishlistDetailClient from './WishlistDetailClient'

export default async function WishlistDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('*, products(*)')
    .eq('id', params.id)
    .eq('user_id', session!.user.id)
    .single()

  if (!wishlist) notFound()

  return <WishlistDetailClient wishlist={wishlist} />
}
