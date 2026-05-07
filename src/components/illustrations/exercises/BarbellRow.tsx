export function BarbellRow() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo remo con barra"
      fill="none"
    >
      {/* Head */}
      <circle
        cx="152" cy="54" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso — bent over ~45 degrees */}
      <rect
        x="86" y="56" width="58" height="24"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
        transform="rotate(20 115 68)"
      />

      {/* Back highlight (lats engaged) */}
      <path
        d="M100 62 Q120 56 140 60"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Arms pulling bar toward chest */}
      <line x1="92"  y1="82" x2="72"  y2="122" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="88" x2="100" y2="122" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Barbell */}
      <line x1="22" y1="128" x2="168" y2="128" stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />
      {/* Plates */}
      <rect x="14"  y="116" width="10" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />
      <rect x="168" y="116" width="10" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />

      {/* Hands gripping */}
      <circle cx="72"  cy="123" r="5" fill="var(--color-primary, #ABFF35)" />
      <circle cx="100" cy="123" r="5" fill="var(--color-primary, #ABFF35)" />

      {/* Legs hip-width */}
      <line x1="96"  y1="104" x2="90"  y2="160" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="116" y1="104" x2="122" y2="160" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />

      {/* Feet */}
      <line x1="80"  y1="175" x2="100" y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="112" y1="175" x2="132" y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="90"  y1="160" x2="88"  y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="122" y1="160" x2="124" y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}
