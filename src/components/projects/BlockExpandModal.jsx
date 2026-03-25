import { useEffect, useRef } from 'react'
import FocusTrap from '../shared/FocusTrap'
import { useChatStore } from '../../store/chatStore'
import NotesBlock from './NotesBlock'
import TasksBlock from './TasksBlock'
import GraphsBlock from './GraphsBlock'

export default function BlockExpandModal({ block, projectId, snap, onUpdate, onClose, onOpenGraphConfig }) {
  const loadExternalChat = useChatStore((s) => s.loadExternalChat)
  const previousFocus = useRef(null)

  useEffect(() => {
    previousFocus.current = document.activeElement
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      previousFocus.current?.focus()
    }
  }, [])

  function renderExpandedContent() {
    switch (block.type) {
      case 'general-analysis':
      case 'risk-summary':
      case 'recommendations':
        return (
          <div className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
            {block.content || (
              <span className="italic text-text-muted">No content yet.</span>
            )}
          </div>
        )

      case 'graphs': {
        let hasConfig = false
        let config = null
        try {
          const parsed = JSON.parse(block.content)
          if (parsed && parsed.chartType) {
            hasConfig = true
            config = parsed
          }
        } catch { /* empty */ }

        if (hasConfig) {
          return (
            <div className="flex flex-col" style={{ height: '500px' }}>
              <GraphsBlock
                block={block}
                onConfigure={onOpenGraphConfig}
              />
            </div>
          )
        }

        const trends = snap.accommodationTrends || []
        if (trends.length === 0) {
          return (
            <p className="text-sm text-text-muted">No chart data available.</p>
          )
        }
        const maxVal = Math.max(...trends.map((t) => t.count || t.value || 0), 1)
        return (
          <div className="flex items-end gap-3 px-4 pb-4" style={{ height: '400px' }}>
            {trends.map((t, i) => {
              const val = t.count || t.value || 0
              const height = Math.max((val / maxVal) * 100, 4)
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-brand-500"
                    style={{ height: `${height}%` }}
                    title={`${t.label || t.name || `#${i + 1}`}: ${val}`}
                  />
                  <span className="text-xs text-text-muted truncate">
                    {t.label || t.name || ''}
                  </span>
                </div>
              )
            })}
          </div>
        )
      }

      case 'previous-chats': {
        let blockChats = []
        try {
          const parsed = JSON.parse(block.content)
          if (Array.isArray(parsed)) blockChats = parsed
        } catch { /* empty */ }
        const blockChatIds = new Set(blockChats.map((c) => c.id))
        const snapshotChats = snap.savedChats || []
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
          return <p className="text-sm text-text-muted">No saved chats in this project.</p>
        }
        return (
          <div className="space-y-3">
            {merged.map((chat, i) => (
              <div
                key={chat.id || i}
                className="rounded-lg border border-surface-overlay bg-surface-base px-4 py-3"
              >
                <p className="text-sm font-medium text-text-primary">
                  {chat.title || chat.name || `Chat ${i + 1}`}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {chat.messages?.length || chat.messageCount || 0} messages
                  {(chat.savedAt || chat.createdAt) &&
                    ` · ${new Date(chat.savedAt || chat.createdAt).toLocaleDateString()}`}
                </p>
                <div className="mt-2 flex gap-2">
                  {chat.messages && chat.messages.length > 0 && (
                    <button
                      onClick={() => {
                        loadExternalChat(chat.title, chat.messages)
                        onClose()
                      }}
                      className="rounded bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700"
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
                      className="rounded bg-status-error/10 px-2.5 py-1 text-xs font-medium text-status-error hover:bg-status-error/20"
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
        return (
          <div className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
            {block.content || (
              <span className="italic text-text-muted">No insights generated yet.</span>
            )}
          </div>
        )

      default:
        return (
          <p className="text-sm text-text-muted">Unknown block type.</p>
        )
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <FocusTrap>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="expand-block-title"
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-surface-overlay bg-surface-card shadow-2xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-surface-overlay px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-brand-500/10 px-2 py-1 text-xs font-medium text-brand-400">
                {block.type}
              </span>
              <h2 id="expand-block-title" className="text-lg font-semibold text-text-primary">
                {block.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary focus-visible:outline-2 focus-visible:outline-focus-ring"
              aria-label="Close expanded view"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderExpandedContent()}
          </div>
        </div>
      </FocusTrap>
    </div>
  )
}
