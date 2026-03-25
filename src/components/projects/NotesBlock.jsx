import { useState, useCallback } from 'react'

function parseNotes(content) {
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // not JSON yet
  }
  return []
}

export default function NotesBlock({ block, onUpdate }) {
  const [notes, setNotes] = useState(() => parseNotes(block.content))
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const persist = useCallback(
    (updated) => {
      setNotes(updated)
      onUpdate(block.id, { content: JSON.stringify(updated) })
    },
    [block.id, onUpdate]
  )

  function handleAdd() {
    if (!inputValue.trim()) return
    const note = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    persist([note, ...notes])
    setInputValue('')
  }

  function handleDelete(id) {
    persist(notes.filter((n) => n.id !== id))
  }

  function startEdit(note) {
    setEditingId(note.id)
    setEditValue(note.text)
  }

  function commitEdit() {
    if (!editValue.trim()) {
      setEditingId(null)
      return
    }
    persist(
      notes.map((n) =>
        n.id === editingId
          ? { ...n, text: editValue.trim(), updatedAt: new Date().toISOString() }
          : n
      )
    )
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden">
      {/* Add note input */}
      <div className="flex gap-2">
        <label htmlFor={`note-input-${block.id}`} className="sr-only">
          New note
        </label>
        <input
          id={`note-input-${block.id}`}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
          }}
          placeholder="Add a note..."
          className="flex-1 rounded-lg border border-surface-overlay bg-surface-base px-2 py-1.5 text-xs text-text-primary placeholder-text-muted focus:border-brand-500 focus:outline-none"
        />
        <button
          onClick={handleAdd}
          aria-label="Add note"
          className="rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand-700"
        >
          Add
        </button>
      </div>

      {/* Notes list */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {notes.length === 0 && (
          <p className="py-4 text-center text-xs italic text-text-muted">
            No notes yet. Add one above.
          </p>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className="rounded-lg border border-surface-overlay bg-surface-base px-3 py-2"
          >
            {editingId === note.id ? (
              <textarea
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    commitEdit()
                  }
                  if (e.key === 'Escape') cancelEdit()
                }}
                aria-label="Edit note"
                className="w-full resize-none rounded border border-brand-500 bg-surface-elevated px-2 py-1 text-xs text-text-primary focus:outline-none"
                rows={2}
              />
            ) : (
              <>
                <p className="text-xs leading-relaxed text-text-primary whitespace-pre-wrap">
                  {note.text}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[10px] text-text-muted">
                    {new Date(note.createdAt).toLocaleString()}
                    {note.updatedAt !== note.createdAt && ' (edited)'}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => startEdit(note)}
                      aria-label={`Edit note from ${new Date(note.createdAt).toLocaleString()}`}
                      className="text-[10px] text-brand-400 hover:text-brand-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      aria-label={`Delete note from ${new Date(note.createdAt).toLocaleString()}`}
                      className="text-[10px] text-status-error hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
