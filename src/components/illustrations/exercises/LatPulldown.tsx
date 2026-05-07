export function LatPulldown() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo jalón al pecho"
      fill="none"
    >
      {/* Machine frame */}
      <line x1="100" y1="18" x2="100" y2="55" stroke="var(--color-primary, #ABFF35)" strokeWidth="3.5" strokeLinecap="round" />
      {/* Horizontal top bar of machine */}
      <line x1="60" y1="18" x2="140" y2="18" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      {/* Side uprights */}
      <line x1="60"  y1="18" x2="60"  y2="190" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <line x1="140" y1="18" x2="140" y2="190" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

      {/* Cable bar (wide grip) */}
      <line x1="64" y1="55" x2="136" y2="55" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      {/* Cable lines */}
      <line x1="64"  y1="55" x2="100" y2="22" stroke="var(--color-primary, #ABFF35)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3" opacity="0.5" />
      <line x1="136" y1="55" x2="100" y2="22" stroke="var(--color-primary, #ABFF35)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3" opacity="0.5" />

      {/* Head */}
      <circle
        cx="100" cy="78" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Left arm up-wide grip */}
      <line x1="86"  y1="72" x2="68"  y2="55" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Right arm up-wide grip */}
      <line x1="114" y1="72" x2="132" y2="55" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Torso seated */}
      <rect
        x="84" y="90" width="32" height="44"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Lat highlight (V-taper) */}
      <path
        d="M86 94 Q100 88 114 94"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Knee pad (machine) */}
      <rect x="72" y="130" width="56" height="10" rx="4"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Thighs horizontal (seated) */}
      <line x1="84"  y1="134" x2="56"  y2="138" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="116" y1="134" x2="144" y2="138" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />

      {/* Shins down */}
      <line x1="56"  y1="138" x2="52"  y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="144" y1="138" x2="148" y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />

      {/* Feet */}
      <line x1="40"  y1="175" x2="62"  y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="138" y1="175" x2="160" y2="175" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
