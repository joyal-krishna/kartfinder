'use client'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Product } from '@/types/database'

const PLATFORM_COLORS: Record<string, string> = {
  amazon: '#f59e0b',
  flipkart: '#3b82f6',
  meesho: '#ef4444',
  other: '#8b5cf6',
}

const PLATFORM_LABEL: Record<string, string> = {
  amazon: 'Amazon', flipkart: 'Flipkart', meesho: 'Meesho', other: 'Other'
}

export default function ComparePage({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? products : products.filter(p => p.platform === filter)
  const platforms = [...new Set(products.map(p => p.platform))]

  const chartData = filtered.map(p => ({
    name: p.name.length > 22 ? p.name.slice(0, 22) + '…' : p.name,
    fullName: p.name,
    price: p.current_price,
    platform: p.platform,
    url: p.url,
    discount: p.original_price > p.current_price
      ? Math.round(((p.original_price - p.current_price) / p.original_price) * 100)
      : 0,
  }))

  const maxPrice = Math.max(...filtered.map(p => p.current_price), 1)
  const minPrice = Math.min(...filtered.map(p => p.current_price))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm max-w-xs">
        <p className="font-medium text-gray-900 mb-1 leading-tight">{d.fullName}</p>
        <p className="text-brand-600 font-bold text-base">₹{d.price.toLocaleString('en-IN')}</p>
        <p className="text-gray-400 text-xs">{PLATFORM_LABEL[d.platform]}</p>
        {d.discount > 0 && <p className="text-green-600 text-xs font-medium">{d.discount}% off MRP</p>}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Price Comparison</h1>
        <p className="text-gray-500 text-sm mt-1">Compare all your saved products across platforms</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Products compared', value: products.length.toString() },
          { label: 'Cheapest item', value: `₹${minPrice.toLocaleString('en-IN')}` },
          { label: 'Most expensive', value: `₹${maxPrice.toLocaleString('en-IN')}` },
          { label: 'Platforms', value: platforms.length.toString() },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...platforms].map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filter === p
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {p === 'all' ? 'All platforms' : PLATFORM_LABEL[p]}
          </button>
        ))}
      </div>

      {/* Bar chart */}
      {filtered.length > 0 ? (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm">Price chart</h2>
          <ResponsiveContainer width="100%" height={Math.max(200, filtered.length * 44)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 8, bottom: 0 }}
            >
              <XAxis
                type="number"
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 11, fill: '#374151' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="price" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={PLATFORM_COLORS[entry.platform] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex gap-4 mt-3 flex-wrap">
            {platforms.map(p => (
              <div key={p} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: PLATFORM_COLORS[p] }} />
                <span className="text-xs text-gray-500">{PLATFORM_LABEL[p]}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="font-medium text-gray-700">No products to compare</p>
          <p className="text-sm text-gray-400 mt-1">Add products with prices to see comparisons here.</p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Platform</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Discount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {chartData.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                    <span className="truncate block" title={item.fullName}>{item.fullName.slice(0, 50)}{item.fullName.length > 50 ? '…' : ''}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{
                        background: PLATFORM_COLORS[item.platform] + '20',
                        color: PLATFORM_COLORS[item.platform]
                      }}
                    >
                      {PLATFORM_LABEL[item.platform]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    ₹{item.price.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.discount > 0
                      ? <span className="text-green-600 font-medium">{item.discount}% off</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline text-xs">
                      View ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
