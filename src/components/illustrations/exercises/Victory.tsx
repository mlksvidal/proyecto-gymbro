/** Victory pose — bro con brazos arriba celebrando */
export function Victory() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro celebrando workout completado"
      fill="none"
    >
      {/* Head */}
      <circle
        cx="100" cy="44" r="18"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="3"
      />

      {/* Neck */}
      <line x1="100" y1="62" x2="100" y2="74" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />

      {/* Torso */}
      <rect
        x="78" y="74" width="44" height="50"
        rx="8"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="3"
      />

      {/* Chest highlight */}
      <path
        d="M84 82 Q100 76 116 82"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Left arm raised in V */}
      <line x1="78"  y1="84" x2="42"  y2="48" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="42"  y1="48" x2="28"  y2="24" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      {/* Left fist up */}
      <rect x="18" y="14" width="16" height="14" rx="5" fill="var(--color-primary, #ABFF35)" />

      {/* Right arm raised in V */}
      <line x1="122" y1="84" x2="158" y2="48" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="158" y1="48" x2="172" y2="24" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      {/* Right fist up */}
      <rect x="166" y="14" width="16" height="14" rx="5" fill="var(--color-primary, #ABFF35)" />

      {/* Glow lines from fists — victory sparks */}
      <line x1="26"  y1="12" x2="16"  y2="4"  stroke="var(--color-primary-bright, #D8FF3D)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="22"  y1="18" x2="10"  y2="16" stroke="var(--color-primary-bright, #D8FF3D)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="174" y1="12" x2="184" y2="4"  stroke="var(--color-primary-bright, #D8FF3D)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="178" y1="18" x2="190" y2="16" stroke="var(--color-primary-bright, #D8FF3D)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="100" y1="26" x2="100" y2="14" stroke="var(--color-primary-bright, #D8FF3D)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

      {/* Legs */}
      <line x1="88"  y1="124" x2="82"  y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />
      <line x1="112" y1="124" x2="118" y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />

      {/* Feet */}
      <line x1="70"  y1="178" x2="92"  y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="178" x2="130" y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="82"  y1="172" x2="80"  y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="118" y1="172" x2="120" y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  )
}
