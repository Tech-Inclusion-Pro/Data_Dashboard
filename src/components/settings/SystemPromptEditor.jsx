import { useState, useEffect } from 'react'
import { useSettingsStore } from '../../store/settingsStore'

const DEFAULT_PROMPT =
  'You are an AI assistant for data analysis. Provide clear, actionable insights about trends, risks, and patterns in the uploaded data.'

export default function SystemPromptEditor() {
  const { systemPrompt, setSystemPrompt } = useSettingsStore()
  const [draft, setDraft] = useState(systemPrompt)

  useEffect(() => {
    setDraft(systemPrompt)
  }, [systemPrompt])

  const hasChanges = draft !== systemPrompt

  return (
    <div className="space-y-2">
      <label htmlFor="system-prompt" className="block text-sm font-medium text-text-primary">
        System Prompt
      </label>
      <textarea
        id="system-prompt"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={6}
        className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-focus-ring"
        placeholder="Enter system prompt…"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">{draft.length} characters</span>
        <div className="flex gap-2">
          <button
            onClick={() => setDraft(DEFAULT_PROMPT)}
            className="rounded-md px-3 py-1 text-xs text-text-muted hover:text-text-primary"
          >
            Reset
          </button>
          <button
            onClick={() => setSystemPrompt(draft)}
            disabled={!hasChanges}
            className="rounded-md bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
