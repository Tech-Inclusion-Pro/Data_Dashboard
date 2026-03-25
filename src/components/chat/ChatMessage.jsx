import AIBadge from '../shared/AIBadge'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-brand-600 text-white'
            : 'border border-surface-overlay bg-surface-elevated text-text-primary'
        }`}
      >
        {!isUser && (
          <div className="mb-1">
            <AIBadge />
          </div>
        )}
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
      </div>
    </div>
  )
}
