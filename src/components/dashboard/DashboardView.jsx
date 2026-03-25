import { useState, useEffect, useRef, useCallback } from 'react'
import { useInsightStore } from '../../store/insightStore'
import { useLayoutStore } from '../../store/layoutStore'
import { useInsightEngine } from '../../hooks/useInsightEngine'
import { parseFile } from '../../utils/fileParsers'
import MetricsSummary from './MetricsSummary'
import AccommodationTrends from './AccommodationTrends'
import InsightsFeed from './InsightsFeed'
import RiskFlags from './RiskFlags'
import PinnedInsights from './PinnedInsights'
import SavedChats from './SavedChats'
import ProjectsOverview from './ProjectsOverview'
import DraggableWidget from './DraggableWidget'
import LoadingSpinner from '../shared/LoadingSpinner'

const WIDGET_MAP = {
  'pinned-insights': () => <PinnedInsights />,
  'metrics-summary': () => <MetricsSummary />,
  'charts-row': () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <AccommodationTrends />
      <RiskFlags />
    </div>
  ),
  'insights-feed': () => <InsightsFeed />,
  'saved-chats': () => <SavedChats />,
  'projects-overview': () => <ProjectsOverview />,
}

export default function DashboardView({ uploadedFiles, onClearFiles }) {
  const isGenerating = useInsightStore((s) => s.isGenerating)
  const insights = useInsightStore((s) => s.insights)
  const { generateInsights } = useInsightEngine()
  const widgetOrder = useLayoutStore((s) => s.widgetOrder)
  const reorderWidgets = useLayoutStore((s) => s.reorderWidgets)
  const resetLayout = useLayoutStore((s) => s.resetLayout)
  const [parsedData, setParsedData] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [localFiles, setLocalFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const dragCounter = useRef(0)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!uploadedFiles || uploadedFiles.length === 0) return

    async function parse() {
      try {
        const results = await Promise.all(uploadedFiles.map(parseFile))
        const merged = results.length === 1 ? results[0] : results.flat()
        setParsedData(merged)
        setParseError(null)
        setLocalFiles((prev) => [...prev, ...uploadedFiles])
      } catch (err) {
        setParseError(err.message)
      }
    }
    parse()
  }, [uploadedFiles])

  async function processFiles(files) {
    const newFiles = Array.from(files)
    if (newFiles.length === 0) return
    try {
      const results = await Promise.all(newFiles.map(parseFile))
      const merged = results.length === 1 ? results[0] : results.flat()
      setParsedData(merged)
      setParseError(null)
      setLocalFiles((prev) => [...prev, ...newFiles])
    } catch (err) {
      setParseError(err.message)
    }
  }

  async function handleLocalUpload(e) {
    await processFiles(e.target.files)
    e.target.value = ''
  }

  function removeFile(index) {
    setLocalFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleGenerate() {
    if (!parsedData) return
    await generateInsights(parsedData)
  }

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) setDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }, [])

  const hasData = parsedData !== null
  const hasInsights = insights.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={resetLayout}
            className="rounded-lg border border-surface-overlay px-3 py-1.5 text-xs text-text-muted hover:text-text-primary"
          >
            Reset Layout
          </button>
          <button
            onClick={handleGenerate}
            disabled={!hasData || isGenerating}
            className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating…' : 'Generate Insights'}
          </button>
        </div>
      </div>

      {parseError && (
        <div role="alert" className="rounded-lg border border-status-error/30 bg-status-error/10 p-3 text-sm text-status-error">
          Error parsing file: {parseError}
        </div>
      )}

      {/* Drag & drop upload zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        aria-label="Upload files by dragging or clicking"
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 transition-colors ${
          dragging
            ? 'border-brand-400 bg-brand-500/10'
            : 'border-surface-overlay hover:border-brand-500/50'
        }`}
      >
        <svg className={`h-10 w-10 ${dragging ? 'text-brand-300' : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className={`mt-3 text-sm font-medium ${dragging ? 'text-brand-300' : 'text-text-secondary'}`}>
          {dragging ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          or <span className="text-brand-400 underline">click to browse</span> — CSV, XLSX, JSON, TXT
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.json,.txt"
        multiple
        onChange={handleLocalUpload}
        className="hidden"
        aria-label="Upload data file"
      />

      {/* Uploaded file chips */}
      {localFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {localFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-1.5 rounded-md bg-surface-elevated px-2.5 py-1.5 text-xs text-text-secondary"
            >
              <svg className="h-3.5 w-3.5 shrink-0 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="max-w-[200px] truncate" title={file.name}>{file.name}</span>
              <button
                onClick={() => removeFile(index)}
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

      {hasData && !hasInsights && !isGenerating && (
        <div className="rounded-xl border-2 border-dashed border-surface-overlay py-8 text-center">
          <p className="text-text-secondary">Data loaded successfully.</p>
          <p className="mt-1 text-sm text-text-muted">
            Click "Generate Insights" to analyze with AI.
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="flex justify-center py-12">
          <LoadingSpinner label="Analyzing data with AI…" size="lg" />
        </div>
      )}

      {!hasData && !hasInsights && !isGenerating && localFiles.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-surface-overlay py-8 text-center">
          <p className="text-lg text-text-secondary">Welcome to the Dashboard</p>
          <p className="mt-2 text-sm text-text-muted">
            Upload a CSV, XLSX, JSON, or TXT file to get started, or configure APIs in the API Manager.
          </p>
        </div>
      )}

      {/* Dynamic draggable widgets */}
      {widgetOrder.map((widgetId, index) => {
        const render = WIDGET_MAP[widgetId]
        if (!render) return null
        return (
          <DraggableWidget
            key={widgetId}
            id={widgetId}
            index={index}
            onDrop={reorderWidgets}
          >
            {render()}
          </DraggableWidget>
        )
      })}
    </div>
  )
}
