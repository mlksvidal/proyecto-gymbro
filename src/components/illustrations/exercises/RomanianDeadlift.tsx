export function RomanianDeadlift() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo peso muerto rumano"
      fill="none"
    >
      {/* Head */}
      <circle
        cx="148" cy="46" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso — forward lean, near horizontal */}
      <rect
        x="64" y="60" width="74" height="22"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
        transform="rotate(22 101 71)"
      />

      {/* Hamstring / glute highlight */}
      <path
        d="M80 68 Q110 60 138 64"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Arms straight down gripping bar */}
      <line x1="88"  y1="90" x2="76"  y2="132" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="94" x2="104" y2="132" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Barbell */}
      <line x1="24" y1="138" x2="172" y2="138" stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />
      <rect x="16"  y="126" width="10" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />
      <rect x="174" y="126" width="10" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />

      {/* Hands gripping */}
      <circle cx="76"  cy="133" r="5" fill="var(--color-primary, #ABFF35)" />
      <circle cx="104" cy="133" r="5" fill="var(--color-primary, #ABFF35)" />

      {/* Legs — slight knee bend, mostly straight */}
      <line x1="96"  y1="108" x2="90"  y2="162" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />
      <line x1="114" y1="108" x2="118" y2="162" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />

      {/* Feet */}
      <line x1="78"  y1="175" x2="100" y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="108" y1="175" x2="130" y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="90"  y1="162" x2="87"  y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="118" y1="162" x2="121" y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}
