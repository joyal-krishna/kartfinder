import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { scrapeProduct } from '@/lib/scraper'
import { sendPriceDropAlert } from '@/lib/email'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = supabaseAdmin()

  const { data } = await supabase
    .from('products')
    .select('id, name, url, platform, current_price, original_price, image_url, user_id')
    .not('url', 'is', null)
    .gt('current_price', 0)
    .limit(100)

  const products = data ?? []
  if (products.length === 0) return NextResponse.json({ checked: 0 })

  let updated = 0
  let alertsSent = 0

  for (const product of products) {
    try {
      const scraped = await scrapeProduct(product.url as string)
      if (!scraped.price || scraped.price <= 0) continue

      const newPrice = scraped.price
      const oldPrice = product.current_price as number

      await supabase.from('price_history').insert({ product_id: product.id, price: newPrice })

      if (Math.abs(newPrice - oldPrice) > 0.5) {
        await supabase
          .from('products')
          .update({ current_price: newPrice, updated_at: new Date().toISOString() })
          .eq('id', product.id)
        updated++
      }

      if (newPrice < oldPrice) {
        const { data: alerts } = await supabase
          .from('price_alerts')
          .select('id, target_price, user_id')
          .eq('product_id', product.id)
          .eq('is_active', true)
          .lte('target_price', newPrice)

        for (const alert of (alerts ?? [])) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', alert.user_id)
            .single()

          if (!profile?.email) continue

          await sendPriceDropAlert({
            to: profile.email,
            productName: product.name as string,
            oldPrice,
            newPrice,
            productUrl: product.url as string,
            imageUrl: (product.image_url as string) || undefined,
            platform: product.platform as string,
          })

          await supabase
            .from('price_alerts')
            .update({ last_triggered_at: new Date().toISOString() })
            .eq('id', alert.id)

          alertsSent++
        }
      }
    } catch (err) {
      console.error(`Failed to check price for product ${product.id}:`, err)
    }
  }

  return NextResponse.json({ checked: products.length, updated, alertsSent })
}