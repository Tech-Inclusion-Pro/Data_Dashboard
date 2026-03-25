import { useState, useCallback } from 'react'
import { useOllama } from '../../hooks/useOllama'
import { useProjectStore } from '../../store/projectStore'

function gatherBlockContent(project, currentBlockId) {
  const sections = []
  for (const block of project.blocks || []) {
    if (block.id === currentBlockId) continue
    if (!block.content) continue

    let text = ''
    switch (block.type) {
      case 'notes': {
        try {
          const notes = JSON.parse(block.content)
          if (Array.isArray(notes)) {
            text = notes.map((n) => n.text).join('\n')
          } else {
            text = block.content
          }
        } catch {
          text = block.content
        }
        break
      }
      case 'tasks': {
        try {
          const tasks = JSON.parse(block.content)
          if (Array.isArray(tasks)) {
            text = tasks.map((t) => `${t.title} [${t.priority}/${t.status}]${t.description ? ': ' + t.description : ''}`).join('\n')
          }
        } catch { /* empty */ }
        break
      }
      case 'previous-chats': {
        try {
          const chats = JSON.parse(block.content)
          if (Array.isArray(chats)) {
            text = chats.map((c) => {
              const msgs = (c.messages || []).map((m) => `${m.role}: ${m.content}`).join('\n')
              return `Chat: ${c.title}\n${msgs}`
            }).join('\n---\n')
          }
        } catch { /* empty */ }
        break
      }
      case 'graphs': {
        try {
          const config = JSON.parse(block.content)
          if (config?.data) {
            text = `Chart: ${config.title || config.chartType}\nData: ${JSON.stringify(config.data)}`
          }
        } catch { /* empty */ }
        break
      }
      default:
        text = block.content
    }

    if (text) {
      sections.push(`[${block.type}: ${block.title}]\n${text}`)
    }
  }
  return sections.join('\n\n')
}

export default function ProjectInsightsBlock({ block, projectId, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [focusArea, setFocusArea] = useState('')
  const { generate } = useOllama()
  const projects = useProjectStore((s) => s.projects)
  const project = projects.find((p) => p.id === projectId)

  const handleGenerate = useCallback(async () => {
    if (!project) return
    setLoading(true)
    try {
      const content = gatherBlockContent(project, block.id)
      const prompt = `You are analyzing a project called "${project.name}". Below is the content from all blocks in this project.

${content || 'No other block content available.'}

${focusArea ? `Focus area: ${focusArea}` : ''}

Provide a comprehensive cross-block analysis covering:
1. **Key Themes** — recurring topics and patterns across all blocks
2. **Concerns** — risks, issues, or gaps identified
3. **Patterns** — data trends or behavioral patterns
4. **Common Questions** — questions that emerge from the data

Be concise but thorough. Use bullet points where appropriate.`

      const result = await generate(prompt)
      onUpdate(block.id, { content: result })
    } catch {
      onUpdate(block.id, { content: 'Failed to generate insights. Check your AI connection.' })
    } finally {
      setLoading(false)
    }
  }, [project, block.id, focusArea, generate, onUpdate])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <p className="text-xs text-text-muted">Analyzing project blocks…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden">
      {block.content ? (
        <>
          <div className="flex-1 overflow-y-auto text-xs leading-relaxed text-text-secondary whitespace-pre-wrap">
            {block.content}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              className="self-start rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand-700"
            >
              Regenerate
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <p className="text-xs text-text-muted">Generate AI insights across all project blocks.</p>
          <div className="w-full max-w-xs">
            <label htmlFor={`focus-${block.id}`} className="mb-1 block text-[11px] font-medium text-text-muted">
              Focus area (optional)
            </label>
            <input
              id={`focus-${block.id}`}
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="e.g., risk patterns, data quality…"
              className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-1.5 text-xs text-text-primary placeholder-text-muted focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleGenerate}
            className="rounded-md bg-brand-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-brand-700"
          >
            Generate Insights
          </button>
        </div>
      )}
    </div>
  )
}
