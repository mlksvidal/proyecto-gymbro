/** Pull Day Cover — escena con pull-up bar y Bro */
export function PullDayCover() {
  return (
    <svg
      viewBox="0 0 320 180"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Pull Day — espalda y bíceps"
      fill="none"
      className="w-full h-full"
    >
      {/* Background glow */}
      <ellipse cx="160" cy="80" rx="120" ry="65" fill="var(--color-primary, #ABFF35)" opacity="0.04" />

      {/* === PULL-UP STATION === */}
      {/* Horizontal bar */}
      <line x1="50" y1="28" x2="270" y2="28" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Left upright */}
      <line x1="62"  y1="18" x2="62"  y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      {/* Right upright */}
      <line x1="258" y1="18" x2="258" y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      {/* Base feet */}
      <line x1="44"  y1="170" x2="80"  y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <line x1="244" y1="170" x2="272" y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

      {/* === BRO doing pull-up === */}
      {/* Hands on bar */}
      <circle cx="120" cy="28" r="6" fill="var(--color-primary, #ABFF35)" />
      <circle cx="190" cy="28" r="6" fill="var(--color-primary, #ABFF35)" />

      {/* Arms */}
      <line x1="120" y1="28" x2="130" y2="56" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="190" y1="28" x2="180" y2="56" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Head (chin above / at bar) */}
      <circle cx="155" cy="46" r="14"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso */}
      <rect x="134" y="60" width="42" height="46" rx="8"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Lat / back highlight V taper */}
      <path d="M136 66 Q155 58 174 66"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path d="M138 80 Q155 73 172 80"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Legs hanging */}
      <line x1="144" y1="106" x2="138" y2="150" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="166" y1="106" x2="172" y2="150" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="138" y1="150" x2="132" y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="172" y1="150" x2="178" y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Decorative: barbell on floor */}
      <line x1="40" y1="162" x2="110" y2="162" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <circle cx="38"  cy="162" r="10" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" opacity="0.4" />
      <circle cx="112" cy="162" r="10" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" opacity="0.4" />
    </svg>
  )
}
