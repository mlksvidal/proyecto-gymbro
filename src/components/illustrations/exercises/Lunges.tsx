export function Lunges() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo zancadas"
      fill="none"
    >
      {/* Head */}
      <circle
        cx="100" cy="38" r="13"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso upright */}
      <rect
        x="84" y="51" width="32" height="46"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Dumbbells at sides */}
      {/* Left */}
      <rect x="56"  y="90" width="8" height="18" rx="2.5" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />
      <line x1="64" y1="99" x2="84"  y2="99"  stroke="var(--color-primary, #ABFF35)" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="46"  y="90" width="10" height="18" rx="2.5" fill="var(--color-primary, #ABFF35)" opacity="0.7" />
      {/* Right */}
      <rect x="136" y="90" width="8" height="18" rx="2.5" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />
      <line x1="128" y1="99" x2="116" y2="99" stroke="var(--color-primary, #ABFF35)" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="144" y="90" width="10" height="18" rx="2.5" fill="var(--color-primary, #ABFF35)" opacity="0.7" />

      {/* Arms straight down */}
      <line x1="84"  y1="72" x2="68"  y2="104" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="116" y1="72" x2="132" y2="104" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Quad highlight */}
      <path
        d="M88 55 Q100 50 112 55"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Front leg (left — forward lunge) */}
      {/* Thigh forward */}
      <line x1="90" y1="97" x2="64" y2="140" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />
      {/* Shin mostly vertical */}
      <line x1="64" y1="140" x2="70" y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />

      {/* Back leg (right — extended back) */}
      {/* Thigh back */}
      <line x1="110" y1="97" x2="148" y2="128" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />
      {/* Shin down — knee near floor */}
      <line x1="148" y1="128" x2="152" y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />

      {/* Front foot */}
      <line x1="56"  y1="178" x2="80"  y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      {/* Back foot / toes */}
      <line x1="144" y1="178" x2="164" y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
