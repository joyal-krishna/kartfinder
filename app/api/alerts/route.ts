import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, targetPrice } = await req.json()
  if (!productId || !targetPrice) return NextResponse.json({ error: 'productId and targetPrice required' }, { status: 400 })

  // Upsert — one alert per product per user
  const { data, error } = await supabase
    .from('price_alerts')
    .upsert({
      user_id: session.user.id,
      product_id: productId,
      target_price: targetPrice,
      is_active: true,
    }, { onConflict: 'user_id,product_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
