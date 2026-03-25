import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useInsightStore = create(
  persist(
    (set, get) => ({
      insights: [],
      riskFlags: [],
      metrics: [],
      accommodationTrends: [],
      isGenerating: false,
      pinnedIds: [],

      setInsights: (insights) => set({ insights }),
      setRiskFlags: (riskFlags) => set({ riskFlags }),
      setMetrics: (metrics) => set({ metrics }),
      setAccommodationTrends: (trends) => set({ accommodationTrends: trends }),
      setIsGenerating: (val) => set({ isGenerating: val }),

      togglePin: (id) =>
        set((state) => ({
          pinnedIds: state.pinnedIds.includes(id)
            ? state.pinnedIds.filter((p) => p !== id)
            : [...state.pinnedIds, id],
        })),

      clearInsights: () =>
        set({
          insights: [],
          riskFlags: [],
          metrics: [],
          accommodationTrends: [],
        }),
    }),
    {
      name: 'ds-insights',
      partialize: (state) => ({
        pinnedIds: state.pinnedIds,
      }),
    }
  )
)
