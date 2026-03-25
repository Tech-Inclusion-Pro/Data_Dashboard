import { useState, useCallback } from 'react'

const PRIORITIES = ['low', 'medium', 'high', 'critical']
const STATUSES = ['not-started', 'in-progress', 'completed']

const PRIORITY_COLORS = {
  low: 'bg-[var(--color-severity-low)]/20 text-[var(--color-severity-low)]',
  medium: 'bg-[var(--color-severity-medium)]/20 text-[var(--color-severity-medium)]',
  high: 'bg-[var(--color-severity-high)]/20 text-[var(--color-severity-high)]',
  critical: 'bg-[var(--color-severity-critical)]/20 text-[var(--color-severity-critical)]',
}

const STATUS_LABELS = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

function parseTasks(content) {
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // not JSON yet
  }
  return []
}

export default function TasksBlock({ block, onUpdate }) {
  const [tasks, setTasks] = useState(() => parseTasks(block.content))
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'not-started',
    dueDate: '',
  })

  const persist = useCallback(
    (updated) => {
      setTasks(updated)
      onUpdate(block.id, { content: JSON.stringify(updated) })
    },
    [block.id, onUpdate]
  )

  function resetForm() {
    setForm({ title: '', description: '', priority: 'medium', status: 'not-started', dueDate: '' })
    setShowForm(false)
    setEditingId(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    const now = new Date().toISOString()

    if (editingId) {
      persist(
        tasks.map((t) =>
          t.id === editingId
            ? { ...t, ...form, title: form.title.trim(), description: form.description.trim(), updatedAt: now }
            : t
        )
      )
    } else {
      const task = {
        id: Date.now().toString(),
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || null,
        createdAt: now,
        updatedAt: now,
      }
      persist([...tasks, task])
    }
    resetForm()
  }

  function handleStatusChange(id, status) {
    persist(
      tasks.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      )
    )
  }

  function startEdit(task) {
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate || '',
    })
    setEditingId(task.id)
    setShowForm(true)
  }

  function handleDelete(id) {
    persist(tasks.filter((t) => t.id !== id))
  }

  const completed = tasks.filter((t) => t.status === 'completed').length
  const total = tasks.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden">
      {/* Progress bar */}
      {total > 0 && (
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-surface-overlay">
            <div
              className="h-2 rounded-full bg-brand-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-text-muted">
            {completed}/{total} ({pct}%)
          </span>
        </div>
      )}

      {/* Add Task toggle / form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-surface-overlay bg-surface-base p-2">
          <div>
            <label htmlFor={`task-title-${block.id}`} className="block text-[10px] font-medium text-text-secondary mb-0.5">
              Title
            </label>
            <input
              id={`task-title-${block.id}`}
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded border border-surface-overlay bg-surface-elevated px-2 py-1 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor={`task-desc-${block.id}`} className="block text-[10px] font-medium text-text-secondary mb-0.5">
              Description
            </label>
            <textarea
              id={`task-desc-${block.id}`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full resize-none rounded border border-surface-overlay bg-surface-elevated px-2 py-1 text-xs text-text-primary focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor={`task-priority-${block.id}`} className="block text-[10px] font-medium text-text-secondary mb-0.5">
                Priority
              </label>
              <select
                id={`task-priority-${block.id}`}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded border border-surface-overlay bg-surface-elevated px-2 py-1 text-xs text-text-primary"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor={`task-status-${block.id}`} className="block text-[10px] font-medium text-text-secondary mb-0.5">
                Status
              </label>
              <select
                id={`task-status-${block.id}`}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded border border-surface-overlay bg-surface-elevated px-2 py-1 text-xs text-text-primary"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor={`task-due-${block.id}`} className="block text-[10px] font-medium text-text-secondary mb-0.5">
                Due Date
              </label>
              <input
                id={`task-due-${block.id}`}
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full rounded border border-surface-overlay bg-surface-elevated px-2 py-1 text-xs text-text-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded px-2 py-1 text-[11px] text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand-700"
            >
              {editingId ? 'Save' : 'Add Task'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          aria-label="Add task"
          className="self-start rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand-700"
        >
          + Add Task
        </button>
      )}

      {/* Task list */}
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {tasks.length === 0 && !showForm && (
          <p className="py-4 text-center text-xs italic text-text-muted">
            No tasks yet.
          </p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-lg border border-surface-overlay bg-surface-base px-3 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}
                >
                  {task.priority}
                </span>
                <span
                  className={`text-xs font-medium text-text-primary truncate ${
                    task.status === 'completed' ? 'line-through opacity-60' : ''
                  }`}
                >
                  {task.title}
                </span>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => startEdit(task)}
                  aria-label={`Edit task ${task.title}`}
                  className="text-[10px] text-brand-400 hover:text-brand-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  aria-label={`Delete task ${task.title}`}
                  className="text-[10px] text-status-error hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
            {task.description && (
              <p className="mt-1 text-[10px] text-text-muted">{task.description}</p>
            )}
            <div className="mt-1.5 flex items-center gap-3">
              <label htmlFor={`status-${task.id}`} className="sr-only">
                Status for {task.title}
              </label>
              <select
                id={`status-${task.id}`}
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                className="rounded border border-surface-overlay bg-surface-elevated px-1.5 py-0.5 text-[10px] text-text-secondary"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              {task.dueDate && (
                <span className="text-[10px] text-text-muted">
                  Due: {task.dueDate}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
