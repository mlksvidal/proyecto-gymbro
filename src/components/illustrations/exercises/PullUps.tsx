export function PullUps() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo dominadas"
      fill="none"
    >
      {/* Pull-up bar structure */}
      <line x1="20" y1="28" x2="180" y2="28" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Vertical supports */}
      <line x1="30"  y1="18" x2="30"  y2="34" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="170" y1="18" x2="170" y2="34" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />

      {/* Head (chin above bar) */}
      <circle
        cx="100" cy="44" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Left arm gripping */}
      <line x1="74"  y1="28" x2="84"  y2="56" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Right arm gripping */}
      <line x1="126" y1="28" x2="116" y2="56" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Hands on bar */}
      <circle cx="74"  cy="28" r="5" fill="var(--color-primary, #ABFF35)" />
      <circle cx="126" cy="28" r="5" fill="var(--color-primary, #ABFF35)" />

      {/* Torso */}
      <rect
        x="84" y="56" width="32" height="36"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Back / lat highlight (wide V taper) */}
      <path
        d="M86 60 Q100 55 114 60"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M88 72 Q100 67 112 72"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Legs hanging */}
      <line x1="92"  y1="92" x2="86"  y2="140" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="108" y1="92" x2="114" y2="140" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />

      {/* Lower legs bent slightly */}
      <line x1="86"  y1="140" x2="80"  y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="114" y1="140" x2="120" y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
