import { createServerClient } from '@/lib/supabase-server'
import ComparePage from './ComparePage'

export default async function CompareServerPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', session!.user.id)
    .gt('current_price', 0)
    .order('current_price', { ascending: true })

  return <ComparePage products={products ?? []} />
}
