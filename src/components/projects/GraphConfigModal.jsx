import { useState } from 'react'
import FocusTrap from '../shared/FocusTrap'
import { useOllama } from '../../hooks/useOllama'

const CHART_TYPES = ['bar', 'line', 'pie', 'area']

export default function GraphConfigModal({ onClose, onSave }) {
  const { generate } = useOllama()
  const [metrics, setMetrics] = useState('')
  const [description, setDescription] = useState('')
  const [chartType, setChartType] = useState('bar')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleGenerate(e) {
    e.preventDefault()
    if (!metrics.trim()) return

    setLoading(true)
    setError(null)

    const prompt = `You are a data visualization assistant. Generate chart configuration as a JSON object.

User wants to track: ${metrics}
Description: ${description || 'Not specified'}
Chart type: ${chartType}
Additional notes: ${notes || 'None'}

Respond ONLY with a valid JSON object (no markdown, no explanation) in this exact shape:
{
  "chartType": "${chartType}",
  "title": "short descriptive title",
  "data": [{"name": "label1", "value": 10}, {"name": "label2", "value": 20}],
  "xKey": "name",
  "yKey": "value",
  "colors": ["#a67dff", "#34d399", "#fbbf24", "#60a5fa", "#f87171"]
}

Generate realistic sample data (5-8 data points) based on the metrics described.`

    try {
      const result = await generate(prompt)
      // Extract JSON from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No valid JSON in AI response')
      const config = JSON.parse(jsonMatch[0])
      config.generatedAt = new Date().toISOString()
      onSave(config)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to generate chart configuration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <FocusTrap>
        <dialog
          open
          aria-labelledby="graph-config-title"
          className="my-auto w-full max-w-md rounded-xl border border-surface-overlay bg-surface-card p-6 shadow-xl"
          onKeyDown={(e) => e.key === 'Escape' && !loading && onClose()}
        >
          <h2 id="graph-config-title" className="mb-4 text-lg font-semibold text-text-primary">
            Configure Chart
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label htmlFor="graph-metrics" className="block text-sm font-medium text-text-primary mb-1">
                What metrics are you following?
              </label>
              <input
                id="graph-metrics"
                type="text"
                required
                value={metrics}
                onChange={(e) => setMetrics(e.target.value)}
                placeholder="e.g., Accommodation requests by type"
                className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="graph-description" className="block text-sm font-medium text-text-primary mb-1">
                What would you like to see?
              </label>
              <textarea
                id="graph-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Describe the visualization you want..."
                className="w-full resize-none rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="graph-chart-type" className="block text-sm font-medium text-text-primary mb-1">
                Chart Type
              </label>
              <select
                id="graph-chart-type"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary"
              >
                {CHART_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Chart</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="graph-notes" className="block text-sm font-medium text-text-primary mb-1">
                Optional Notes
              </label>
              <textarea
                id="graph-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any additional context..."
                className="w-full resize-none rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand-500 focus:outline-none"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-surface-overlay px-4 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {loading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </form>
        </dialog>
      </FocusTrap>
    </div>
  )
}
