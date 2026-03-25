import { useState } from 'react'

export default function DraggableWidget({
  id,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  children,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isOver, setIsOver] = useState(false)

  function handleDragStart(e) {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    onDragStart?.(index)
  }

  function handleDragEnd() {
    setIsDragging(false)
    setIsOver(false)
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsOver(true)
    onDragOver?.(e, index)
  }

  function handleDragLeave() {
    setIsOver(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsOver(false)
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (!isNaN(fromIndex) && fromIndex !== index) {
      onDrop?.(fromIndex, index)
    }
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative transition-all ${
        isDragging ? 'opacity-40' : ''
      } ${isOver ? 'ring-2 ring-brand-400 ring-offset-2 ring-offset-surface-base rounded-xl' : ''}`}
    >
      <div
        aria-label="Drag to reorder"
        className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 cursor-grab rounded-md bg-surface-elevated p-1 opacity-0 shadow-md transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <svg
          className="h-4 w-4 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>
      {children}
    </div>
  )
}
