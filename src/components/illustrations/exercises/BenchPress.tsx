export function BenchPress() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo bench press"
      fill="none"
    >
      {/* Bench */}
      <rect
        x="38" y="115" width="124" height="10"
        rx="3"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />
      {/* Bench legs */}
      <line x1="52"  y1="125" x2="48"  y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" />
      <line x1="148" y1="125" x2="152" y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" />

      {/* Head */}
      <circle
        cx="42" cy="108" r="11"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso lying */}
      <rect
        x="52" y="103" width="82" height="18"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Chest muscle highlight */}
      <path
        d="M68 107 Q93 102 118 107"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Left arm holding bar */}
      <line x1="72"  y1="103" x2="72"  y2="58" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Right arm holding bar */}
      <line x1="112" y1="103" x2="112" y2="58" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Barbell */}
      <line x1="24" y1="55" x2="176" y2="55" stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Plates left */}
      <rect x="18" y="42" width="9" height="26" rx="2" fill="var(--color-primary, #ABFF35)" />
      {/* Plates right */}
      <rect x="173" y="42" width="9" height="26" rx="2" fill="var(--color-primary, #ABFF35)" />

      {/* Legs on bench */}
      <line x1="134" y1="120" x2="164" y2="120" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      {/* Feet down */}
      <line x1="164" y1="120" x2="166" y2="148" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
