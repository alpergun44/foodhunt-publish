/**
 * FoodHunt Logo — SVG Component
 * A fork + location pin mashup representing food discovery
 */
export const Logo = ({ size = 80, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E23744" />
        <stop offset="100%" stopColor="#F5A623" />
      </linearGradient>
      <linearGradient id="logo-bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1A2D47" />
        <stop offset="100%" stopColor="#0A1628" />
      </linearGradient>
      <filter id="logo-glow">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Background circle */}
    <circle cx="60" cy="60" r="58" fill="url(#logo-bg)" stroke="url(#logo-gradient)" strokeWidth="2" />

    {/* Location pin body (outer shape) */}
    <path
      d="M60 18C44.536 18 32 30.536 32 46c0 21 28 52 28 52s28-31 28-52c0-15.464-12.536-28-28-28z"
      fill="url(#logo-gradient)"
      opacity="0.15"
    />

    {/* Fork tines */}
    <g filter="url(#logo-glow)">
      <line x1="48" y1="30" x2="48" y2="56" stroke="url(#logo-gradient)" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="60" y1="26" x2="60" y2="56" stroke="url(#logo-gradient)" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="72" y1="30" x2="72" y2="56" stroke="url(#logo-gradient)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Fork bridge (curved) */}
      <path
        d="M46 56 C46 66 54 72 60 72 C66 72 74 66 74 56"
        stroke="url(#logo-gradient)"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Fork handle */}
      <line x1="60" y1="72" x2="60" y2="96" stroke="url(#logo-gradient)" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Small crosshair/target circle at bottom — "hunt" reference */}
    <circle cx="60" cy="96" r="5" fill="none" stroke="url(#logo-gradient)" strokeWidth="2.5" />
    <circle cx="60" cy="96" r="2" fill="url(#logo-gradient)" />
  </svg>
)

export const LogoText = ({ className = '' }: { className?: string }) => (
  <h1 className={`font-display font-extrabold ${className}`}>
    <span className="text-gradient-warm">Food</span>
    <span className="text-brand-cream">Hunt</span>
  </h1>
)
