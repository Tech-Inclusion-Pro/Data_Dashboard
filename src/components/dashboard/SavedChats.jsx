import { useChatStore } from '../../store/chatStore'

export default function SavedChats() {
  const savedChats = useChatStore((s) => s.savedChats)
  const loadSavedChat = useChatStore((s) => s.loadSavedChat)
  const removeSavedChat = useChatStore((s) => s.removeSavedChat)

  if (savedChats.length === 0) return null

  return (
    <section aria-label="Saved chats">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">
        Saved Chats ({savedChats.length})
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {savedChats.map((chat) => (
          <div
            key={chat.id}
            className="rounded-xl border border-surface-overlay bg-surface-card p-4"
          >
            <h4 className="truncate text-sm font-medium text-text-primary">
              {chat.title}
            </h4>
            <p className="mt-1 text-xs text-text-muted">
              {chat.messageCount} messages &middot;{' '}
              {new Date(chat.savedAt).toLocaleDateString()}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => loadSavedChat(chat.id)}
                className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700"
              >
                Load in Chat
              </button>
              <button
                onClick={() => removeSavedChat(chat.id)}
                className="rounded-md border border-surface-overlay px-2.5 py-1 text-xs text-text-muted hover:border-status-error/30 hover:text-status-error"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
