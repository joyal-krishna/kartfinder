import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Extension calls this with a user token + product data
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { name, price, originalPrice, imageUrl, url, platform, wishlistId } = await req.json()
  if (!name || !url) return NextResponse.json({ error: 'name and url required' }, { status: 400 })

  // Get first wishlist if none specified
  let wlId = wishlistId
  if (!wlId) {
    const { data: wishlists } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!wishlists) {
      // Auto-create default wishlist
      const { data: newWl } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id, name: 'My Wishlist' })
        .select('id')
        .single()
      wlId = newWl?.id
    } else {
      wlId = wishlists.id
    }
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      user_id: user.id,
      wishlist_id: wlId,
      name,
      url,
      platform: platform || 'other',
      image_url: imageUrl || null,
      current_price: price || 0,
      original_price: originalPrice || price || 0,
      currency: 'INR',
      quantity: 1,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (price > 0) {
    await supabase.from('price_history').insert({ product_id: product.id, price })
  }

  return NextResponse.json({ success: true, product })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
