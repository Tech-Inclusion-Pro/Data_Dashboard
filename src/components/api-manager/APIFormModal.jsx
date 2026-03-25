import { useState } from 'react'
import FocusTrap from '../shared/FocusTrap'

const AUTH_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'apikey', label: 'API Key' },
  { value: 'basic', label: 'Basic Auth' },
]

export default function APIFormModal({ onClose, onSave, initial = null }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    url: initial?.url || '',
    authType: initial?.authType || 'none',
    authValue: initial?.authValue || '',
    headerName: initial?.headerName || '',
  })

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
    onClose()
  }

  const needsAuth = form.authType !== 'none'
  const needsHeaderName = form.authType === 'apikey'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <FocusTrap>
        <dialog
          open
          aria-labelledby="api-form-title"
          className="my-auto w-full max-w-md rounded-xl border border-surface-overlay bg-surface-card p-6 shadow-xl"
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
        >
          <h2 id="api-form-title" className="mb-4 text-lg font-semibold text-text-primary">
            {initial ? 'Edit API' : 'Add API'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="api-name" className="block text-sm font-medium text-text-primary mb-1">
                Name
              </label>
              <input
                id="api-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary"
              />
            </div>

            <div>
              <label htmlFor="api-url" className="block text-sm font-medium text-text-primary mb-1">
                URL
              </label>
              <input
                id="api-url"
                type="url"
                required
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary"
              />
            </div>

            <div>
              <label htmlFor="api-auth-type" className="block text-sm font-medium text-text-primary mb-1">
                Auth Type
              </label>
              <select
                id="api-auth-type"
                value={form.authType}
                onChange={(e) => setForm({ ...form, authType: e.target.value })}
                className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary"
              >
                {AUTH_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div aria-live="polite">
              {needsHeaderName && (
                <div className="mb-3">
                  <label htmlFor="api-header-name" className="block text-sm font-medium text-text-primary mb-1">
                    Header Name
                  </label>
                  <input
                    id="api-header-name"
                    type="text"
                    value={form.headerName}
                    onChange={(e) => setForm({ ...form, headerName: e.target.value })}
                    placeholder="X-API-Key"
                    className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary"
                  />
                </div>
              )}

              {needsAuth && (
                <div>
                  <label htmlFor="api-auth-value" className="block text-sm font-medium text-text-primary mb-1">
                    {form.authType === 'basic' ? 'Username:Password' : 'Token / Key'}
                  </label>
                  <input
                    id="api-auth-value"
                    type="password"
                    value={form.authValue}
                    onChange={(e) => setForm({ ...form, authValue: e.target.value })}
                    className="w-full rounded-lg border border-surface-overlay bg-surface-elevated px-3 py-2 text-sm text-text-primary"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-surface-overlay px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                {initial ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </dialog>
      </FocusTrap>
    </div>
  )
}
