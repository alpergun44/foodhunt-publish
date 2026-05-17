/**
 * FoodHunt Logo — monokrom, currentColor üzerinden
 * Tek bir renkle çalışır, ebeveynin `text-*` rengini takip eder.
 */
export const Logo = ({ size = 80, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="FoodHunt"
  >
    {/* Outer ring */}
    <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.9" />

    {/* Fork tines */}
    <line x1="48" y1="30" x2="48" y2="56" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="60" y1="26" x2="60" y2="56" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="72" y1="30" x2="72" y2="56" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />

    {/* Fork bridge */}
    <path
      d="M46 56 C46 66 54 72 60 72 C66 72 74 66 74 56"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />

    {/* Handle */}
    <line x1="60" y1="72" x2="60" y2="92" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />

    {/* Target dot */}
    <circle cx="60" cy="96" r="4" fill="currentColor" />
  </svg>
)

export const LogoText = ({ className = '' }: { className?: string }) => (
  <h1 className={`font-sans font-semibold tracking-tight ${className}`}>
    <span className="text-brand-cream">Food</span>
    <span className="text-brand-muted">Hunt</span>
  </h1>
)
