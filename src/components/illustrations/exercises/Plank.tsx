export function Plank() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo plancha"
      fill="none"
    >
      {/* Floor */}
      <line x1="20" y1="168" x2="180" y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" opacity="0.35" />

      {/* Head */}
      <circle
        cx="158" cy="98" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Full body plank — horizontal */}
      <rect
        x="50" y="110" width="108" height="18"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Core highlight — the working muscle */}
      <path
        d="M60 114 Q100 108 148 114"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M70 120 Q100 116 140 120"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Right arm (near head) — forearm on ground */}
      <line x1="148" y1="128" x2="156" y2="152" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Elbow on floor */}
      <ellipse cx="158" cy="154" rx="7" ry="4" fill="var(--color-primary, #ABFF35)" />
      {/* Forearm forward */}
      <line x1="158" y1="154" x2="176" y2="154" stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Left arm (near hips) — forearm on ground */}
      <line x1="62" y1="128" x2="54" y2="152" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="52" cy="154" rx="7" ry="4" fill="var(--color-primary, #ABFF35)" />
      <line x1="52" y1="154" x2="34" y2="154" stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Hips / glutes area */}
      <rect
        x="34" y="118" width="26" height="14"
        rx="4"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Feet on toes */}
      <ellipse cx="35" cy="136" rx="7" ry="4" fill="var(--color-primary, #ABFF35)" />
      <ellipse cx="52" cy="136" rx="7" ry="4" fill="var(--color-primary, #ABFF35)" />
    </svg>
  )
}
