import { useState, useCallback, useRef } from 'react'
import { useProjectStore } from '../../store/projectStore'
import { useOllama } from '../../hooks/useOllama'
import { parseFile } from '../../utils/fileParsers'
import DraggableBlock from './DraggableBlock'
import WorkspaceBlock from './WorkspaceBlock'
import BlockPicker from './BlockPicker'
import ExportReportModal from './ExportReportModal'
import { AI_BLOCK_TYPES, PROMPTS } from './WorkspaceBlock'

export default function ProjectWorkspace({ projectId, onBack }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const fileInputRef = useRef(null)

  const projects = useProjectStore((s) => s.projects)
  const addBlock = useProjectStore((s) => s.addBlock)
  const updateBlock = useProjectStore((s) => s.updateBlock)
  const removeBlock = useProjectStore((s) => s.removeBlock)
  const reorderBlocks = useProjectStore((s) => s.reorderBlocks)
  const renameProject = useProjectStore((s) => s.renameProject)
  const saveActiveProject = useProjectStore((s) => s.saveActiveProject)
  const addFileToProject = useProjectStore((s) => s.addFileToProject)
  const removeFileFromProject = useProjectStore((s) => s.removeFileFromProject)

  const project = projects.find((p) => p.id === projectId)
  const blocks = project?.blocks || []
  const { generate } = useOllama()

  const handleAddBlock = useCallback(
    async (type, label) => {
      setPickerOpen(false)
      const block = addBlock(projectId, type, label)
      if (AI_BLOCK_TYPES.includes(type) && block) {
        const prompt = PROMPTS[type]
        if (prompt) {
          try {
            const result = await generate(prompt)
            updateBlock(projectId, block.id, { content: result })
          } catch {
            updateBlock(projectId, block.id, {
              content: 'Failed to generate content. Check your AI connection.',
            })
          }
        }
      }
    },
    [projectId, addBlock, updateBlock, generate]
  )

  const handleUpdateBlock = useCallback(
    (blockId, updates) => {
      updateBlock(projectId, blockId, updates)
    },
    [projectId, updateBlock]
  )

  const handleDeleteBlock = useCallback(
    (blockId) => {
      removeBlock(projectId, blockId)
    },
    [projectId, removeBlock]
  )

  const handleReorder = useCallback(
    (fromIndex, toIndex) => {
      reorderBlocks(projectId, fromIndex, toIndex)
    },
    [projectId, reorderBlocks]
  )

  const startRename = useCallback(() => {
    setNameValue(project?.name || '')
    setEditingName(true)
  }, [project?.name])

  const commitRename = useCallback(() => {
    if (nameValue.trim()) {
      renameProject(projectId, nameValue.trim())
    }
    setEditingName(false)
  }, [projectId, nameValue, renameProject])

  async function handleProjectFileUpload(e) {
    const files = Array.from(e.target.files)
    e.target.value = ''
    for (const file of files) {
      try {
        const data = await parseFile(file)
        const fileObj = {
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          type: file.type || file.name.split('.').pop(),
          size: file.size,
          data: typeof data === 'string' ? data : JSON.stringify(data),
          uploadedAt: new Date().toISOString(),
        }
        addFileToProject(projectId, fileObj)
      } catch {
        // skip files that fail to parse
      }
    }
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const projectFiles = project?.files || []

  if (!project) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted">
        Project not found.{' '}
        <button onClick={onBack} className="ml-2 text-brand-500 hover:underline">
          Go back
        </button>
      </div>
    )
  }

  // Calculate empty add slots: fill remaining grid cells, min 1
  const minSlots = 1
  const gridCols = 3
  const remainder = blocks.length % gridCols
  const emptySlots = Math.max(minSlots, remainder === 0 ? gridCols : gridCols - remainder)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary"
            aria-label="Back to projects"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {editingName ? (
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') setEditingName(false)
              }}
              className="rounded border border-surface-overlay bg-surface-elevated px-3 py-1 text-xl font-bold text-text-primary focus:border-brand-500 focus:outline-none"
            />
          ) : (
            <h2
              onClick={startRename}
              className="cursor-pointer text-2xl font-bold text-text-primary hover:text-brand-400"
              title="Click to rename"
            >
              {project.name}
            </h2>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-surface-overlay px-4 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-elevated"
          >
            Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.json,.txt"
            multiple
            onChange={handleProjectFileUpload}
            className="hidden"
            aria-label="Upload file to project"
          />
          <button
            onClick={() => setReportModalOpen(true)}
            disabled={blocks.length === 0}
            className="rounded-lg border border-surface-overlay px-4 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-elevated disabled:opacity-50"
          >
            Export Report
          </button>
          <button
            onClick={saveActiveProject}
            className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Save
          </button>
        </div>
      </div>

      {/* Project Files */}
      {projectFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {projectFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-1.5 rounded-md bg-surface-elevated px-2.5 py-1.5 text-xs text-text-secondary"
            >
              <svg className="h-3.5 w-3.5 shrink-0 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="max-w-[200px] truncate" title={file.name}>{file.name}</span>
              <span className="text-text-muted">({formatFileSize(file.size)})</span>
              <button
                onClick={() => removeFileFromProject(projectId, file.id)}
                aria-label={`Remove ${file.name}`}
                className="ml-0.5 rounded p-0.5 text-text-muted hover:bg-surface-overlay hover:text-status-error"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Block Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block, index) => (
          <DraggableBlock key={block.id} index={index} onDrop={handleReorder}>
            <WorkspaceBlock
              block={block}
              projectId={projectId}
              onDelete={handleDeleteBlock}
              onUpdate={handleUpdateBlock}
            />
          </DraggableBlock>
        ))}

        {/* Empty add slots */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <button
            key={`add-${i}`}
            onClick={() => setPickerOpen(true)}
            className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-surface-overlay transition-colors hover:border-brand-500/50 hover:bg-brand-500/5"
          >
            <div className="text-center">
              <svg
                className="mx-auto h-8 w-8 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="mt-1 text-xs text-text-muted">Add Block</span>
            </div>
          </button>
        ))}
      </div>

      {/* Block Picker Modal */}
      {pickerOpen && (
        <BlockPicker onSelect={handleAddBlock} onClose={() => setPickerOpen(false)} />
      )}

      {/* Export Report Modal */}
      {reportModalOpen && (
        <ExportReportModal
          blocks={blocks}
          projectName={project.name}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </div>
  )
}
