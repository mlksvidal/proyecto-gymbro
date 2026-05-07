export function CalfRaises() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo elevación de gemelos"
      fill="none"
    >
      {/* Step platform */}
      <rect x="54" y="158" width="92" height="14" rx="4"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />
      <line x1="20" y1="172" x2="180" y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" strokeLinecap="round" opacity="0.35" />

      {/* Head */}
      <circle
        cx="100" cy="36" r="13"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso */}
      <rect
        x="84" y="49" width="32" height="46"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Arms straight (holding machine handles or neutral) */}
      <line x1="84"  y1="68" x2="62"  y2="82" stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="116" y1="68" x2="138" y2="82" stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Legs — mostly straight, on tip-toe */}
      <line x1="92"  y1="95" x2="89"  y2="152" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />
      <line x1="108" y1="95" x2="111" y2="152" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />

      {/* Calf muscle highlight — the hero muscle */}
      <path
        d="M85 118 Q80 132 84 148"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
        fill="none"
      />
      <path
        d="M115 118 Q120 132 116 148"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
        fill="none"
      />

      {/* Feet on tiptoe (heels raised) */}
      {/* Ball of foot visible, heel up */}
      <ellipse cx="89"  cy="158" rx="10" ry="5" fill="var(--color-primary, #ABFF35)" />
      <ellipse cx="111" cy="158" rx="10" ry="5" fill="var(--color-primary, #ABFF35)" />

      {/* Movement arrows — going up */}
      <line x1="100" y1="22" x2="100" y2="12" stroke="var(--color-primary-bright, #D8FF3D)" strokeWidth="2" strokeLinecap="round" opacity="0.5" markerEnd="url(#arrowUp)" />
    </svg>
  )
}
