import { useState } from 'react'
import FocusTrap from '../shared/FocusTrap'
import { exportAsText, exportAsMarkdown, exportAsDocx } from '../../utils/exportUtils'

function formatBlockContent(block) {
  let content = ''
  const tryParse = () => {
    try { return JSON.parse(block.content) } catch { return null }
  }

  switch (block.type) {
    case 'notes': {
      const notes = tryParse()
      if (Array.isArray(notes)) {
        notes.forEach((n) => {
          content += `- ${n.text} (${new Date(n.createdAt).toLocaleString()})\n`
        })
      } else {
        content = block.content || ''
      }
      break
    }
    case 'tasks': {
      const tasks = tryParse()
      if (Array.isArray(tasks)) {
        tasks.forEach((t) => {
          const check = t.status === 'completed' ? '[x]' : '[ ]'
          content += `${check} ${t.title} [${t.priority}] — ${t.status}${t.dueDate ? ` (due: ${t.dueDate})` : ''}\n`
          if (t.description) content += `  ${t.description}\n`
        })
      }
      break
    }
    case 'graphs': {
      const config = tryParse()
      if (config?.data) {
        content += `Chart: ${config.title || config.chartType}\n`
        config.data.forEach((d) => {
          content += `- ${d[config.xKey || 'name']}: ${d[config.yKey || 'value']}\n`
        })
      } else {
        content = block.content || 'No chart data'
      }
      break
    }
    case 'previous-chats': {
      const chats = tryParse()
      if (Array.isArray(chats)) {
        chats.forEach((c) => {
          content += `- ${c.title || 'Untitled'} (${c.messageCount || c.messages?.length || 0} messages, ${c.savedAt ? new Date(c.savedAt).toLocaleDateString() : 'no date'})\n`
        })
      }
      break
    }
    case 'project-insights':
      content = block.content || ''
      break
    default:
      content = block.content || ''
  }
  return content
}

export default function ExportReportModal({ blocks, projectName, onClose }) {
  const [selected, setSelected] = useState(() => new Set(blocks.map((b) => b.id)))
  const [format, setFormat] = useState('markdown')

  function toggleAll() {
    if (selected.size === blocks.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(blocks.map((b) => b.id)))
    }
  }

  function toggleBlock(id) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function handleExport() {
    const date = new Date().toISOString().split('T')[0]
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const filename = `${slug}-report-${date}`
    const selectedBlocks = blocks.filter((b) => selected.has(b.id))

    if (format === 'markdown') {
      let md = `# ${projectName} — Report\n\n`
      md += `_Generated: ${new Date().toLocaleString()}_\n\n---\n\n`
      selectedBlocks.forEach((block) => {
        md += `## ${block.title} (${block.type})\n\n`
        md += formatBlockContent(block) + '\n\n---\n\n'
      })
      exportAsMarkdown(md, `${filename}.md`)
    } else if (format === 'docx') {
      let docContent = `# ${projectName} — Report\n\n`
      docContent += `_Generated: ${new Date().toLocaleString()}_\n\n`
      selectedBlocks.forEach((block) => {
        docContent += `## ${block.title} (${block.type})\n\n`
        docContent += formatBlockContent(block) + '\n\n'
      })
      exportAsDocx(docContent, `${filename}.docx`)
    } else {
      let text = `${projectName} — Report\n`
      text += `Generated: ${new Date().toLocaleString()}\n`
      text += '='.repeat(40) + '\n\n'
      selectedBlocks.forEach((block) => {
        text += `[${block.type}] ${block.title}\n`
        text += '-'.repeat(30) + '\n'
        text += formatBlockContent(block) + '\n\n'
      })
      exportAsText(text, `${filename}.txt`)
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
          aria-labelledby="export-report-title"
          className="my-auto w-full max-w-md rounded-xl border border-surface-overlay bg-surface-card p-6 shadow-xl"
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
        >
          <h2 id="export-report-title" className="mb-4 text-lg font-semibold text-text-primary">
            Export Report
          </h2>

          <div className="space-y-4">
            {/* Select All */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.size === blocks.length}
                onChange={toggleAll}
                className="accent-brand-500"
              />
              <span className="text-sm font-medium text-text-primary">
                Select All ({selected.size}/{blocks.length})
              </span>
            </label>

            {/* Block checkboxes */}
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {blocks.map((block) => (
                <label key={block.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(block.id)}
                    onChange={() => toggleBlock(block.id)}
                    className="accent-brand-500"
                  />
                  <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-400">
                    {block.type}
                  </span>
                  <span className="text-sm text-text-secondary truncate">{block.title}</span>
                </label>
              ))}
            </div>

            {/* Format */}
            <fieldset>
              <legend className="block text-sm font-medium text-text-primary mb-2">
                Format
              </legend>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="export-format"
                    value="markdown"
                    checked={format === 'markdown'}
                    onChange={() => setFormat('markdown')}
                    className="accent-brand-500"
                  />
                  <span className="text-sm text-text-secondary">Markdown</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="export-format"
                    value="text"
                    checked={format === 'text'}
                    onChange={() => setFormat('text')}
                    className="accent-brand-500"
                  />
                  <span className="text-sm text-text-secondary">Text</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="export-format"
                    value="docx"
                    checked={format === 'docx'}
                    onChange={() => setFormat('docx')}
                    className="accent-brand-500"
                  />
                  <span className="text-sm text-text-secondary">Word (.docx)</span>
                </label>
              </div>
            </fieldset>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-surface-overlay px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={selected.size === 0}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Export
              </button>
            </div>
          </div>
        </dialog>
      </FocusTrap>
    </div>
  )
}
