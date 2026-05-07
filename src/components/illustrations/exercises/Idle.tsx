/** Fallback/idle mascot — bro standing ready, fists at sides */
export function Idle() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro listo para entrenar"
      fill="none"
    >
      {/* Head */}
      <circle
        cx="100" cy="46" r="18"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="3"
      />

      {/* Neck */}
      <line x1="100" y1="64" x2="100" y2="74" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />

      {/* Torso — broad chest */}
      <rect
        x="78" y="74" width="44" height="54"
        rx="8"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="3"
      />

      {/* Chest detail lines */}
      <path
        d="M84 82 Q100 76 116 82"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M84 92 Q100 87 116 92"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Left arm at side */}
      <line x1="78"  y1="84" x2="56"  y2="116" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="56"  y1="116" x2="50" y2="140" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      {/* Left fist */}
      <rect x="44" y="138" width="14" height="12" rx="4" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" />

      {/* Right arm at side */}
      <line x1="122" y1="84" x2="144" y2="116" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="144" y1="116" x2="150" y2="140" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      {/* Right fist */}
      <rect x="142" y="138" width="14" height="12" rx="4" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" />

      {/* Legs */}
      <line x1="88"  y1="128" x2="82"  y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />
      <line x1="112" y1="128" x2="118" y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />

      {/* Feet */}
      <line x1="70"  y1="178" x2="92"  y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="178" x2="130" y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="82"  y1="172" x2="80"  y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="118" y1="172" x2="120" y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  )
}
