import { useSettingsStore } from '../../store/settingsStore'
import OllamaStatus from './OllamaStatus'
import ModelSelector from './ModelSelector'
import SystemPromptEditor from './SystemPromptEditor'

export default function SettingsView() {
  const { ollamaUrl, setOllamaUrl } = useSettingsStore()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">Settings</h2>

      <OllamaStatus />

      <div className="rounded-xl border border-surface-overlay bg-surface-card p-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="ollama-url" className="block text-sm font-medium text-text-primary">
            Ollama URL
          </label>
          <input
            id="ollama-url"
            type="text"
            value={ollamaUrl}
            onChange={(e) => setOllamaUrl(e.target.value)}
            className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-focus-ring"
          />
          <p className="text-xs text-text-muted">
            Default: /ollama (proxied to localhost:11434)
          </p>
        </div>

        <ModelSelector />
        <SystemPromptEditor />
      </div>
    </div>
  )
}
