import { useCallback } from 'react'
import { useOllama } from './useOllama'
import { useInsightStore } from '../store/insightStore'

function tryParseJSON(text) {
  // Try to extract JSON from markdown code blocks or raw text
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1])
    } catch {
      // fall through
    }
  }
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function buildPrompt(data) {
  const sample = typeof data === 'string' ? data.slice(0, 3000) : JSON.stringify(data).slice(0, 3000)
  return `Analyze this data and return a JSON object with exactly these keys:
{
  "metrics": [{"label": "string", "value": "string", "trend": "up|down|stable"}],
  "insights": [{"id": "string", "title": "string", "summary": "string", "severity": "info|low|medium|high|critical", "category": "string"}],
  "riskFlags": [{"id": "string", "title": "string", "description": "string", "severity": "low|medium|high|critical"}],
  "accommodationTrends": [{"period": "string", "count": number, "category": "string"}]
}

Data sample:
${sample}

Return ONLY the JSON object, no other text.`
}

function fallbackInsights(rawText) {
  return {
    metrics: [
      { label: 'Analysis Status', value: 'Completed', trend: 'stable' },
    ],
    insights: [
      {
        id: crypto.randomUUID(),
        title: 'AI Analysis',
        summary: rawText.slice(0, 500),
        severity: 'info',
        category: 'General',
      },
    ],
    riskFlags: [],
    accommodationTrends: [],
  }
}

export function useInsightEngine() {
  const { generate } = useOllama()
  const {
    setInsights,
    setRiskFlags,
    setMetrics,
    setAccommodationTrends,
    setIsGenerating,
  } = useInsightStore()

  const generateInsights = useCallback(
    async (data) => {
      setIsGenerating(true)
      try {
        const prompt = buildPrompt(data)
        const rawResponse = await generate(prompt)
        const parsed = tryParseJSON(rawResponse)
        const result = parsed || fallbackInsights(rawResponse)

        setMetrics(
          (result.metrics || []).map((m, i) => ({ id: `m-${i}`, ...m }))
        )
        setInsights(
          (result.insights || []).map((ins, i) => ({
            id: ins.id || `i-${i}`,
            ...ins,
          }))
        )
        setRiskFlags(
          (result.riskFlags || []).map((r, i) => ({
            id: r.id || `r-${i}`,
            ...r,
          }))
        )
        setAccommodationTrends(result.accommodationTrends || [])

        return result
      } catch (err) {
        setInsights([
          {
            id: 'error',
            title: 'Analysis Error',
            summary: err.message,
            severity: 'high',
            category: 'Error',
          },
        ])
        return null
      } finally {
        setIsGenerating(false)
      }
    },
    [generate, setInsights, setRiskFlags, setMetrics, setAccommodationTrends, setIsGenerating]
  )

  return { generateInsights }
}
