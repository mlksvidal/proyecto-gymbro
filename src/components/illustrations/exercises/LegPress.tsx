export function LegPress() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo prensa de piernas"
      fill="none"
    >
      {/* Machine seat/back — reclined */}
      <rect x="18" y="100" width="70" height="55" rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2"
        opacity="0.7"
      />
      {/* Machine frame (sled rails) */}
      <line x1="22"  y1="52" x2="188" y2="52" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      <line x1="22"  y1="65" x2="188" y2="65" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      {/* Frame side */}
      <line x1="22" y1="52" x2="22"  y2="155" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      <line x1="188" y1="52" x2="188" y2="100" stroke="var(--color-primary, #ABFF35)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />

      {/* Sled / footplate */}
      <rect x="144" y="44" width="38" height="30" rx="4"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />
      {/* Plate on sled */}
      <circle cx="160" cy="59" r="12" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />
      <circle cx="160" cy="59" r="6" stroke="var(--color-primary, #ABFF35)" strokeWidth="1.5" />

      {/* Head (reclining) */}
      <circle
        cx="34" cy="96" r="11"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso reclined */}
      <rect x="22" y="106" width="60" height="18" rx="5"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2"
      />

      {/* Hands on side handles */}
      <line x1="28"  y1="114" x2="22" y2="136" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="76"  y1="114" x2="82" y2="136" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />

      {/* Legs bent (pressing position) */}
      {/* Thighs angled up toward plate */}
      <line x1="36" y1="124" x2="112" y2="72" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />
      <line x1="64" y1="124" x2="140" y2="72" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />

      {/* Feet on plate */}
      <ellipse cx="116" cy="68" rx="10" ry="7" fill="var(--color-primary, #ABFF35)" />
      <ellipse cx="140" cy="68" rx="10" ry="7" fill="var(--color-primary, #ABFF35)" />

      {/* Quad highlight */}
      <path
        d="M48 124 Q80 100 112 76"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
        fill="none"
      />
    </svg>
  )
}
