export default function PanelLayout({ children, chatPanel, chatOpen }) {
  return (
    <div className="flex min-h-0 flex-1">
      <main id="main-content" className="min-h-0 flex-1 overflow-y-auto p-6">
        {children}
      </main>
      {chatOpen && (
        <aside
          id="chat-panel"
          className="w-96 border-l border-surface-overlay bg-surface-card"
          aria-label="AI Chat"
        >
          {chatPanel}
        </aside>
      )}
    </div>
  )
}
