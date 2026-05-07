export function BicepCurl() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo curl de bíceps"
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

      {/* Left arm down (resting) */}
      <line x1="84" y1="70" x2="58" y2="108" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Left forearm — dumbbell hanging */}
      <line x1="58" y1="108" x2="52" y2="138" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Left dumbbell */}
      <rect x="38"  y="135" width="10" height="18" rx="3" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />
      <line x1="48" y1="143" x2="58" y2="143" stroke="var(--color-primary, #ABFF35)" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="58"  y="135" width="10" height="18" rx="3" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />

      {/* Right arm — curled up (flexed bicep) */}
      <line x1="116" y1="70" x2="144" y2="82" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="144" y1="82" x2="132" y2="108" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Bicep peak highlight */}
      <path
        d="M130 75 Q148 68 146 84"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
        fill="none"
      />

      {/* Right dumbbell (curled up) */}
      <rect x="118" y="104" width="10" height="18" rx="3" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />
      <line x1="128" y1="112" x2="138" y2="112" stroke="var(--color-primary, #ABFF35)" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="138" y="104" width="10" height="18" rx="3" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />

      {/* Legs standing */}
      <line x1="92"  y1="101" x2="86"  y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="108" y1="101" x2="114" y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />

      {/* Feet */}
      <line x1="76"  y1="172" x2="96"  y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="104" y1="172" x2="124" y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="86"  y1="158" x2="84"  y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="114" y1="158" x2="116" y2="172" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}
