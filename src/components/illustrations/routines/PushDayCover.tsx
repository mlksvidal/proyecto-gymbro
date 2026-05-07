/** Push Day Cover — escena con bench, barbell y Bro */
export function PushDayCover() {
  return (
    <svg
      viewBox="0 0 320 180"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Push Day — pecho, hombros y tríceps"
      fill="none"
      className="w-full h-full"
    >
      {/* Background glow */}
      <ellipse cx="160" cy="100" rx="130" ry="70" fill="var(--color-primary, #ABFF35)" opacity="0.04" />

      {/* === BENCH === */}
      <rect x="60" y="118" width="200" height="12" rx="4"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2"
      />
      {/* Bench legs */}
      <line x1="80"  y1="130" x2="76"  y2="160" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="240" y1="130" x2="244" y2="160" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" strokeLinecap="round" />

      {/* === BARBELL === */}
      <line x1="30" y1="62" x2="290" y2="62" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      {/* Plates left */}
      <rect x="22" y="50" width="10" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />
      <rect x="33" y="52" width="8"  height="20" rx="2" fill="var(--color-primary, #ABFF35)" opacity="0.6" />
      {/* Plates right */}
      <rect x="288" y="50" width="10" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />
      <rect x="279" y="52" width="8"  height="20" rx="2" fill="var(--color-primary, #ABFF35)" opacity="0.6" />

      {/* === BRO (lying on bench) === */}
      {/* Head */}
      <circle cx="64" cy="110" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />
      {/* Torso */}
      <rect x="74" y="104" width="120" height="20" rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />
      {/* Chest accent */}
      <path d="M88 108 Q134 102 178 108"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Arms up */}
      <line x1="110" y1="104" x2="110" y2="62" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="148" y1="104" x2="148" y2="62" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Legs */}
      <line x1="194" y1="122" x2="240" y2="120" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="240" y1="120" x2="242" y2="152" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Decorative: weight plates on floor */}
      <circle cx="280" cy="155" r="14" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" opacity="0.6" />
      <circle cx="280" cy="155" r="7"  stroke="var(--color-primary, #ABFF35)" strokeWidth="1.5" opacity="0.6" />
      <circle cx="38"  cy="155" r="12" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" opacity="0.5" />
      <circle cx="38"  cy="155" r="6"  stroke="var(--color-primary, #ABFF35)" strokeWidth="1.5" opacity="0.5" />
    </svg>
  )
}
