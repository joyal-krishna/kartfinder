import { createServerClient } from '@/lib/supabase-server'

export default async function AlertsPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: alerts } = await supabase
    .from('price_alerts')
    .select('*, product:products(*)')
    .eq('user_id', session!.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Price Alerts</h1>
        <p className="text-gray-500 text-sm mt-1">Get notified when prices drop to your target</p>
      </div>

      {!alerts?.length ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="font-medium text-gray-700">No alerts yet</p>
          <p className="text-sm text-gray-400 mt-1">Open any saved product and set a target price to get email alerts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{alert.product?.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Current: <strong>₹{alert.product?.current_price?.toLocaleString('en-IN')}</strong>
                  {' '}→ Target: <strong className="text-brand-600">₹{alert.target_price?.toLocaleString('en-IN')}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {alert.product?.current_price <= alert.target_price ? (
                  <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded-full">✓ Target reached</span>
                ) : (
                  <span className="bg-brand-50 text-brand-700 text-xs font-medium px-2 py-1 rounded-full">
                    ↓ Need ₹{((alert.product?.current_price ?? 0) - alert.target_price).toLocaleString('en-IN')} drop
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${alert.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {alert.is_active ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
