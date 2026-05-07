/** Leg Day Cover — escena con squat rack y Bro */
export function LegDayCover() {
  return (
    <svg
      viewBox="0 0 320 180"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Leg Day — piernas y glúteos"
      fill="none"
      className="w-full h-full"
    >
      {/* Background glow */}
      <ellipse cx="160" cy="100" rx="130" ry="65" fill="var(--color-primary, #ABFF35)" opacity="0.04" />

      {/* === SQUAT RACK === */}
      {/* Left upright */}
      <line x1="60"  y1="20" x2="60"  y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      {/* Right upright */}
      <line x1="260" y1="20" x2="260" y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      {/* Top crossbar */}
      <line x1="56"  y1="22" x2="264" y2="22" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Hooks left */}
      <line x1="60"  y1="65" x2="78"  y2="65" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" />
      {/* Hooks right */}
      <line x1="260" y1="65" x2="242" y2="65" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" />
      {/* Base feet */}
      <line x1="40"  y1="170" x2="80"  y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <line x1="240" y1="170" x2="280" y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

      {/* === BARBELL === */}
      <line x1="50" y1="72" x2="270" y2="72" stroke="var(--color-primary, #ABFF35)" strokeWidth="4.5" strokeLinecap="round" />
      {/* Plates left */}
      <rect x="38"  y="60" width="12" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />
      <rect x="50"  y="62" width="9"  height="20" rx="2" fill="var(--color-primary, #ABFF35)" opacity="0.55" />
      {/* Plates right */}
      <rect x="270" y="60" width="12" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />
      <rect x="261" y="62" width="9"  height="20" rx="2" fill="var(--color-primary, #ABFF35)" opacity="0.55" />

      {/* === BRO in squat position === */}
      {/* Head */}
      <circle cx="160" cy="58" r="13"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />
      {/* Torso */}
      <rect x="144" y="70" width="32" height="26" rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Quad / leg highlight */}
      <path d="M148 74 Q160 68 172 74"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Thighs wide squat */}
      <line x1="146" y1="96" x2="110" y2="132" stroke="var(--color-primary, #ABFF35)" strokeWidth="9" strokeLinecap="round" />
      <line x1="174" y1="96" x2="210" y2="132" stroke="var(--color-primary, #ABFF35)" strokeWidth="9" strokeLinecap="round" />

      {/* Shins */}
      <line x1="110" y1="132" x2="112" y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="210" y1="132" x2="208" y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />

      {/* Feet */}
      <line x1="98"  y1="168" x2="124" y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="196" y1="168" x2="222" y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
