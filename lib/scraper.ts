export interface ScrapedProduct {
  name: string
  price: number
  originalPrice: number
  currency: string
  imageUrl: string
  platform: 'amazon' | 'flipkart' | 'meesho' | 'other'
  asin?: string
}

export function detectPlatform(url: string): ScrapedProduct['platform'] {
  if (url.includes('amazon.in') || url.includes('amazon.com')) return 'amazon'
  if (url.includes('flipkart.com')) return 'flipkart'
  if (url.includes('meesho.com')) return 'meesho'
  return 'other'
}

export function extractAsin(url: string): string | undefined {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/)
  return match?.[1]
}

export async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  const platform = detectPlatform(url)
  const asin = platform === 'amazon' ? extractAsin(url) : undefined

  // Use AI to extract product info from URL
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Extract product details from this ${platform} URL: ${url}

Return ONLY a JSON object, no markdown:
{
  "name": "product name (concise, under 80 chars)",
  "price": 0,
  "originalPrice": 0,
  "currency": "INR",
  "imageUrl": "",
  "category": "Electronics/Fashion/Home etc"
}

Rules:
- Extract price as a number only (no ₹ symbol)
- originalPrice is MRP/crossed-out price if visible in URL, else same as price
- imageUrl: leave empty, we handle it separately
- Guess name from URL slug keywords if needed
- currency is always INR for Indian sites`,
        },
      ],
    }),
  })

  const data = await response.json()
  const text = data.content
    ?.filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('')

  let parsed: Partial<ScrapedProduct> = {}
  try {
    const clean = text.replace(/```json|```/g, '').trim()
    parsed = JSON.parse(clean)
  } catch {
    // fallback below
  }

  return {
    name: parsed.name || `Product from ${platform}`,
    price: Number(parsed.price) || 0,
    originalPrice: Number(parsed.originalPrice) || Number(parsed.price) || 0,
    currency: 'INR',
    imageUrl: parsed.imageUrl || '',
    platform,
    asin,
  }
}
