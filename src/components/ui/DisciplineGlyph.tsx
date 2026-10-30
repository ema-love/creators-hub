import type { MediaKind } from '../../content/media'

type GlyphProps = {
  kind: MediaKind
  className?: string
}

/**
 * Abstract line drawings, one per discipline. Used as art-directed stand-ins
 * for photography and as recurring motifs. Stroke inherits `currentColor`.
 */
export function DisciplineGlyph({ kind, className }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 160 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {glyphs[kind]}
    </svg>
  )
}

const dots = Array.from({ length: 6 * 4 }, (_, i) => ({ x: 30 + (i % 6) * 20, y: 20 + Math.floor(i / 6) * 20 }))

const glyphs: Record<MediaKind, React.ReactNode> = {
  technology: (
    <g>
      {dots.map((d) => (
        <circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r="1.1" fill="currentColor" stroke="none" opacity="0.5" />
      ))}
      <path d="M30 80 H70 V40 H110 V60 H130" />
      <path d="M50 20 V60 H90 V80" opacity="0.6" />
      <circle cx="130" cy="60" r="4" />
      <circle cx="30" cy="80" r="4" />
    </g>
  ),
  fashion: (
    <g>
      <path d="M10 70 C40 20, 70 90, 100 40 S150 30, 155 60" />
      <path d="M10 76 C42 30, 72 96, 102 48 S150 40, 155 66" opacity="0.55" />
      <path d="M10 82 C44 40, 74 100, 104 56 S150 50, 155 72" opacity="0.3" />
      <path d="M118 12 L84 88" strokeWidth="1.6" />
      <ellipse cx="116" cy="17" rx="1.6" ry="4" transform="rotate(24 116 17)" />
    </g>
  ),
  film: (
    <g>
      <rect x="14" y="22" width="132" height="56" rx="2" />
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <rect x={20 + i * 12} y="26" width="5" height="4" rx="1" />
          <rect x={20 + i * 12} y="70" width="5" height="4" rx="1" />
        </g>
      ))}
      <rect x="22" y="36" width="36" height="28" opacity="0.5" />
      <rect x="62" y="36" width="36" height="28" />
      <rect x="102" y="36" width="36" height="28" opacity="0.5" />
    </g>
  ),
  art: (
    <g>
      <circle cx="62" cy="50" r="28" />
      <circle cx="94" cy="50" r="28" opacity="0.6" />
      <path d="M20 86 C50 70, 90 96, 140 74" strokeWidth="5" opacity="0.35" />
      <path d="M28 18 C60 30, 100 6, 136 22" opacity="0.6" />
    </g>
  ),
  design: (
    <g>
      <rect x="20" y="14" width="120" height="72" opacity="0.35" />
      <path d="M94 14 V86 M20 58 H140" opacity="0.35" />
      <circle cx="94" cy="58" r="28" />
      <rect x="28" y="22" width="40" height="28" />
      <path d="M20 86 L140 14" opacity="0.5" />
    </g>
  ),
  entrepreneurship: (
    <g>
      <path d="M16 84 H144" opacity="0.4" />
      <rect x="28" y="66" width="16" height="18" />
      <rect x="56" y="52" width="16" height="32" />
      <rect x="84" y="38" width="16" height="46" />
      <rect x="112" y="20" width="16" height="64" />
      <path d="M36 58 L64 44 L92 30 L120 12" strokeDasharray="2 4" />
    </g>
  ),
  community: (
    <g>
      {[
        [80, 50, 10],
        [50, 34, 7],
        [112, 32, 7],
        [44, 70, 6],
        [118, 70, 6],
        [80, 18, 5],
        [80, 84, 5],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
      ))}
      <path d="M80 50 L50 34 M80 50 L112 32 M80 50 L44 70 M80 50 L118 70 M80 50 L80 18 M80 50 L80 84" opacity="0.4" />
    </g>
  ),
}
