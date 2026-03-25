import { useInsightStore } from '../../store/insightStore'
import ExportButton from '../shared/ExportButton'
import AIBadge from '../shared/AIBadge'

export default function PinnedInsights() {
  const insights = useInsightStore((s) => s.insights)
  const pinnedIds = useInsightStore((s) => s.pinnedIds)
  const togglePin = useInsightStore((s) => s.togglePin)

  const pinned = insights.filter((i) => pinnedIds.includes(i.id))

  if (pinned.length === 0) return null

  return (
    <section aria-label="Pinned insights">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary">
          Pinned Insights ({pinned.length})
        </h3>
        <ExportButton data={pinned} filenameBase="pinned-insights" />
      </div>

      <div className="space-y-2">
        {pinned.map((insight) => (
          <div
            key={insight.id}
            className="flex items-start justify-between rounded-lg border border-brand-500/30 bg-brand-500/5 p-3"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-text-primary">{insight.title}</h4>
                <AIBadge />
              </div>
              <p className="mt-1 text-xs text-text-secondary">{insight.summary}</p>
            </div>
            <button
              onClick={() => togglePin(insight.id)}
              aria-label="Unpin insight"
              className="shrink-0 rounded-md p-1 text-brand-400 hover:text-brand-300"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
