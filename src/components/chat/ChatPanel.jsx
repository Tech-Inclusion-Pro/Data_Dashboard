import { useState, useRef, useEffect } from 'react'
import { useOllama } from '../../hooks/useOllama'
import { useChatStore } from '../../store/chatStore'
import { useProjectStore } from '../../store/projectStore'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import PromptChips from './PromptChips'
import SaveChatDialog from './SaveChatDialog'

export default function ChatPanel() {
  const messages = useChatStore((s) => s.messages)
  const setMessages = useChatStore((s) => s.setMessages)
  const clearMessages = useChatStore((s) => s.clearMessages)
  const saveChat = useChatStore((s) => s.saveChat)
  const saveChatToProject = useProjectStore((s) => s.saveChatToProject)
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const { streamChat, abort } = useOllama()
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streamingContent])

  async function handleSend(text) {
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setStreaming(true)
    setStreamingContent('')

    try {
      let full = ''
      const generator = streamChat(newMessages)
      for await (const token of generator) {
        full += token
        setStreamingContent(full)
      }
      setMessages([...newMessages, { role: 'assistant', content: full }])
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: `Error: ${err.message}` },
        ])
      }
    } finally {
      setStreaming(false)
      setStreamingContent('')
    }
  }

  function handleStop() {
    abort()
    if (streamingContent) {
      setMessages([
        ...messages,
        { role: 'assistant', content: streamingContent + ' [stopped]' },
      ])
    }
    setStreaming(false)
    setStreamingContent('')
  }

  function handleClear() {
    clearMessages()
    setStreamingContent('')
  }

  function handleSave() {
    setShowSaveDialog(true)
  }

  function handleSaveGlobal(title) {
    saveChat(title)
  }

  function handleSaveToProject(projectId, title) {
    saveChatToProject(projectId, title, messages)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-surface-overlay px-4 py-3">
        <h2 className="text-sm font-semibold text-text-primary">AI Chat</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={messages.length === 0 || streaming}
            className="text-xs text-brand-400 hover:text-brand-300 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={handleClear}
            disabled={messages.length === 0 && !streaming}
            className="text-xs text-text-muted hover:text-text-primary disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages.length === 0 && !streaming && (
          <div className="space-y-4 py-8">
            <p className="text-center text-sm text-text-muted">
              Ask questions about your data.
            </p>
            <PromptChips onSelect={handleSend} />
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {streaming && streamingContent && (
          <ChatMessage message={{ role: 'assistant', content: streamingContent }} />
        )}
      </div>

      <div className="border-t border-surface-overlay p-4">
        {streaming && (
          <button
            onClick={handleStop}
            className="mb-2 w-full rounded-lg border border-status-error/30 bg-status-error/10 py-1.5 text-sm text-status-error hover:bg-status-error/20"
          >
            Stop generating
          </button>
        )}
        <ChatInput onSend={handleSend} disabled={streaming} />
      </div>

      {showSaveDialog && (
        <SaveChatDialog
          onClose={() => setShowSaveDialog(false)}
          onSaveGlobal={handleSaveGlobal}
          onSaveToProject={handleSaveToProject}
        />
      )}
    </div>
  )
}
