interface Stats {
  totalValue: number
  totalItems: number
  wishlists: number
  platforms: number
}

export default function StatsBar({ stats }: { stats: Stats }) {
  const items = [
    { label: 'Total wishlist value', value: `₹${stats.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-brand-600' },
    { label: 'Items saved', value: stats.totalItems.toString() },
    { label: 'Wishlists', value: stats.wishlists.toString() },
    { label: 'Platforms', value: stats.platforms.toString() },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(item => (
        <div key={item.label} className="card p-4">
          <p className="text-xs text-gray-500 mb-1">{item.label}</p>
          <p className={`text-2xl font-bold ${item.color || 'text-gray-900'}`}>{item.value}</p>
        </div>
      ))}
    </div>
  )
}
