import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useApiStore = create(
  persist(
    (set, get) => ({
      apis: [],

      addApi: (api) =>
        set((state) => ({
          apis: [
            ...state.apis,
            {
              id: crypto.randomUUID(),
              name: api.name,
              url: api.url,
              authType: api.authType || 'none',
              authValue: api.authValue || '',
              headerName: api.headerName || '',
              status: 'unchecked',
              lastChecked: null,
              lastData: null,
              ...api,
            },
          ],
        })),

      updateApi: (id, updates) =>
        set((state) => ({
          apis: state.apis.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      removeApi: (id) =>
        set((state) => ({
          apis: state.apis.filter((a) => a.id !== id),
        })),

      setApiStatus: (id, status, lastData = null) =>
        set((state) => ({
          apis: state.apis.map((a) =>
            a.id === id
              ? { ...a, status, lastChecked: new Date().toISOString(), lastData }
              : a
          ),
        })),
    }),
    {
      name: 'ds-apis',
      partialize: (state) => ({
        apis: state.apis.map(({ lastData, ...rest }) => rest),
      }),
    }
  )
)
