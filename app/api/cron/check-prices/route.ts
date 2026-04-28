import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { scrapeProduct } from '@/lib/scraper'
import { sendPriceDropAlert } from '@/lib/email'

// Called by Vercel Cron or external cron service daily
// Set up in vercel.json: { "crons": [{ "path": "/api/cron/check-prices", "schedule": "0 9 * * *" }] }
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = supabaseAdmin()

  // Get all active products (check up to 100 per run)
  const { data: products } = await supabase
    .from('products')
    .select('*, profiles!user_id(email)')
    .not('url', 'is', null)
    .gt('current_price', 0)
    .limit(100)

  if (!products || products.length === 0) return NextResponse.json({ checked: 0 })
  let updated = 0
  let alertsSent = 0

  for (const product of products) {
    try {
      const scraped = await scrapeProduct(product.url)
      if (!scraped.price || scraped.price <= 0) continue

      const newPrice = scraped.price
      const oldPrice = product.current_price

      // Record price history
      await supabase.from('price_history').insert({ product_id: product.id, price: newPrice })

      // Update product price if changed
      if (Math.abs(newPrice - oldPrice) > 0.5) {
        await supabase
          .from('products')
          .update({ current_price: newPrice, updated_at: new Date().toISOString() })
          .eq('id', product.id)
        updated++
      }

      // Check active alerts for this product
      if (newPrice < oldPrice) {
        const { data: alerts } = await supabase
          .from('price_alerts')
          .select('*, profiles!user_id(email)')
          .eq('product_id', product.id)
          .eq('is_active', true)
          .lte('target_price', newPrice)

        for (const alert of (alerts || [])) {
          const email = (alert as { profiles?: { email?: string } }).profiles?.email
          if (!email) continue

          await sendPriceDropAlert({
            to: email,
            productName: product.name,
            oldPrice,
            newPrice,
            productUrl: product.url,
            imageUrl: product.image_url || undefined,
            platform: product.platform,
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
