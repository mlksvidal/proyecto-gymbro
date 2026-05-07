export function OverheadPress() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo press militar"
      fill="none"
    >
      {/* Barbell overhead */}
      <line x1="22" y1="38" x2="178" y2="38" stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />
      {/* Plates */}
      <rect x="14"  y="26" width="10" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />
      <rect x="176" y="26" width="10" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />

      {/* Arms extended up */}
      <line x1="78"  y1="38" x2="84"  y2="72" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="122" y1="38" x2="116" y2="72" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Head */}
      <circle
        cx="100" cy="80" r="13"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso */}
      <rect
        x="84" y="93" width="32" height="44"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Shoulder / delt highlight */}
      <path
        d="M82 70 Q100 64 118 70"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Legs standing */}
      <line x1="92"  y1="137" x2="86"  y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="108" y1="137" x2="114" y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />

      {/* Feet */}
      <line x1="76"  y1="175" x2="95"  y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="105" y1="175" x2="124" y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
