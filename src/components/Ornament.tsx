/** Pequeño separador decorativo: dos líneas finas y un punto. */
export function Ornament({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" className={`block h-3 w-28 ${className}`} aria-hidden="true">
      <path d="M0 6h48M72 6h48" stroke="currentColor" strokeWidth="0.8" />
      <path d="M60 1.5 64.5 6 60 10.5 55.5 6Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="60" cy="6" r="1.2" fill="currentColor" />
    </svg>
  )
}
