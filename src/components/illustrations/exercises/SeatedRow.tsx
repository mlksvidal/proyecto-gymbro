export function SeatedRow() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo remo en polea"
      fill="none"
    >
      {/* Cable machine back */}
      <rect x="154" y="28" width="24" height="150" rx="4"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2"
        opacity="0.6"
      />
      {/* Cable pulley */}
      <circle cx="166" cy="100" r="8" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />

      {/* Cable line */}
      <line x1="104" y1="95" x2="158" y2="100" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 3" opacity="0.6" />

      {/* Cable handle */}
      <rect x="98" y="89" width="14" height="12" rx="3"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2"
      />

      {/* Bench/seat */}
      <rect x="20" y="130" width="80" height="12" rx="3"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2"
        opacity="0.7"
      />
      {/* Seat legs */}
      <line x1="28"  y1="142" x2="26"  y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="92"  y1="142" x2="94"  y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Foot rest platform */}
      <line x1="116" y1="145" x2="152" y2="145" stroke="var(--color-primary, #ABFF35)" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />

      {/* Head */}
      <circle
        cx="56" cy="68" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso upright seated */}
      <rect
        x="44" y="80" width="30" height="48"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Back highlight (lat pull) */}
      <path
        d="M46 84 Q59 78 72 84"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Arms pulling toward abdomen */}
      <line x1="74" y1="100" x2="104" y2="94" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Thighs horizontal (seated) */}
      <line x1="44"  y1="128" x2="14"  y2="136" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="74"  y1="128" x2="114" y2="136" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />

      {/* Shins */}
      <line x1="14"  y1="136" x2="12"  y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="114" y1="136" x2="116" y2="145" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />

      {/* Feet */}
      <line x1="4"   y1="175" x2="24"  y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="116" cy="146" rx="10" ry="5" fill="var(--color-primary, #ABFF35)" />
    </svg>
  )
}
