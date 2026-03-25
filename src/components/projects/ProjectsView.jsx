import { useState } from 'react'
import { useProjectStore } from '../../store/projectStore'

export default function ProjectsView({ onOpenProject }) {
  const projects = useProjectStore((s) => s.projects)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const createProject = useProjectStore((s) => s.createProject)
  const switchProject = useProjectStore((s) => s.switchProject)
  const deleteProject = useProjectStore((s) => s.deleteProject)
  const renameProject = useProjectStore((s) => s.renameProject)
  const saveActiveProject = useProjectStore((s) => s.saveActiveProject)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    createProject(newName.trim())
    setNewName('')
  }

  function startRename(project) {
    setEditingId(project.id)
    setEditName(project.name)
  }

  function commitRename(id) {
    if (editName.trim()) {
      renameProject(id, editName.trim())
    }
    setEditingId(null)
    setEditName('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">Projects</h2>
        {activeProjectId && (
          <button
            onClick={saveActiveProject}
            className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Save Current Project
          </button>
        )}
      </div>

      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New project name…"
          className="flex-1 rounded-lg border border-surface-overlay bg-surface-elevated px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Create Project
        </button>
      </form>

      {projects.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-surface-overlay py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <p className="mt-3 text-text-secondary">No projects yet</p>
          <p className="mt-1 text-sm text-text-muted">
            Create a project to save your workspace — insights, chats, and layout.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const isActive = project.id === activeProjectId
            const snap = project.snapshot || {}
            return (
              <div
                key={project.id}
                className={`rounded-xl border p-5 transition-colors ${
                  isActive
                    ? 'border-brand-500/50 bg-brand-500/5'
                    : 'border-surface-overlay bg-surface-card'
                }`}
              >
                <div className="flex items-start justify-between">
                  {editingId === project.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => commitRename(project.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(project.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="rounded border border-surface-overlay bg-surface-elevated px-2 py-0.5 text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                    />
                  ) : (
                    <h3 className="text-sm font-semibold text-text-primary">
                      {project.name}
                    </h3>
                  )}
                  {isActive && (
                    <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-medium text-white">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1 text-xs text-text-muted">
                  <p>
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                  <p>
                    {snap.insights?.length || 0} insights &middot;{' '}
                    {snap.savedChats?.length || 0} saved chats &middot;{' '}
                    {snap.messages?.length || 0} messages
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => onOpenProject?.(project.id)}
                    className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700"
                  >
                    Open
                  </button>
                  {!isActive && (
                    <button
                      onClick={() => switchProject(project.id)}
                      className="rounded-md border border-brand-500/50 px-2.5 py-1 text-xs font-medium text-brand-400 hover:bg-brand-500/10"
                    >
                      Switch
                    </button>
                  )}
                  <button
                    onClick={() => startRename(project)}
                    className="rounded-md border border-surface-overlay px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${project.name}"?`)) {
                        deleteProject(project.id)
                      }
                    }}
                    className="rounded-md border border-surface-overlay px-2.5 py-1 text-xs text-text-muted hover:border-status-error/30 hover:text-status-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
