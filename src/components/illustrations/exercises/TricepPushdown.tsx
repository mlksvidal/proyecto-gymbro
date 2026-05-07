export function TricepPushdown() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bro haciendo extensión de tríceps en polea"
      fill="none"
    >
      {/* Cable machine top */}
      <rect x="140" y="18" width="42" height="90" rx="4"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2"
        opacity="0.6"
      />
      {/* Pulley wheel */}
      <circle cx="154" cy="52" r="10" fill="var(--color-surface-elevated, #2D2D2D)" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" />

      {/* Cable bar (straight bar) */}
      <line x1="90" y1="86" x2="130" y2="86" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      {/* Cable line from bar to pulley */}
      <line x1="110" y1="86" x2="144" y2="54" stroke="var(--color-primary, #ABFF35)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" opacity="0.6" />

      {/* Head */}
      <circle
        cx="80" cy="44" r="13"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Torso upright */}
      <rect
        x="64" y="57" width="32" height="46"
        rx="6"
        fill="var(--color-surface-elevated, #2D2D2D)"
        stroke="var(--color-primary, #ABFF35)"
        strokeWidth="2.5"
      />

      {/* Upper arms locked at sides */}
      <line x1="72"  y1="68" x2="72"  y2="94" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="92"  y1="68" x2="108" y2="86" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Forearms pushing DOWN — extended */}
      <line x1="72"  y1="94" x2="72"  y2="130" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="86" x2="108" y2="122" stroke="var(--color-primary, #ABFF35)" strokeWidth="5" strokeLinecap="round" />

      {/* Hands on bar */}
      <circle cx="72"  cy="130" r="5" fill="var(--color-primary, #ABFF35)" />
      <circle cx="108" cy="122" r="5" fill="var(--color-primary, #ABFF35)" />

      {/* Tricep highlight (back of upper arm) */}
      <path
        d="M68 70 Q60 82 62 98"
        stroke="var(--color-primary-bright, #D8FF3D)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
        fill="none"
      />

      {/* Legs standing slightly offset */}
      <line x1="72"  y1="103" x2="66"  y2="162" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="88"  y1="103" x2="92"  y2="162" stroke="var(--color-primary, #ABFF35)" strokeWidth="7" strokeLinecap="round" />
      <line x1="66"  y1="162" x2="64"  y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />
      <line x1="92"  y1="162" x2="94"  y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="6" strokeLinecap="round" />

      {/* Feet */}
      <line x1="52"  y1="178" x2="74"  y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
      <line x1="84"  y1="178" x2="106" y2="178" stroke="var(--color-primary, #ABFF35)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
