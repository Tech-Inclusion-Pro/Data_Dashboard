import { useState, useCallback } from 'react'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import PanelLayout from './components/layout/PanelLayout'
import DashboardView from './components/dashboard/DashboardView'
import APIManager from './components/api-manager/APIManager'
import SettingsView from './components/settings/SettingsView'
import ProjectsView from './components/projects/ProjectsView'
import ProjectWorkspace from './components/projects/ProjectWorkspace'
import ChatPanel from './components/chat/ChatPanel'
import ErrorBoundary from './components/shared/ErrorBoundary'
import { useChatStore } from './store/chatStore'

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const chatOpen = useChatStore((s) => s.chatOpen)
  const toggleChat = useChatStore((s) => s.toggleChat)
  const [uploadedData, setUploadedData] = useState(null)
  const [openProjectId, setOpenProjectId] = useState(null)

  const handleOpenProject = useCallback((id) => {
    setOpenProjectId(id)
    setCurrentView('project-workspace')
  }, [])

  const handleFileUpload = useCallback((files) => {
    setUploadedData(files)
    setCurrentView('dashboard')
  }, [])

  function renderView() {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView uploadedFiles={uploadedData} onClearFiles={() => setUploadedData(null)} />
      case 'projects':
        return <ProjectsView onOpenProject={handleOpenProject} />
      case 'project-workspace':
        return (
          <ProjectWorkspace
            projectId={openProjectId}
            onBack={() => {
              setOpenProjectId(null)
              setCurrentView('projects')
            }}
          />
        )
      case 'api-manager':
        return <APIManager />
      case 'settings':
        return <SettingsView />
      default:
        return <DashboardView uploadedFiles={uploadedData} onClearFiles={() => setUploadedData(null)} />
    }
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-surface-base text-text-primary">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>

        <Sidebar currentView={currentView} onNavigate={setCurrentView} />

        <div className="flex min-h-0 flex-1 flex-col">
          <TopBar
            chatOpen={chatOpen}
            onToggleChat={toggleChat}
            onFileUpload={handleFileUpload}
          />

          <PanelLayout chatOpen={chatOpen} chatPanel={<ChatPanel />}>
            {renderView()}
          </PanelLayout>
        </div>

        {/* Global live region for announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" id="announcements" />
      </div>
    </ErrorBoundary>
  )
}
