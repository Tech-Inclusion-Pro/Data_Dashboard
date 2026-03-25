import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      ollamaUrl: '/ollama',
      selectedModel: 'gemma3:4b',
      systemPrompt:
        'You are an AI assistant for data analysis. Provide clear, actionable insights about trends, risks, and patterns in the uploaded data.',
      availableModels: [],

      setOllamaUrl: (url) => set({ ollamaUrl: url }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      setAvailableModels: (models) => set({ availableModels: models }),
    }),
    {
      name: 'ds-settings',
      partialize: (state) => ({
        ollamaUrl: state.ollamaUrl,
        selectedModel: state.selectedModel,
        systemPrompt: state.systemPrompt,
      }),
    }
  )
)
