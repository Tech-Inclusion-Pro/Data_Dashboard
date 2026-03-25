import { useInsightStore } from '../../store/insightStore'
import AIBadge from '../shared/AIBadge'
import ExportButton from '../shared/ExportButton'

const severityStyles = {
  info: 'border-l-status-info bg-status-info/5',
  low: 'border-l-severity-low bg-severity-low/5',
  medium: 'border-l-severity-medium bg-severity-medium/5',
  high: 'border-l-severity-high bg-severity-high/5',
  critical: 'border-l-severity-critical bg-severity-critical/5',
}

const severityLabels = {
  info: 'text-status-info',
  low: 'text-severity-low',
  medium: 'text-severity-medium',
  high: 'text-severity-high',
  critical: 'text-severity-critical',
}

export default function InsightsFeed() {
  const insights = useInsightStore((s) => s.insights)
  const pinnedIds = useInsightStore((s) => s.pinnedIds)
  const togglePin = useInsightStore((s) => s.togglePin)

  if (insights.length === 0) return null

  return (
    <section aria-label="AI Insights">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary">Insights</h3>
        <ExportButton data={insights} filenameBase="insights" />
      </div>

      <div role="feed" aria-label="Insights feed" className="space-y-3">
        {insights.map((insight, index) => (
          <article
            key={insight.id}
            aria-posinset={index + 1}
            aria-setsize={insights.length}
            className={`rounded-xl border-l-4 border border-surface-overlay bg-surface-card p-4 animate-slide-in ${
              severityStyles[insight.severity] || ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-text-primary">{insight.title}</h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      severityLabels[insight.severity] || 'text-text-muted'
                    }`}
                  >
                    {insight.severity}
                  </span>
                  <AIBadge />
                </div>
                <p className="mt-1 text-sm text-text-secondary">{insight.summary}</p>
                {insight.category && (
                  <span className="mt-2 inline-block rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-text-muted">
                    {insight.category}
                  </span>
                )}
              </div>

              <button
                onClick={() => togglePin(insight.id)}
                aria-pressed={pinnedIds.includes(insight.id)}
                aria-label={pinnedIds.includes(insight.id) ? 'Unpin insight' : 'Pin insight'}
                className={`shrink-0 rounded-md p-1 ${
                  pinnedIds.includes(insight.id)
                    ? 'text-brand-400'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <svg className="h-4 w-4" fill={pinnedIds.includes(insight.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
