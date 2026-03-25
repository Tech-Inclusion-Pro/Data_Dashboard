import { useEffect } from 'react'
import { useSettingsStore } from '../../store/settingsStore'
import { useOllama } from '../../hooks/useOllama'

export default function ModelSelector() {
  const { selectedModel, setSelectedModel, availableModels, setAvailableModels } =
    useSettingsStore()
  const { listModels } = useOllama()

  useEffect(() => {
    listModels().then((models) => {
      setAvailableModels(models)
    })
  }, [listModels, setAvailableModels])

  return (
    <div className="space-y-2">
      <label htmlFor="model-select" className="block text-sm font-medium text-text-primary">
        AI Model
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary focus-visible:outline-2 focus-visible:outline-focus-ring"
      >
        {availableModels.length === 0 && (
          <option value={selectedModel}>{selectedModel}</option>
        )}
        {availableModels.map((m) => (
          <option key={m.name} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-text-muted">
        {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available
      </p>
    </div>
  )
}
