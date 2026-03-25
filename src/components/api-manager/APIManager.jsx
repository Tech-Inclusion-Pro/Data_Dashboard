import { useState } from 'react'
import { useApiStore } from '../../store/apiStore'
import { useAPIFetch } from '../../hooks/useAPIFetch'
import APICard from './APICard'
import APIFormModal from './APIFormModal'

export default function APIManager() {
  const { apis, addApi, updateApi, removeApi } = useApiStore()
  const { fetchApi } = useAPIFetch()
  const [showForm, setShowForm] = useState(false)
  const [editingApi, setEditingApi] = useState(null)

  function handleSave(data) {
    if (editingApi) {
      updateApi(editingApi.id, data)
    } else {
      addApi(data)
    }
    setEditingApi(null)
  }

  function handleEdit(api) {
    setEditingApi(api)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditingApi(null)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">API Manager</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Add API
        </button>
      </div>

      {apis.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-surface-overlay py-12 text-center">
          <p className="text-text-muted">No APIs configured yet.</p>
          <p className="mt-1 text-sm text-text-muted">
            Add an API endpoint to start pulling data.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {apis.map((api) => (
            <APICard
              key={api.id}
              api={api}
              onEdit={handleEdit}
              onRemove={removeApi}
              onTest={fetchApi}
            />
          ))}
        </div>
      )}

      {showForm && (
        <APIFormModal
          onClose={handleClose}
          onSave={handleSave}
          initial={editingApi}
        />
      )}
    </div>
  )
}
