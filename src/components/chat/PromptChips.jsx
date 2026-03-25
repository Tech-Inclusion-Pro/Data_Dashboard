const presets = [
  'Summarize data trends',
  'Identify potential risks',
  'Suggest process improvements',
  'Analyze key patterns',
]

export default function PromptChips({ onSelect }) {
  return (
    <div role="group" aria-label="Suggested prompts" className="flex flex-wrap gap-2">
      {presets.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-surface-overlay bg-surface-elevated px-3 py-1 text-xs text-text-secondary transition-colors hover:border-brand-500/50 hover:text-brand-300"
        >
          {prompt}
        </button>
      ))}
    </div>
  )
}
