/** Full Body Cover — escena con múltiple equipamiento y Bro */
export function FullBodyCover() {
  return (
    <svg
      viewBox="0 0 320 180"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Full Body — cuerpo completo"
      fill="none"
      className="w-full h-full"
    >
      {/* Background glow */}
      <ellipse cx="160" cy="90" rx="140" ry="70" fill="var(--color-primary, #ABFF35)" opacity="0.04" />

      {/* === EQUIPMENT scattered === */}
      {/* Barbell on floor left */}
      <line x1="20" y1="158" x2="130" y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <circle cx="18"  cy="158" r="12" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" opacity="0.5" />
      <circle cx="132" cy="158" r="12" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" opacity="0.5" />
      <circle cx="18"  cy="158" r="5"  stroke="var(--color-primary, #ABFF35)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="132" cy="158" r="5"  stroke="var(--color-primary, #ABFF35)" strokeWidth="1.5" opacity="0.5" />

      {/* Dumbbell right */}
      <rect x="230" y="148" width="10" height="20" rx="3" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" opacity="0.6" />
      <line x1="240" y1="158" x2="275" y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <rect x="275" y="148" width="10" height="20" rx="3" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" opacity="0.6" />

      {/* Pull-up bar suggestion top right */}
      <line x1="240" y1="32" x2="310" y2="32" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <line x1="244" y1="22" x2="244" y2="38" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <line x1="306" y1="22" x2="306" y2="38" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />

      {/* Kettlebell left bottom */}
      <circle cx="42" cy="126" r="14" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" opacity="0.45" />
      <path d="M34 116 Q42 108 50 116" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45" />

      {/* === BRO center — arms spread (full body ready pose) === */}
      {/* Head */}
      <circle cx="160" cy="50" r="16"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="3"
      />
      {/* Torso */}
      <rect x="140" y="66" width="40" height="54" rx="8"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="3"
      />
      {/* Body highlights */}
      <path d="M146 74 Q160 68 174 74"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path d="M148 88 Q160 83 172 88"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Left arm — out wide */}
      <line x1="140" y1="80" x2="100" y2="90" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="100" y1="90" x2="80"  y2="112" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />

      {/* Right arm — out wide */}
      <line x1="180" y1="80" x2="220" y2="90" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="220" y1="90" x2="240" y2="112" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />

      {/* Legs standing */}
      <line x1="148" y1="120" x2="138" y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="9" strokeLinecap="round" />
      <line x1="172" y1="120" x2="182" y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="9" strokeLinecap="round" />

      {/* Feet */}
      <line x1="124" y1="174" x2="150" y2="174" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="170" y1="174" x2="196" y2="174" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="138" y1="168" x2="136" y2="174" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="182" y1="168" x2="184" y2="174" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  )
}
