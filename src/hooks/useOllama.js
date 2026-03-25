import { useCallback, useRef } from 'react'
import { useSettingsStore } from '../store/settingsStore'

export function useOllama() {
  const abortRef = useRef(null)
  const ollamaUrl = useSettingsStore((s) => s.ollamaUrl)
  const selectedModel = useSettingsStore((s) => s.selectedModel)
  const systemPrompt = useSettingsStore((s) => s.systemPrompt)

  const checkHealth = useCallback(async () => {
    try {
      const start = performance.now()
      const res = await fetch(`${ollamaUrl}/api/tags`)
      const latency = Math.round(performance.now() - start)
      if (!res.ok) return { ok: false, latency: null, models: [] }
      const data = await res.json()
      return {
        ok: true,
        latency,
        models: data.models || [],
      }
    } catch {
      return { ok: false, latency: null, models: [] }
    }
  }, [ollamaUrl])

  const listModels = useCallback(async () => {
    try {
      const res = await fetch(`${ollamaUrl}/api/tags`)
      if (!res.ok) return []
      const data = await res.json()
      return data.models || []
    } catch {
      return []
    }
  }, [ollamaUrl])

  const streamChat = useCallback(
    async function* (messages) {
      abortRef.current = new AbortController()
      const body = {
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }

      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        throw new Error(`Ollama error: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const parsed = JSON.parse(line)
            if (parsed.message?.content) {
              yield parsed.message.content
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    },
    [ollamaUrl, selectedModel, systemPrompt]
  )

  const generate = useCallback(
    async (prompt) => {
      abortRef.current = new AbortController()
      const res = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt,
          system: systemPrompt,
          stream: false,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`Ollama error: ${res.status}`)
      const data = await res.json()
      return data.response
    },
    [ollamaUrl, selectedModel, systemPrompt]
  )

  const abort = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { streamChat, generate, checkHealth, listModels, abort }
}
