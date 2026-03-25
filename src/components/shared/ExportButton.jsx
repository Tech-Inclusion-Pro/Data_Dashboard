import { useState, useRef, useEffect } from 'react'
import { exportAsText, exportAsCSV, exportAsMarkdown, exportAsDocx } from '../../utils/exportUtils'

export default function ExportButton({ data, filenameBase = 'export' }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  useEffect(() => {
    if (open && menuRef.current) {
      const first = menuRef.current.querySelector('button')
      first?.focus()
    }
  }, [open])

  function handleKeyDown(e) {
    if (!menuRef.current) return
    const items = Array.from(menuRef.current.querySelectorAll('button'))
    const idx = items.indexOf(document.activeElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(idx + 1) % items.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(idx - 1 + items.length) % items.length]?.focus()
    }
  }

  const options = [
    { label: 'Text (.txt)', fn: () => exportAsText(data, `${filenameBase}.txt`) },
    { label: 'CSV (.csv)', fn: () => exportAsCSV(data, `${filenameBase}.csv`) },
    { label: 'Markdown (.md)', fn: () => exportAsMarkdown(data, `${filenameBase}.md`) },
    { label: 'Word (.docx)', fn: () => exportAsDocx(data, `${filenameBase}.docx`) },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        className="rounded-lg border border-surface-overlay bg-surface-card px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-focus-ring"
      >
        Export
      </button>
      {open && (
        <div
          role="menu"
          onKeyDown={handleKeyDown}
          className="absolute right-0 z-50 mt-1 w-40 rounded-lg border border-surface-overlay bg-surface-elevated shadow-lg animate-fade-in"
        >
          {options.map((opt) => (
            <button
              key={opt.label}
              role="menuitem"
              onClick={() => {
                opt.fn()
                setOpen(false)
              }}
              className="block w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-overlay focus-visible:bg-surface-overlay"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
