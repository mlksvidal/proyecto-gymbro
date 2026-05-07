export function Deadlift() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo peso muerto"
      fill="none"
    >
      {/* Barbell on floor */}
      <line x1="28" y1="155" x2="172" y2="155" stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Big plates (floor) */}
      <circle cx="34"  cy="155" r="20" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" />
      <circle cx="166" cy="155" r="20" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" />
      {/* Inner plate detail */}
      <circle cx="34"  cy="155" r="10" stroke="var(--color-primary, #ABFF35)" strokeWidth="1.5" />
      <circle cx="166" cy="155" r="10" stroke="var(--color-primary, #ABFF35)" strokeWidth="1.5" />

      {/* Head */}
      <circle
        cx="108" cy="36" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso — slightly forward lean */}
      <rect
        x="90" y="48" width="30" height="38"
        rx="5"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
        transform="rotate(-8 105 67)"
      />

      {/* Back / trap highlight */}
      <path
        d="M94 52 Q105 48 116 52"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Arms gripping bar — going down */}
      <line x1="95"  y1="84" x2="82"  y2="138" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="115" y1="84" x2="118" y2="138" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Grip on bar */}
      <circle cx="82"  cy="140" r="5" fill="var(--color-primary, #ABFF35)" />
      <circle cx="118" cy="140" r="5" fill="var(--color-primary, #ABFF35)" />

      {/* Legs */}
      <line x1="98"  y1="86" x2="88"  y2="135" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="112" y1="86" x2="122" y2="135" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />

      {/* Feet */}
      <line x1="80"  y1="170" x2="98"  y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="108" y1="170" x2="126" y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      {/* Shins to feet */}
      <line x1="88"  y1="135" x2="86"  y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="122" y1="135" x2="120" y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}
