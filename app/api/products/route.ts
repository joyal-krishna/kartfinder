import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { scrapeProduct } from '@/lib/scraper'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, wishlistId, name: manualName, price: manualPrice, platform: manualPlatform } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  if (!wishlistId) return NextResponse.json({ error: 'Wishlist is required' }, { status: 400 })

  // Verify wishlist belongs to user
  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('id')
    .eq('id', wishlistId)
    .eq('user_id', session.user.id)
    .single()

  if (!wishlist) return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 })

  let productData
  if (manualName) {
    // Manual add (from extension or form)
    const { detectPlatform } = await import('@/lib/scraper')
    productData = {
      name: manualName,
      price: manualPrice || 0,
      originalPrice: manualPrice || 0,
      currency: 'INR',
      imageUrl: '',
      platform: manualPlatform || detectPlatform(url),
    }
  } else {
    // Auto-scrape
    productData = await scrapeProduct(url)
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      user_id: session.user.id,
      wishlist_id: wishlistId,
      name: productData.name,
      url,
      platform: productData.platform,
      image_url: productData.imageUrl || null,
      current_price: productData.price,
      original_price: productData.originalPrice,
      currency: 'INR',
      asin: productData.asin || null,
      quantity: 1,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Record initial price history
  await supabase.from('price_history').insert({
    product_id: product.id,
    price: productData.price,
  })

  return NextResponse.json(product)
}
