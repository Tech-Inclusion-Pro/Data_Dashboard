import { useInsightStore } from '../../store/insightStore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import AIBadge from '../shared/AIBadge'

export default function AccommodationTrends() {
  const trends = useInsightStore((s) => s.accommodationTrends)

  if (trends.length === 0) return null

  // Group by category for multi-line if present
  const categories = [...new Set(trends.map((t) => t.category).filter(Boolean))]
  const colors = ['#a67dff', '#34d399', '#fbbf24', '#60a5fa', '#f87171']

  // If no categories, use a simple line
  const hasCategories = categories.length > 1

  // Build chart data keyed by period
  let chartData
  if (hasCategories) {
    const grouped = {}
    trends.forEach((t) => {
      if (!grouped[t.period]) grouped[t.period] = { period: t.period }
      grouped[t.period][t.category] = t.count
    })
    chartData = Object.values(grouped)
  } else {
    chartData = trends.map((t) => ({ period: t.period, count: t.count }))
  }

  const textSummary = trends
    .map((t) => `${t.period}: ${t.count}${t.category ? ` (${t.category})` : ''}`)
    .join('; ')

  return (
    <section className="rounded-xl border border-surface-overlay bg-surface-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary">Accommodation Trends</h3>
        <AIBadge />
      </div>

      <div
        role="img"
        aria-label={`Accommodation trends chart showing: ${textSummary}`}
        className="h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2937" />
            <XAxis dataKey="period" tick={{ fill: '#9a92aa', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9a92aa', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1720',
                border: '1px solid #2d2937',
                borderRadius: 8,
                color: '#f0ecf4',
              }}
            />
            {hasCategories ? (
              categories.map((cat, i) => (
                <Line
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey="count"
                stroke="#a67dff"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-text-muted hover:text-text-secondary">
          View data as text
        </summary>
        <p className="mt-1 text-xs text-text-muted">{textSummary}</p>
      </details>
    </section>
  )
}
