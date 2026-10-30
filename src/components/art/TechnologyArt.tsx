import { ArtSvg, DISPLAY, MONO, useArtIds, type ArtProps } from './shared'

const CODE: Array<Array<[string, string]>> = [
  [['const ', '#00E5A0'], ['room', '#F5F0E8'], [' = ', '#A4B2C0'], ['createRoom', '#7fd6ff'], ['({', '#A4B2C0']],
  [['  disciplines', '#F5F0E8'], [': [', '#A4B2C0']],
  [["    'fashion'", '#E8925C'], [', ', '#A4B2C0'], ["'technology'", '#E8925C'], [',', '#A4B2C0']],
  [["    'film'", '#E8925C'], [', ', '#A4B2C0'], ["'art & design'", '#E8925C'], [',', '#A4B2C0']],
  [['  ],', '#A4B2C0']],
  [['  city', '#F5F0E8'], [': ', '#A4B2C0'], ["'Lagos'", '#E8925C'], [',', '#A4B2C0']],
  [['})', '#A4B2C0']],
  [['', '#A4B2C0']],
  [['await ', '#00E5A0'], ['room', '#F5F0E8'], ['.', '#A4B2C0'], ['open', '#7fd6ff'], ['()', '#A4B2C0']],
  [['// everyone at the same table', '#5d6b66']],
]

/** The build: laptop with code, a phone prototype, a terminal and a circuit board. */
export function TechnologyArt(props: ArtProps) {
  const id = useArtIds()
  return (
    <ArtSvg {...props}>
      <defs>
        <linearGradient id={id('bg')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c1714" />
          <stop offset="1" stopColor="#07100d" />
        </linearGradient>
        <pattern id={id('dots')} width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="#00E5A0" opacity="0.16" />
        </pattern>
        <radialGradient id={id('glow')} cx="0.42" cy="0.42" r="0.55">
          <stop offset="0" stopColor="#00E5A0" stopOpacity="0.2" />
          <stop offset="1" stopColor="#00E5A0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('screen')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#111816" />
          <stop offset="1" stopColor="#0b0f0e" />
        </linearGradient>
        <filter id={id('led')} x="-1" y="-1" width="3" height="3">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <rect width="1600" height="1000" fill={`url(#${id('bg')})`} />
      <rect width="1600" height="1000" fill={`url(#${id('dots')})`} />
      <rect width="1600" height="1000" fill={`url(#${id('glow')})`} />

      {/* Laptop */}
      <rect x="240" y="170" width="760" height="490" rx="22" fill="#0A0A0A" stroke="#2D7A5F" strokeWidth="3" />
      <rect x="262" y="192" width="716" height="446" rx="8" fill={`url(#${id('screen')})`} />
      <rect x="262" y="192" width="716" height="40" rx="8" fill="#16201d" />
      {['#C4622D', '#A4B2C0', '#00E5A0'].map((c, i) => (
        <circle key={c} cx={288 + i * 22} cy="212" r="6" fill={c} />
      ))}
      <rect x="380" y="203" width="150" height="20" rx="5" fill="#0b0f0e" />
      <text x="392" y="218" fontFamily={MONO} fontSize="13" fill="#A4B2C0">room.ts</text>
      {CODE.map((line, i) => (
        <g key={i}>
          <text x="288" y={272 + i * 34} fontFamily={MONO} fontSize="16" fill="#3e4a46">
            {String(i + 1).padStart(2, ' ')}
          </text>
          <text x="330" y={272 + i * 34} fontFamily={MONO} fontSize="19" xmlSpace="preserve">
            {line.map(([t, c], j) => (
              <tspan key={j} fill={c}>
                {t}
              </tspan>
            ))}
          </text>
        </g>
      ))}
      <rect x="676" y="562" width="11" height="22" fill="#00E5A0" />
      <path d="M180 660 L1060 660 L1120 704 Q1124 714 1110 714 L130 714 Q116 714 120 704 Z" fill="#1a2420" />
      <rect x="560" y="660" width="120" height="10" rx="5" fill="#0A0A0A" />

      {/* Phone prototype */}
      <g>
        <rect x="1120" y="140" width="290" height="580" rx="44" fill="#0A0A0A" stroke="#A4B2C0" strokeOpacity="0.6" strokeWidth="2" />
        <rect x="1136" y="156" width="258" height="548" rx="32" fill="#F5F0E8" />
        <rect x="1225" y="168" width="80" height="22" rx="11" fill="#0A0A0A" />
        <text x="1160" y="236" fontFamily={DISPLAY} fontSize="26" fontWeight="600" fill="#0A0A0A">Tonight</text>
        <rect x="1160" y="252" width="120" height="8" rx="4" fill="#0A0A0A" opacity="0.25" />
        <rect x="1160" y="280" width="210" height="150" rx="18" fill="#1A4A3A" />
        <circle cx="1330" cy="314" r="20" fill="#00E5A0" />
        <rect x="1180" y="370" width="130" height="10" rx="5" fill="#F5F0E8" />
        <rect x="1180" y="392" width="90" height="8" rx="4" fill="#F5F0E8" opacity="0.5" />
        {[0, 1].map((r) => (
          <g key={r}>
            <circle cx="1182" cy={470 + r * 74} r="22" fill={r ? '#C4622D' : '#A4B2C0'} />
            <rect x="1216" y={458 + r * 74} width="130" height="10" rx="5" fill="#0A0A0A" opacity="0.7" />
            <rect x="1216" y={476 + r * 74} width="90" height="8" rx="4" fill="#0A0A0A" opacity="0.3" />
          </g>
        ))}
        <rect x="1160" y="616" width="210" height="50" rx="25" fill="#00E5A0" />
        <text x="1265" y="648" textAnchor="middle" fontFamily={DISPLAY} fontSize="18" fontWeight="600" fill="#0A0A0A">
          Join the room
        </text>
      </g>

      {/* Terminal */}
      <g>
        <rect x="900" y="760" width="460" height="190" rx="16" fill="#0A0A0A" stroke="#2D7A5F" strokeOpacity="0.7" strokeWidth="2" />
        <text x="928" y="808" fontFamily={MONO} fontSize="18" fill="#A4B2C0">
          <tspan fill="#00E5A0">$</tspan> npm run build
        </text>
        <text x="928" y="846" fontFamily={MONO} fontSize="18" fill="#5d6b66">compiling 4 disciplines…</text>
        <text x="928" y="884" fontFamily={MONO} fontSize="18" fill="#00E5A0">✓ ready in 1.3s</text>
        <rect x="928" y="902" width="10" height="20" fill="#F5F0E8" opacity="0.8" />
      </g>

      {/* Circuit board */}
      <g>
        <rect x="200" y="770" width="620" height="190" rx="14" fill="#123629" stroke="#2D7A5F" strokeWidth="2" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={224 + (i % 2) * 572} cy={794 + Math.floor(i / 2) * 142} r="7" fill="none" stroke="#A4B2C0" strokeWidth="2" />
        ))}
        <path d="M430 820 L330 820 L300 850 L250 850 M430 860 L360 860 L340 900 L260 900 M560 820 L640 820 L670 790 L740 790 M560 860 L700 860 L720 880 M560 900 L620 900 L650 930 L760 930" stroke="#00E5A0" strokeWidth="3" fill="none" strokeOpacity="0.85" />
        <rect x="430" y="800" width="130" height="120" rx="6" fill="#0A0A0A" />
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i}>
            <rect x="418" y={810 + i * 22} width="12" height="6" fill="#A4B2C0" />
            <rect x="560" y={810 + i * 22} width="12" height="6" fill="#A4B2C0" />
          </g>
        ))}
        <text x="495" y="866" textAnchor="middle" fontFamily={MONO} fontSize="14" fill="#A4B2C0">CH-001</text>
        {[
          { x: 250, y: 850, c: '#00E5A0' },
          { x: 720, y: 880, c: '#C4622D' },
          { x: 760, y: 930, c: '#00E5A0' },
        ].map((l, i) => (
          <g key={i}>
            <circle cx={l.x} cy={l.y} r="14" fill={l.c} opacity="0.7" filter={`url(#${id('led')})`} />
            <circle cx={l.x} cy={l.y} r="7" fill={l.c} />
          </g>
        ))}
        <rect x="320" y="912" width="46" height="14" rx="7" fill="#C4622D" opacity="0.85" />
        <rect x="660" y="800" width="46" height="14" rx="7" fill="#A4B2C0" opacity="0.85" />
      </g>

      {/* Pointer */}
      <path d="M1040 520 L1040 590 L1056 574 L1068 600 L1080 594 L1068 568 L1090 568 Z" fill="#F5F0E8" stroke="#0A0A0A" strokeWidth="3" />

      <text x="80" y="110" fontFamily={DISPLAY} fontSize="20" letterSpacing="6" fill="#F5F0E8" opacity="0.55">
        BUILD · TECHNOLOGY
      </text>
    </ArtSvg>
  )
}
