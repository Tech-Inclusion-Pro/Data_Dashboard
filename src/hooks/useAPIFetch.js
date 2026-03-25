import { useCallback } from 'react'
import { useApiStore } from '../store/apiStore'

export function useAPIFetch() {
  const setApiStatus = useApiStore((s) => s.setApiStatus)

  const fetchApi = useCallback(
    async (api) => {
      setApiStatus(api.id, 'loading')

      const headers = {}
      switch (api.authType) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${api.authValue}`
          break
        case 'apikey':
          headers[api.headerName || 'X-API-Key'] = api.authValue
          break
        case 'basic':
          headers['Authorization'] = `Basic ${btoa(api.authValue)}`
          break
      }

      try {
        const res = await fetch(api.url, { headers })
        if (!res.ok) {
          setApiStatus(api.id, 'error')
          return null
        }

        const contentType = res.headers.get('content-type') || ''
        let data
        if (contentType.includes('json')) {
          data = await res.json()
        } else {
          data = await res.text()
        }

        setApiStatus(api.id, 'ok', data)
        return data
      } catch (err) {
        setApiStatus(api.id, 'error')
        return null
      }
    },
    [setApiStatus]
  )

  const fetchAllApis = useCallback(
    async (apis) => {
      const results = await Promise.allSettled(apis.map(fetchApi))
      return results
        .filter((r) => r.status === 'fulfilled' && r.value !== null)
        .map((r) => r.value)
    },
    [fetchApi]
  )

  return { fetchApi, fetchAllApis }
}
