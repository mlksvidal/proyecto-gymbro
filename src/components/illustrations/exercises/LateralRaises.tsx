export function LateralRaises() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo elevaciones laterales"
      fill="none"
    >
      {/* Head */}
      <circle
        cx="100" cy="42" r="13"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso */}
      <rect
        x="84" y="55" width="32" height="46"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Left arm raised lateral — at shoulder height */}
      <line x1="84"  y1="68" x2="38"  y2="62" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Left forearm slight drop */}
      <line x1="38"  y1="62" x2="22"  y2="80" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Right arm raised lateral — at shoulder height */}
      <line x1="116" y1="68" x2="162" y2="62" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="162" y1="62" x2="178" y2="80" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Delt highlight — top of shoulder */}
      <path
        d="M82 62 Q100 54 118 62"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Left dumbbell */}
      <rect x="8"   y="75" width="8" height="16" rx="2.5" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />
      <line x1="16" y1="82" x2="24"  y2="82"  stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" />
      <rect x="24"  y="75" width="8" height="16" rx="2.5" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />

      {/* Right dumbbell */}
      <rect x="168" y="75" width="8" height="16" rx="2.5" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />
      <line x1="176" y1="82" x2="184" y2="82" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" />
      <rect x="184" y="75" width="8" height="16" rx="2.5" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />

      {/* Legs standing */}
      <line x1="92"  y1="101" x2="86"  y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="108" y1="101" x2="114" y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="86"  y1="158" x2="84"  y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="114" y1="158" x2="116" y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />

      {/* Feet */}
      <line x1="74"  y1="175" x2="94"  y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="106" y1="175" x2="126" y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
