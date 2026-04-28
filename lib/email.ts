import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'alerts@kartfinder.app'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kartfinder.app'

export async function sendPriceDropAlert({
  to,
  productName,
  oldPrice,
  newPrice,
  productUrl,
  imageUrl,
  platform,
}: {
  to: string
  productName: string
  oldPrice: number
  newPrice: number
  productUrl: string
  imageUrl?: string
  platform: string
}) {
  const saving = oldPrice - newPrice
  const savingPct = Math.round((saving / oldPrice) * 100)

  await resend.emails.send({
    from: `Kart Finder <${FROM}>`,
    to,
    subject: `🎉 Price dropped! ${productName} is now ₹${newPrice.toLocaleString('en-IN')}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,sans-serif">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    
    <div style="background:#f97316;padding:24px 32px">
      <div style="font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.5px">🛒 Kart Finder</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px">Price Drop Alert</div>
    </div>

    <div style="padding:32px">
      ${imageUrl ? `<img src="${imageUrl}" alt="${productName}" style="width:100%;max-height:200px;object-fit:contain;border-radius:8px;margin-bottom:20px;background:#f9f9f9">` : ''}
      
      <div style="font-size:11px;font-weight:600;color:#f97316;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">${platform.toUpperCase()}</div>
      <h2 style="margin:0 0 20px;font-size:18px;font-weight:600;color:#111;line-height:1.4">${productName}</h2>
      
      <div style="display:flex;gap:16px;margin-bottom:24px">
        <div style="flex:1;background:#fff7ed;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:12px;color:#9a3412;margin-bottom:4px">Was</div>
          <div style="font-size:20px;font-weight:700;color:#9a3412;text-decoration:line-through">₹${oldPrice.toLocaleString('en-IN')}</div>
        </div>
        <div style="flex:1;background:#f0fdf4;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:12px;color:#15803d;margin-bottom:4px">Now</div>
          <div style="font-size:24px;font-weight:700;color:#15803d">₹${newPrice.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div style="background:#fff7ed;border-radius:8px;padding:12px 16px;margin-bottom:24px;text-align:center">
        <span style="font-size:15px;font-weight:600;color:#c2410c">You save ₹${saving.toLocaleString('en-IN')} (${savingPct}% off)</span>
      </div>

      <a href="${productUrl}" style="display:block;background:#f97316;color:#fff;text-align:center;padding:14px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;margin-bottom:12px">
        Buy Now on ${platform.charAt(0).toUpperCase() + platform.slice(1)}
      </a>
      <a href="${APP_URL}/dashboard" style="display:block;text-align:center;color:#666;font-size:13px;text-decoration:none">
        View in Kart Finder →
      </a>
    </div>

    <div style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center">
      <p style="margin:0;font-size:12px;color:#999">
        You're receiving this because you set a price alert on Kart Finder.<br>
        <a href="${APP_URL}/dashboard/alerts" style="color:#f97316">Manage your alerts</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}
