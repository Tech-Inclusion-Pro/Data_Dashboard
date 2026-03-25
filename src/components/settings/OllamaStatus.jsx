import { useState, useEffect } from 'react'
import { useOllama } from '../../hooks/useOllama'
import LoadingSpinner from '../shared/LoadingSpinner'

export default function OllamaStatus() {
  const { checkHealth } = useOllama()
  const [health, setHealth] = useState(null)
  const [checking, setChecking] = useState(false)

  async function doCheck() {
    setChecking(true)
    const result = await checkHealth()
    setHealth(result)
    setChecking(false)
  }

  useEffect(() => {
    doCheck()
  }, [])

  return (
    <div className="rounded-xl border border-surface-overlay bg-surface-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary">Ollama Status</h3>
        <button
          onClick={doCheck}
          disabled={checking}
          className="rounded-md bg-surface-elevated px-2 py-1 text-xs text-text-secondary hover:text-text-primary disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {checking ? (
        <div className="mt-3">
          <LoadingSpinner label="Checking Ollama…" size="sm" />
        </div>
      ) : health ? (
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-muted">Connection</dt>
            <dd className={health.ok ? 'text-status-success' : 'text-status-error'}>
              {health.ok ? 'Connected' : 'Offline'}
            </dd>
          </div>
          {health.latency !== null && (
            <div className="flex justify-between">
              <dt className="text-text-muted">Latency</dt>
              <dd className="text-text-secondary">{health.latency}ms</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-text-muted">Models</dt>
            <dd className="text-text-secondary">{health.models?.length || 0}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  )
}
