export function Dips() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo fondos en paralelas"
      fill="none"
    >
      {/* Parallel bars */}
      {/* Left bar */}
      <line x1="52"  y1="30" x2="52"  y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <line x1="28"  y1="72" x2="76"  y2="72"  stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />
      {/* Right bar */}
      <line x1="148" y1="30" x2="148" y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <line x1="124" y1="72" x2="172" y2="72"  stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Hands gripping */}
      <circle cx="52"  cy="72" r="6" fill="var(--color-primary, #ABFF35)" />
      <circle cx="148" cy="72" r="6" fill="var(--color-primary, #ABFF35)" />

      {/* Arms bent (dip position) */}
      <line x1="52"  y1="72" x2="74"  y2="96" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="148" y1="72" x2="126" y2="96" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Head */}
      <circle
        cx="100" cy="72" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso */}
      <rect
        x="84" y="84" width="32" height="40"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Tricep highlight */}
      <path
        d="M74 90 Q70 100 76 112"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
        fill="none"
      />
      <path
        d="M126 90 Q130 100 124 112"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
        fill="none"
      />

      {/* Legs hanging — bent knees */}
      <line x1="92"  y1="124" x2="86"  y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="108" y1="124" x2="114" y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />

      {/* Lower legs bent back */}
      <line x1="86"  y1="158" x2="96"  y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="114" y1="158" x2="104" y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
