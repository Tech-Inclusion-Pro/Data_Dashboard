import { useInsightStore } from '../../store/insightStore'
import AIBadge from '../shared/AIBadge'

const trendIcons = {
  up: '↑',
  down: '↓',
  stable: '→',
}

const trendColors = {
  up: 'text-status-success',
  down: 'text-status-error',
  stable: 'text-text-muted',
}

export default function MetricsSummary() {
  const metrics = useInsightStore((s) => s.metrics)

  if (metrics.length === 0) return null

  return (
    <section aria-label="Key metrics">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-surface-overlay bg-surface-card p-4 animate-slide-in"
          >
            <dt className="flex items-center justify-between text-sm text-text-muted">
              {m.label}
              <AIBadge />
            </dt>
            <dd className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary">{m.value}</span>
              {m.trend && (
                <span className={`text-sm font-medium ${trendColors[m.trend]}`}>
                  {trendIcons[m.trend]}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
