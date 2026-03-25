import { useInsightStore } from '../../store/insightStore'

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }

const severityBorder = {
  critical: 'border-l-severity-critical',
  high: 'border-l-severity-high',
  medium: 'border-l-severity-medium',
  low: 'border-l-severity-low',
}

const severityText = {
  critical: 'text-severity-critical',
  high: 'text-severity-high',
  medium: 'text-severity-medium',
  low: 'text-severity-low',
}

export default function RiskFlags() {
  const riskFlags = useInsightStore((s) => s.riskFlags)

  if (riskFlags.length === 0) return null

  const sorted = [...riskFlags].sort(
    (a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
  )

  return (
    <section aria-label="Risk flags">
      <h3 className="mb-3 text-sm font-medium text-text-primary">Risk Flags</h3>
      <ul className="space-y-2">
        {sorted.map((flag) => (
          <li
            key={flag.id}
            role={flag.severity === 'critical' ? 'alert' : undefined}
            className={`rounded-lg border-l-4 border border-surface-overlay bg-surface-card p-3 animate-slide-in ${
              severityBorder[flag.severity] || ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold uppercase ${
                  severityText[flag.severity] || 'text-text-muted'
                }`}
              >
                {flag.severity}
              </span>
              <h4 className="font-medium text-text-primary">{flag.title}</h4>
            </div>
            <p className="mt-1 text-sm text-text-secondary">{flag.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
