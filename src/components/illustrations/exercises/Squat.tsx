export function Squat() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo sentadilla"
      fill="none"
    >
      {/* Squat rack uprights */}
      <line x1="24" y1="40" x2="24" y2="165" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" />
      <line x1="176" y1="40" x2="176" y2="165" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" />
      {/* Rack hooks */}
      <line x1="24" y1="72" x2="34" y2="72" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" />
      <line x1="176" y1="72" x2="166" y2="72" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" />

      {/* Barbell on shoulders */}
      <line x1="32" y1="78" x2="168" y2="78" stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />
      {/* Plates */}
      <rect x="24" y="66" width="9" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />
      <rect x="167" y="66" width="9" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />

      {/* Head */}
      <circle
        cx="100" cy="54" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso leaning forward (squat position) */}
      <rect
        x="86" y="66" width="28" height="28"
        rx="5"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Quad highlight */}
      <path
        d="M90 70 Q100 66 110 70"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Thighs — wide squat stance */}
      <line x1="88"  y1="94" x2="60"  y2="130" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="112" y1="94" x2="140" y2="130" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />

      {/* Shins */}
      <line x1="60"  y1="130" x2="64"  y2="165" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="140" y1="130" x2="136" y2="165" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />

      {/* Feet */}
      <line x1="56"  y1="165" x2="72"  y2="165" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="128" y1="165" x2="144" y2="165" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
