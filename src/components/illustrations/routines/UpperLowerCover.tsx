/** Upper / Lower Cover — escena con barbell overhead y sentadilla */
export function UpperLowerCover() {
  return (
    <svg
      viewBox="0 0 320 180"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Upper / Lower — tren superior e inferior"
      fill="none"
      className="w-full h-full"
    >
      {/* Background glow */}
      <ellipse cx="160" cy="90" rx="130" ry="65" fill="var(--color-primary, #ABFF35)" opacity="0.04" />

      {/* === LEFT: overhead press side === */}
      {/* Overhead barbell */}
      <line x1="28" y1="42" x2="148" y2="42" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <rect x="18"  y="30" width="10" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />
      <rect x="148" y="30" width="10" height="24" rx="2" fill="var(--color-primary, #ABFF35)" />

      {/* Left Bro — OHP */}
      {/* Head */}
      <circle cx="72" cy="60" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />
      {/* Arms up */}
      <line x1="62" y1="56" x2="50"  y2="42" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="82" y1="56" x2="94"  y2="42" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      {/* Delt highlight */}
      <path d="M60 54 Q72 47 84 54"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Torso */}
      <rect x="60" y="72" width="24" height="38" rx="5"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />
      {/* Legs */}
      <line x1="66" y1="110" x2="60" y2="148" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="78" y1="110" x2="84" y2="148" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="50" y1="158" x2="70" y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="76" y1="158" x2="96" y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="148" x2="58" y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="84" y1="148" x2="86" y2="158" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />

      {/* Vertical divider */}
      <line x1="160" y1="30" x2="160" y2="168" stroke="var(--color-primary, #ABFF35)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6 4" opacity="0.25" />

      {/* === RIGHT: squat side === */}
      {/* Squat rack minimal */}
      <line x1="174" y1="28" x2="174" y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      <line x1="302" y1="28" x2="302" y2="170" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      {/* Bar on hooks */}
      <line x1="174" y1="62" x2="182" y2="62" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" />
      <line x1="302" y1="62" x2="294" y2="62" stroke="var(--color-primary, #ABFF35)" strokeWidth="3" strokeLinecap="round" />

      {/* Barbell squat */}
      <line x1="172" y1="72" x2="304" y2="72" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <rect x="163" y="62" width="10" height="20" rx="2" fill="var(--color-primary, #ABFF35)" />
      <rect x="303" y="62" width="10" height="20" rx="2" fill="var(--color-primary, #ABFF35)" />

      {/* Right Bro — squat */}
      <circle cx="238" cy="60" r="12"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />
      <rect x="224" y="72" width="28" height="24" rx="5"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />
      {/* Quad highlight */}
      <path d="M228 76 Q238 70 248 76"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Thighs wide */}
      <line x1="226" y1="96" x2="202" y2="128" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />
      <line x1="250" y1="96" x2="274" y2="128" stroke="var(--color-primary, #ABFF35)" strokeWidth="8" strokeLinecap="round" />
      {/* Shins */}
      <line x1="202" y1="128" x2="204" y2="162" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="274" y1="128" x2="272" y2="162" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      {/* Feet */}
      <line x1="192" y1="162" x2="216" y2="162" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="260" y1="162" x2="284" y2="162" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
