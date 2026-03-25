import { useState } from 'react'
import FocusTrap from '../shared/FocusTrap'
import { useProjectStore } from '../../store/projectStore'

export default function SaveChatDialog({ onClose, onSaveGlobal, onSaveToProject }) {
  const projects = useProjectStore((s) => s.projects)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)

  const [title, setTitle] = useState('')
  const [target, setTarget] = useState(activeProjectId ? 'project' : 'global')
  const [selectedProjectId, setSelectedProjectId] = useState(activeProjectId || projects[0]?.id || '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    if (target === 'global') {
      onSaveGlobal(title.trim())
    } else {
      onSaveToProject(selectedProjectId, title.trim())
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <FocusTrap>
        <dialog
          open
          aria-labelledby="save-chat-title"
          className="my-auto w-full max-w-sm rounded-xl border border-surface-overlay bg-surface-card p-6 shadow-xl"
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
        >
          <h2 id="save-chat-title" className="mb-4 text-lg font-semibold text-text-primary">
            Save Chat
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="save-chat-name" className="block text-sm font-medium text-text-primary mb-1">
                Chat Title
              </label>
              <input
                id="save-chat-name"
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name this chat..."
                className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand-500 focus:outline-none"
              />
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-text-primary mb-2">
                Save to
              </legend>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="save-target"
                    value="global"
                    checked={target === 'global'}
                    onChange={() => setTarget('global')}
                    className="accent-brand-500"
                  />
                  <span className="text-sm text-text-secondary">Global Chats</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="save-target"
                    value="project"
                    checked={target === 'project'}
                    onChange={() => setTarget('project')}
                    disabled={projects.length === 0}
                    className="accent-brand-500"
                  />
                  <span className={`text-sm ${projects.length === 0 ? 'text-text-muted' : 'text-text-secondary'}`}>
                    Project
                  </span>
                </label>
              </div>
            </fieldset>

            {target === 'project' && projects.length > 0 && (
              <div>
                <label htmlFor="save-chat-project" className="block text-sm font-medium text-text-primary mb-1">
                  Select Project
                </label>
                <select
                  id="save-chat-project"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-surface-overlay px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Save
              </button>
            </div>
          </form>
        </dialog>
      </FocusTrap>
    </div>
  )
}
