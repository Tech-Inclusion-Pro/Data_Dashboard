import { useState, useCallback } from 'react'
import { useOllama } from '../../hooks/useOllama'
import { useProjectStore } from '../../store/projectStore'
import { useChatStore } from '../../store/chatStore'
import NotesBlock from './NotesBlock'
import TasksBlock from './TasksBlock'
import GraphsBlock from './GraphsBlock'
import ProjectInsightsBlock from './ProjectInsightsBlock'
import GraphConfigModal from './GraphConfigModal'
import ExportButton from '../shared/ExportButton'
import BlockExpandModal from './BlockExpandModal'

const AI_BLOCK_TYPES = ['general-analysis', 'risk-summary', 'recommendations']

const PROMPTS = {
  'general-analysis':
    'Provide a concise general analysis summary for this data project. Cover key patterns, trends, and notable findings in 3-4 paragraphs.',
  'risk-summary':
    'Identify and summarize the top risk flags for this project. List each risk with severity and a brief explanation.',
  recommendations:
    'Generate actionable recommendations based on the data analysis. Provide 5-7 specific action items with brief rationale.',
}

export default function WorkspaceBlock({ block, projectId, onDelete, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [graphModalOpen, setGraphModalOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const { generate } = useOllama()
  const projects = useProjectStore((s) => s.projects)
  const project = projects.find((p) => p.id === projectId)
  const snap = project?.snapshot || {}
  const loadExternalChat = useChatStore((s) => s.loadExternalChat)

  const handleRegenerate = useCallback(async () => {
    const prompt = PROMPTS[block.type]
    if (!prompt) return
    setLoading(true)
    try {
      const result = await generate(prompt)
      onUpdate(block.id, { content: result })
    } catch {
      onUpdate(block.id, { content: 'Failed to generate content. Check your AI connection.' })
    } finally {
      setLoading(false)
    }
  }, [block.type, block.id, generate, onUpdate])

  function getBlockExportData() {
    switch (block.type) {
      case 'notes': {
        try {
          const notes = JSON.parse(block.content)
          if (Array.isArray(notes)) return notes.map((n) => ({ text: n.text, created: n.createdAt, updated: n.updatedAt }))
        } catch { /* empty */ }
        return block.content || ''
      }
      case 'tasks': {
        try {
          const tasks = JSON.parse(block.content)
          if (Array.isArray(tasks)) return tasks.map((t) => ({ title: t.title, description: t.description, priority: t.priority, status: t.status, dueDate: t.dueDate }))
        } catch { /* empty */ }
        return []
      }
      case 'graphs': {
        try {
          const config = JSON.parse(block.content)
          if (config?.data) return config.data
        } catch { /* empty */ }
        return snap.accommodationTrends || []
      }
      case 'previous-chats': {
        let chats = []
        try {
          const parsed = JSON.parse(block.content)
          if (Array.isArray(parsed)) chats = parsed
        } catch { /* empty */ }
        return [...chats, ...(snap.savedChats || [])].map((c) => ({
          title: c.title,
          messageCount: c.messages?.length || c.messageCount || 0,
          savedAt: c.savedAt || c.createdAt,
        }))
      }
      case 'project-insights':
        return block.content || ''
      default:
        return block.content || ''
    }
  }

  function renderContent() {
    if (loading) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      )
    }

    switch (block.type) {
      case 'general-analysis':
      case 'risk-summary':
      case 'recommendations':
        return (
          <div className="flex flex-1 flex-col gap-2 overflow-hidden">
            <div className="flex-1 overflow-y-auto text-xs leading-relaxed text-text-secondary whitespace-pre-wrap">
              {block.content || (
                <span className="italic text-text-muted">No content yet. Click Regenerate.</span>
              )}
            </div>
            <button
              onClick={handleRegenerate}
              className="self-start rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand-700"
            >
              Regenerate
            </button>
          </div>
        )

      case 'graphs': {
        // Check if block has AI-generated chart config
        let hasConfig = false
        try {
          const parsed = JSON.parse(block.content)
          if (parsed && parsed.chartType) hasConfig = true
        } catch { /* empty */ }

        if (hasConfig) {
          return (
            <GraphsBlock
              block={block}
              onConfigure={() => setGraphModalOpen(true)}
            />
          )
        }

        // Fallback: static bar chart from snapshot
        const trends = snap.accommodationTrends || []
        if (trends.length === 0) {
          return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <p className="text-xs text-text-muted">No chart data available.</p>
              <button
                onClick={() => setGraphModalOpen(true)}
                className="rounded-md bg-brand-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-brand-700"
                aria-label="Configure chart"
              >
                Configure Chart
              </button>
            </div>
          )
        }
        const maxVal = Math.max(...trends.map((t) => t.count || t.value || 0), 1)
        return (
          <div className="flex flex-1 flex-col gap-2 overflow-hidden">
            <div className="flex flex-1 items-end gap-1 px-2 pb-2">
              {trends.map((t, i) => {
                const val = t.count || t.value || 0
                const height = Math.max((val / maxVal) * 100, 4)
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-brand-500"
                      style={{ height: `${height}%` }}
                      title={`${t.label || t.name || `#${i + 1}`}: ${val}`}
                    />
                    <span className="truncate text-[9px] text-text-muted">
                      {t.label || t.name || ''}
                    </span>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => setGraphModalOpen(true)}
              className="self-start rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand-700"
              aria-label="Configure chart with AI"
            >
              Configure with AI
            </button>
          </div>
        )
      }

      case 'previous-chats': {
        // Merge chats from block content (project-saved) and snapshot (global)
        let blockChats = []
        try {
          const parsed = JSON.parse(block.content)
          if (Array.isArray(parsed)) blockChats = parsed
        } catch { /* empty */ }
        const snapshotChats = snap.savedChats || []
        const blockChatIds = new Set(blockChats.map((c) => c.id))
        // Deduplicate by id, prefer block chats
        const seen = new Set()
        const merged = []
        for (const chat of [...blockChats, ...snapshotChats]) {
          const key = chat.id || `fallback-${merged.length}`
          if (!seen.has(key)) {
            seen.add(key)
            merged.push(chat)
          }
        }
        merged.sort((a, b) => new Date(b.savedAt || b.createdAt || 0) - new Date(a.savedAt || a.createdAt || 0))

        if (merged.length === 0) {
          return (
            <div className="flex flex-1 items-center justify-center text-xs text-text-muted">
              No saved chats in this project
            </div>
          )
        }
        return (
          <div className="flex-1 space-y-1.5 overflow-y-auto">
            {merged.map((chat, i) => (
              <div
                key={chat.id || i}
                className="rounded-lg border border-surface-overlay bg-surface-base px-3 py-2"
              >
                <p className="text-xs font-medium text-text-primary">
                  {chat.title || chat.name || `Chat ${i + 1}`}
                </p>
                <p className="text-[10px] text-text-muted">
                  {chat.messages?.length || chat.messageCount || 0} messages
                  {(chat.savedAt || chat.createdAt) &&
                    ` · ${new Date(chat.savedAt || chat.createdAt).toLocaleDateString()}`}
                </p>
                <div className="mt-1.5 flex gap-1.5">
                  {chat.messages && chat.messages.length > 0 && (
                    <button
                      onClick={() => loadExternalChat(chat.title, chat.messages)}
                      className="rounded bg-brand-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-brand-700"
                    >
                      Load in Chat
                    </button>
                  )}
                  {blockChatIds.has(chat.id) && (
                    <button
                      onClick={() => {
                        const updated = blockChats.filter((c) => c.id !== chat.id)
                        onUpdate(block.id, { content: JSON.stringify(updated) })
                      }}
                      className="rounded bg-status-error/10 px-2 py-0.5 text-[10px] font-medium text-status-error hover:bg-status-error/20"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }

      case 'notes':
        return <NotesBlock block={block} onUpdate={onUpdate} />

      case 'tasks':
        return <TasksBlock block={block} onUpdate={onUpdate} />

      case 'project-insights':
        return <ProjectInsightsBlock block={block} projectId={projectId} onUpdate={onUpdate} />

      default:
        return (
          <div className="flex flex-1 items-center justify-center text-xs text-text-muted">
            Unknown block type
          </div>
        )
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-surface-overlay bg-surface-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-400">
            {block.type}
          </span>
          <h4 className="text-sm font-semibold text-text-primary">{block.title}</h4>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setExpanded(true)}
            className="rounded-md p-0.5 text-text-muted hover:text-brand-400 focus-visible:outline-2 focus-visible:outline-focus-ring"
            aria-label={`Expand ${block.title} to full view`}
            title="Expand"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
          <ExportButton
            data={getBlockExportData()}
            filenameBase={`${block.type}-${block.id}`}
          />
          <button
            onClick={() => onDelete(block.id)}
            className="rounded-md p-0.5 text-text-muted hover:text-status-error focus-visible:outline-2 focus-visible:outline-focus-ring"
            aria-label={`Delete ${block.title}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {renderContent()}

      {graphModalOpen && (
        <GraphConfigModal
          onClose={() => setGraphModalOpen(false)}
          onSave={(config) => onUpdate(block.id, { content: JSON.stringify(config) })}
        />
      )}

      {expanded && (
        <BlockExpandModal
          block={block}
          projectId={projectId}
          snap={snap}
          onUpdate={onUpdate}
          onClose={() => setExpanded(false)}
          onOpenGraphConfig={() => {
            setExpanded(false)
            setGraphModalOpen(true)
          }}
        />
      )}
    </div>
  )
}

export { AI_BLOCK_TYPES, PROMPTS }
