export function PushUps() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo flexiones"
      fill="none"
    >
      {/* Floor */}
      <line x1="20" y1="168" x2="180" y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" opacity="0.4" />

      {/* Head */}
      <circle
        cx="162" cy="90" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso — horizontal plank */}
      <rect
        x="68" y="102" width="90" height="20"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Chest / pec highlight */}
      <path
        d="M78 106 Q113 100 148 106"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Right arm (near head) — bent */}
      <line x1="148" y1="102" x2="155" y2="140" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Forearm to floor */}
      <line x1="155" y1="140" x2="145" y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Hand */}
      <ellipse cx="143" cy="168" rx="7" ry="4" fill="var(--color-primary, #ABFF35)" />

      {/* Left arm (near hips) — bent */}
      <line x1="78" y1="102" x2="72" y2="138" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="72" y1="138" x2="64" y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="63" cy="168" rx="7" ry="4" fill="var(--color-primary, #ABFF35)" />

      {/* Hips / lower body */}
      <rect
        x="32" y="116" width="42" height="14"
        rx="4"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2"
      />

      {/* Legs going to toes */}
      <line x1="34" y1="130" x2="32" y2="162" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="70" y1="130" x2="66" y2="162" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />

      {/* Toes (feet on floor) */}
      <ellipse cx="31" cy="163" rx="6" ry="3" fill="var(--color-primary, #ABFF35)" />
      <ellipse cx="65" cy="163" rx="6" ry="3" fill="var(--color-primary, #ABFF35)" />
    </svg>
  )
}
