export type Platform = 'amazon' | 'flipkart' | 'meesho' | 'other'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Wishlist {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  share_token: string
  created_at: string
  updated_at: string
  products?: Product[]
}

export interface Product {
  id: string
  user_id: string
  wishlist_id: string
  name: string
  url: string
  platform: Platform
  image_url: string | null
  current_price: number
  original_price: number
  currency: string
  quantity: number
  note: string | null
  asin: string | null
  created_at: string
  updated_at: string
  price_history?: PriceHistory[]
}

export interface PriceHistory {
  id: string
  product_id: string
  price: number
  checked_at: string
}

export interface PriceAlert {
  id: string
  user_id: string
  product_id: string
  target_price: number
  is_active: boolean
  last_triggered_at: string | null
  created_at: string
  product?: Product
}

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      wishlists: { Row: Wishlist; Insert: Partial<Wishlist>; Update: Partial<Wishlist> }
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> }
      price_history: { Row: PriceHistory; Insert: Partial<PriceHistory>; Update: Partial<PriceHistory> }
      price_alerts: { Row: PriceAlert; Insert: Partial<PriceAlert>; Update: Partial<PriceAlert> }
    }
  }
}
