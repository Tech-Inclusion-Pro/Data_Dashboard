import { useState, useEffect } from 'react'
import { useOllama } from '../../hooks/useOllama'
import { useProjectStore } from '../../store/projectStore'
import logoImg from '../../assets/logo.png'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
  { id: 'projects', label: 'Projects', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { id: 'api-manager', label: 'API Manager', icon: 'M5 12h14M12 5l7 7-7 7' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

export default function Sidebar({ currentView, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false)
  const [ollamaOk, setOllamaOk] = useState(null)
  const { checkHealth } = useOllama()
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const projects = useProjectStore((s) => s.projects)
  const activeProject = projects.find((p) => p.id === activeProjectId)

  useEffect(() => {
    checkHealth().then((h) => setOllamaOk(h.ok))
    const interval = setInterval(() => {
      checkHealth().then((h) => setOllamaOk(h.ok))
    }, 30000)
    return () => clearInterval(interval)
  }, [checkHealth])

  return (
    <nav
      aria-label="Main navigation"
      className={`flex h-full flex-col border-r border-surface-overlay bg-surface-card transition-all ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <img
          src={logoImg}
          alt="Data Dashboard"
          className={`${collapsed ? 'h-8 w-8' : 'h-10 w-10'} rounded-full object-contain`}
        />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-md p-1 text-text-muted hover:bg-surface-elevated hover:text-text-primary"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7M19 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      <ul className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onNavigate(item.id)}
              aria-current={currentView === item.id ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                currentView === item.id
                  ? 'bg-brand-500/20 text-brand-300'
                  : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
              }`}
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {!collapsed && <span>{item.label}</span>}
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-surface-overlay p-4">
        {activeProject && !collapsed && (
          <p className="mb-2 truncate text-xs font-medium text-brand-300" title={activeProject.name}>
            {activeProject.name}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              ollamaOk === true
                ? 'bg-status-success animate-pulse-dot'
                : ollamaOk === false
                ? 'bg-status-error'
                : 'bg-text-muted'
            }`}
            aria-hidden="true"
          />
          {!collapsed && (
            <span className="text-xs text-text-muted">
              Ollama {ollamaOk === true ? 'Connected' : ollamaOk === false ? 'Offline' : 'Checking…'}
            </span>
          )}
        </div>
      </div>
    </nav>
  )
}
