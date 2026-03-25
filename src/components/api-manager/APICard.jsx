const statusStyles = {
  ok: { dot: 'bg-status-success', text: 'Connected' },
  error: { dot: 'bg-status-error', text: 'Error' },
  loading: { dot: 'bg-status-warning animate-pulse', text: 'Fetching…' },
  unchecked: { dot: 'bg-text-muted', text: 'Not checked' },
}

export default function APICard({ api, onEdit, onRemove, onTest }) {
  const status = statusStyles[api.status] || statusStyles.unchecked

  return (
    <article className="rounded-xl border border-surface-overlay bg-surface-card p-4 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} aria-hidden="true" />
          <h3 className="font-medium text-text-primary">{api.name}</h3>
        </div>
        <span className="text-xs text-text-muted">{status.text}</span>
      </div>

      <p className="mt-1 truncate text-sm text-text-muted">{api.url}</p>

      {api.lastChecked && (
        <p className="mt-1 text-xs text-text-muted">
          Last checked: {new Date(api.lastChecked).toLocaleString()}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onTest(api)}
          className="rounded-md bg-surface-elevated px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
        >
          Test
        </button>
        <button
          onClick={() => onEdit(api)}
          className="rounded-md bg-surface-elevated px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
        >
          Edit
        </button>
        <button
          onClick={() => onRemove(api.id)}
          className="rounded-md bg-surface-elevated px-2 py-1 text-xs text-status-error hover:text-red-300"
        >
          Remove
        </button>
      </div>
    </article>
  )
}
