import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useInsightStore } from './insightStore'
import { useChatStore } from './chatStore'
import { useLayoutStore } from './layoutStore'

function captureSnapshot(blocks) {
  const insight = useInsightStore.getState()
  const chat = useChatStore.getState()
  const layout = useLayoutStore.getState()
  return {
    insights: insight.insights,
    riskFlags: insight.riskFlags,
    metrics: insight.metrics,
    accommodationTrends: insight.accommodationTrends,
    pinnedIds: insight.pinnedIds,
    messages: chat.messages,
    savedChats: chat.savedChats,
    widgetOrder: layout.widgetOrder,
    blocks: blocks || [],
  }
}

function restoreSnapshot(snapshot) {
  if (!snapshot) return
  useInsightStore.setState({
    insights: snapshot.insights || [],
    riskFlags: snapshot.riskFlags || [],
    metrics: snapshot.metrics || [],
    accommodationTrends: snapshot.accommodationTrends || [],
    pinnedIds: snapshot.pinnedIds || [],
  })
  useChatStore.setState({
    messages: snapshot.messages || [],
    savedChats: snapshot.savedChats || [],
  })
  useLayoutStore.setState({
    widgetOrder: snapshot.widgetOrder || [
      'pinned-insights',
      'metrics-summary',
      'charts-row',
      'insights-feed',
      'saved-chats',
    ],
  })
}

export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      createProject: (name) => {
        const id = Date.now().toString()
        const now = new Date().toISOString()
        const snapshot = captureSnapshot([])
        const project = {
          id,
          name,
          blocks: [],
          files: [],
          snapshot,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          projects: [...state.projects, project],
          activeProjectId: id,
        }))
        return id
      },

      saveActiveProject: () => {
        const { activeProjectId, projects } = get()
        if (!activeProjectId) return
        const project = projects.find((p) => p.id === activeProjectId)
        const snapshot = captureSnapshot(project?.blocks || [])
        set({
          projects: projects.map((p) =>
            p.id === activeProjectId
              ? { ...p, snapshot, updatedAt: new Date().toISOString() }
              : p
          ),
        })
      },

      switchProject: (id) => {
        const { activeProjectId, projects } = get()
        // Auto-save current project before switching
        if (activeProjectId) {
          const currentProject = projects.find((p) => p.id === activeProjectId)
          const snapshot = captureSnapshot(currentProject?.blocks || [])
          set({
            projects: get().projects.map((p) =>
              p.id === activeProjectId
                ? { ...p, snapshot, updatedAt: new Date().toISOString() }
                : p
            ),
          })
        }
        // Load the target project
        const target = get().projects.find((p) => p.id === id)
        if (target) {
          restoreSnapshot(target.snapshot)
          set({ activeProjectId: id })
        }
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId:
            state.activeProjectId === id ? null : state.activeProjectId,
        }))
      },

      renameProject: (id, name) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        }))
      },

      addBlock: (projectId, type, title) => {
        const block = {
          id: `block-${Date.now()}`,
          type,
          title,
          content: '',
          position: get().projects.find((p) => p.id === projectId)?.blocks?.length || 0,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, blocks: [...(p.blocks || []), block], updatedAt: new Date().toISOString() }
              : p
          ),
        }))
        return block
      },

      updateBlock: (projectId, blockId, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  blocks: (p.blocks || []).map((b) =>
                    b.id === blockId ? { ...b, ...updates } : b
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }))
      },

      removeBlock: (projectId, blockId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  blocks: (p.blocks || []).filter((b) => b.id !== blockId),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }))
      },

      saveChatToProject: (projectId, title, messages) => {
        const chat = {
          id: Date.now().toString(),
          title,
          messages: [...messages],
          messageCount: messages.length,
          savedAt: new Date().toISOString(),
        }
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const existing = (p.blocks || []).find((b) => b.type === 'previous-chats')
            if (existing) {
              let chats = []
              try { chats = JSON.parse(existing.content) } catch { /* empty */ }
              if (!Array.isArray(chats)) chats = []
              const updatedContent = JSON.stringify([chat, ...chats])
              return {
                ...p,
                blocks: p.blocks.map((b) =>
                  b.id === existing.id ? { ...b, content: updatedContent } : b
                ),
                updatedAt: new Date().toISOString(),
              }
            }
            // Create a new previous-chats block
            const block = {
              id: `block-${Date.now()}`,
              type: 'previous-chats',
              title: 'Previous Chats',
              content: JSON.stringify([chat]),
              position: (p.blocks || []).length,
              createdAt: new Date().toISOString(),
            }
            return {
              ...p,
              blocks: [...(p.blocks || []), block],
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },

      reorderBlocks: (projectId, fromIndex, toIndex) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const blocks = [...(p.blocks || [])]
            const [moved] = blocks.splice(fromIndex, 1)
            blocks.splice(toIndex, 0, moved)
            return { ...p, blocks: blocks.map((b, i) => ({ ...b, position: i })), updatedAt: new Date().toISOString() }
          }),
        }))
      },

      addFileToProject: (projectId, fileObj) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, files: [...(p.files || []), fileObj], updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      removeFileFromProject: (projectId, fileId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, files: (p.files || []).filter((f) => f.id !== fileId), updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },
    }),
    {
      name: 'ds-projects',
      partialize: (state) => ({
        ...state,
        projects: state.projects.map((p) => ({
          ...p,
          files: (p.files || []).map((f) =>
            f.data && typeof f.data === 'string' && f.data.length > 512000
              ? { ...f, data: null }
              : f
          ),
        })),
      }),
    }
  )
)
