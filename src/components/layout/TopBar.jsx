import { useRef } from 'react'
import { useProjectStore } from '../../store/projectStore'

export default function TopBar({ chatOpen, onToggleChat, onFileUpload }) {
  const fileInputRef = useRef(null)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const projects = useProjectStore((s) => s.projects)
  const activeProject = projects.find((p) => p.id === activeProjectId)

  function handleFileChange(e) {
    const files = Array.from(e.target.files)
    if (files.length > 0) onFileUpload(files)
    e.target.value = ''
  }

  return (
    <header className="flex items-center justify-between border-b border-surface-overlay bg-surface-card px-6 py-3">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-text-primary">
          Data Dashboard
        </h1>
        {activeProject && (
          <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-medium text-brand-300">
            {activeProject.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
        >
          Upload File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json,.txt"
          multiple
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload data file"
        />

        <button
          onClick={onToggleChat}
          aria-expanded={chatOpen}
          aria-controls="chat-panel"
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          {chatOpen ? 'Close Chat' : 'Open Chat'}
        </button>
      </div>
    </header>
  )
}
