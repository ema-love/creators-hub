import { ArtSvg, DISPLAY, MONO, useArtIds, type ArtProps } from './shared'

const SWATCHES = [
  { c: '#0A0A0A', t: '#F5F0E8', hex: '0A0A0A' },
  { c: '#F5F0E8', t: '#0A0A0A', hex: 'F5F0E8' },
  { c: '#1A4A3A', t: '#F5F0E8', hex: '1A4A3A' },
  { c: '#00E5A0', t: '#0A0A0A', hex: '00E5A0' },
  { c: '#C4622D', t: '#0A0A0A', hex: 'C4622D' },
]

/** The studio: a painting on an easel, palette and brushes, a vector artboard, type and swatches. */
export function ArtDesignArt(props: ArtProps) {
  const id = useArtIds()
  return (
    <ArtSvg {...props}>
      <defs>
        <linearGradient id={id('bg')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f5544" />
          <stop offset="1" stopColor="#0d2a1f" />
        </linearGradient>
        <radialGradient id={id('window')} cx="0.15" cy="0.05" r="0.7">
          <stop offset="0" stopColor="#F5F0E8" stopOpacity="0.22" />
          <stop offset="1" stopColor="#F5F0E8" stopOpacity="0" />
        </radialGradient>
        <pattern id={id('grid')} width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0 L0 0 L0 30" fill="none" stroke="#F5F0E8" strokeOpacity="0.07" />
        </pattern>
        <clipPath id={id('canvas')}>
          <rect x="250" y="140" width="500" height="620" />
        </clipPath>
      </defs>

      <rect width="1600" height="1000" fill={`url(#${id('bg')})`} />
      <rect width="1600" height="1000" fill={`url(#${id('window')})`} />
      <path d="M0 860 L1600 820 L1600 1000 L0 1000 Z" fill="#0A0A0A" opacity="0.25" />

      {/* Easel */}
      <path d="M500 90 L500 980 M330 980 L490 120 M670 980 L510 120" stroke="#b07a52" strokeWidth="16" strokeLinecap="round" />
      <rect x="230" y="760" width="540" height="22" rx="4" fill="#8f5f3d" />

      {/* Painting */}
      <rect x="258" y="150" width="500" height="620" fill="#0A0A0A" opacity="0.35" />
      <rect x="250" y="140" width="500" height="620" fill="#F5F0E8" />
      <g clipPath={`url(#${id('canvas')})`}>
        <rect x="250" y="520" width="500" height="240" fill="#1A4A3A" />
        <circle cx="440" cy="360" r="150" fill="#C4622D" />
        <circle cx="440" cy="360" r="96" fill="none" stroke="#0A0A0A" strokeWidth="10" />
        <path d="M560 160 C700 220 720 400 640 520" stroke="#00E5A0" strokeWidth="34" fill="none" strokeLinecap="round" />
        <path d="M250 600 C360 560 470 640 600 590 S760 560 760 560" stroke="#F5F0E8" strokeWidth="14" fill="none" />
        <path d="M270 690 C380 650 520 720 740 680" stroke="#0A0A0A" strokeWidth="22" fill="none" strokeLinecap="round" opacity="0.85" />
        {Array.from({ length: 24 }, (_, i) => (
          <circle key={i} cx={290 + (i % 6) * 34} cy={196 + Math.floor(i / 6) * 34} r="5" fill="#0A0A0A" opacity="0.5" />
        ))}
        <path d="M600 760 L760 600 L760 760 Z" fill="#2D7A5F" />
      </g>
      <path d="M690 740 C700 728 716 744 728 732" stroke="#0A0A0A" strokeWidth="3" fill="none" />

      {/* Palette */}
      <g transform="rotate(-10 880 760)">
        <path d="M760 700 C760 620 900 600 990 640 C1060 670 1060 740 1010 760 C980 772 990 810 960 840 C900 900 760 820 760 700 Z" fill="#E8E4DC" />
        <ellipse cx="830" cy="780" rx="26" ry="20" fill={`url(#${id('bg')})`} />
        {[
          ['#C4622D', 840, 660],
          ['#00E5A0', 912, 652],
          ['#1A4A3A', 978, 690],
          ['#0A0A0A', 990, 740],
          ['#F5F0E8', 900, 712],
          ['#A4B2C0', 930, 800],
        ].map(([c, x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y} c14 -12 34 -6 34 10 c0 18 -20 26 -34 18 c-10 -6 -12 -20 0 -28 z`}
            fill={c as string}
            stroke="#0A0A0A"
            strokeOpacity={c === '#F5F0E8' ? 0.2 : 0}
          />
        ))}
      </g>

      {/* Brush jar */}
      <g>
        {[
          { x1: 1040, tip: '#C4622D', r: -14 },
          { x1: 1066, tip: '#00E5A0', r: -4 },
          { x1: 1090, tip: '#0A0A0A', r: 8 },
          { x1: 1112, tip: '#F5F0E8', r: 16 },
        ].map((b, i) => (
          <g key={i} transform={`rotate(${b.r} ${b.x1} 760)`}>
            <rect x={b.x1 - 5} y="540" width="10" height="230" rx="5" fill="#b07a52" />
            <rect x={b.x1 - 6} y="520" width="12" height="28" fill="#A4B2C0" />
            <path d={`M${b.x1 - 7} 522 Q${b.x1} 470 ${b.x1 + 7} 522 Z`} fill={b.tip} />
          </g>
        ))}
        <rect x="1010" y="680" width="140" height="180" rx="16" fill="#F5F0E8" fillOpacity="0.18" stroke="#F5F0E8" strokeOpacity="0.6" strokeWidth="3" />
        <rect x="1016" y="780" width="128" height="74" rx="10" fill="#00E5A0" opacity="0.18" />
      </g>

      {/* Vector artboard */}
      <g>
        <rect x="1190" y="110" width="350" height="470" rx="6" fill="#0A0A0A" />
        <rect x="1190" y="110" width="350" height="470" rx="6" fill={`url(#${id('grid')})`} />
        <text x="1190" y="96" fontFamily={MONO} fontSize="15" fill="#F5F0E8" opacity="0.6">Artboard 1 — 001</text>
        <path d="M1240 380 C1260 220 1440 200 1480 320 S1360 480 1300 420" stroke="#F5F0E8" strokeWidth="5" fill="none" />
        <path d="M1240 380 L1250 300 M1260 220 L1340 196 M1480 320 L1500 400 M1300 420 L1260 380" stroke="#00E5A0" strokeWidth="2" />
        {(
          [
            [1240, 380],
            [1360, 214],
            [1480, 320],
            [1300, 420],
          ] as const
        ).map(([x, y], i) => (
          <rect key={i} x={x - 8} y={y - 8} width="16" height="16" fill={i === 2 ? '#00E5A0' : '#0A0A0A'} stroke="#00E5A0" strokeWidth="3" />
        ))}
        {(
          [
            [1250, 300],
            [1340, 196],
            [1500, 400],
            [1260, 380],
          ] as const
        ).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="6" fill="#00E5A0" />
        ))}
        <text x="1220" y="545" fontFamily={DISPLAY} fontSize="96" fontWeight="600" fill="#F5F0E8" letterSpacing="-4">Aa</text>
        <text x="1380" y="510" fontFamily={MONO} fontSize="14" fill="#A4B2C0">Space Grotesk</text>
        <text x="1380" y="534" fontFamily={MONO} fontSize="14" fill="#A4B2C0">96 / -4</text>
        {/* Pen tool cursor */}
        <path d="M1500 250 L1520 290 L1512 296 L1496 262 L1490 268 Z" fill="#F5F0E8" stroke="#0A0A0A" strokeWidth="2" />
      </g>

      {/* Swatches */}
      {SWATCHES.map((s, i) => (
        <g key={s.hex} transform={`rotate(${(i - 2) * 3} ${1240 + i * 66} 700)`}>
          <rect x={1190 + i * 70} y="620" width="62" height="150" rx="6" fill="#0A0A0A" opacity="0.3" transform="translate(5 6)" />
          <rect x={1190 + i * 70} y="620" width="62" height="150" rx="6" fill="#F5F0E8" />
          <rect x={1194 + i * 70} y="624" width="54" height="104" rx="4" fill={s.c} stroke="#0A0A0A" strokeOpacity="0.15" />
          <text x={1221 + i * 70} y="755" textAnchor="middle" fontFamily={MONO} fontSize="11" fill="#0A0A0A">
            {s.hex}
          </text>
        </g>
      ))}

      {/* Pencil */}
      <g transform="rotate(-28 1250 900)">
        <rect x="1080" y="890" width="300" height="24" fill="#C4622D" />
        <rect x="1080" y="890" width="300" height="8" fill="#F5F0E8" opacity="0.25" />
        <rect x="1060" y="890" width="22" height="24" fill="#A4B2C0" />
        <path d="M1380 890 L1420 902 L1380 914 Z" fill="#E8E4DC" />
        <path d="M1406 898 L1420 902 L1406 906 Z" fill="#0A0A0A" />
      </g>

      <text x="80" y="110" fontFamily={DISPLAY} fontSize="20" letterSpacing="6" fill="#F5F0E8" opacity="0.55">
        STUDIO · ARTS &amp; DESIGN
      </text>
    </ArtSvg>
  )
}
