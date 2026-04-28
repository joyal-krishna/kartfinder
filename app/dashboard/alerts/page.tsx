import { createServerClient } from "@/lib/supabase-server"

export default async function AlertsPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: alerts } = await supabase
    .from("price_alerts")
    .select("*, product:products(*)")
    .eq("user_id", session!.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Price Alerts</h1>
        <p className="text-gray-500 text-sm mt-1">Get notified when prices drop</p>
      </div>
      {!alerts?.length ? (
        <div className="card p-12 text-center">
          <p className="font-medium text-gray-700">No alerts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert: Record<string, unknown>, index: number) => (
            <div key={index} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{(alert.product as Record<string,unknown>|null)?.name as string}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600">
                {alert.is_active ? "Active" : "Paused"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
