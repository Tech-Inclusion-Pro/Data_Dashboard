export default function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-medium text-brand-300">
      <svg
        className="h-3 w-3"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M8 0l1.5 5.5L15 6l-4.5 2.5L12 14l-4-3.5L4 14l1.5-5.5L1 6l5.5-.5z" />
      </svg>
      AI Generated
    </span>
  )
}
