import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_ORDER = [
  'pinned-insights',
  'metrics-summary',
  'charts-row',
  'insights-feed',
  'saved-chats',
  'projects-overview',
]

export const useLayoutStore = create(
  persist(
    (set) => ({
      widgetOrder: DEFAULT_ORDER,

      reorderWidgets: (fromIndex, toIndex) =>
        set((state) => {
          const order = [...state.widgetOrder]
          const [moved] = order.splice(fromIndex, 1)
          order.splice(toIndex, 0, moved)
          return { widgetOrder: order }
        }),

      resetLayout: () => set({ widgetOrder: DEFAULT_ORDER }),
    }),
    { name: 'ds-layout' }
  )
)
