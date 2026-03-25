export default function LoadingSpinner({ label = 'Loading…', size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }
  return (
    <div role="status" className="flex items-center gap-2">
      <svg
        className={`${sizes[size]} animate-spin text-brand-400`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span aria-label={label} className="text-sm text-text-muted">
        {label}
      </span>
    </div>
  )
}
