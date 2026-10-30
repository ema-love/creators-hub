import { ArtSvg, DISPLAY, MONO, useArtIds, type ArtProps } from './shared'

const FRAME_SCENES = ['#1A4A3A', '#C4622D', '#2b3138', '#2D7A5F', '#8a4320', '#1f2a33', '#1A4A3A', '#C4622D']

/** The set: cinema camera, clapperboard, screenplay page and a running strip of film. */
export function FilmArt(props: ArtProps) {
  const id = useArtIds()
  return (
    <ArtSvg {...props}>
      <defs>
        <linearGradient id={id('bg')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b1f24" />
          <stop offset="1" stopColor="#0b0c0e" />
        </linearGradient>
        <linearGradient id={id('beam')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F5F0E8" stopOpacity="0.16" />
          <stop offset="1" stopColor="#F5F0E8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id('lens')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#00E5A0" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#1A4A3A" />
          <stop offset="1" stopColor="#050505" />
        </radialGradient>
        <pattern id={id('clap')} width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="60" height="60" fill="#0A0A0A" />
          <rect width="30" height="60" fill="#F5F0E8" />
        </pattern>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F5F0E8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#F5F0E8" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1600" height="1000" fill={`url(#${id('bg')})`} />
      <path d="M1060 -20 L1160 -20 L1580 1000 L620 1000 Z" fill={`url(#${id('beam')})`} />
      <rect x="1040" y="-30" width="140" height="40" rx="8" fill="#2b3138" />

      {/* Tripod */}
      <path d="M370 620 L240 960 M370 620 L372 990 M370 620 L500 960" stroke="#A4B2C0" strokeWidth="10" strokeLinecap="round" />
      <path d="M300 800 L440 800" stroke="#A4B2C0" strokeWidth="6" />
      <rect x="320" y="600" width="100" height="34" rx="6" fill="#2b3138" />

      {/* Camera */}
      <g>
        <path d="M250 330 L250 300 Q250 282 268 282 L420 282 Q438 282 438 300 L438 330" fill="none" stroke="#A4B2C0" strokeWidth="12" />
        <rect x="170" y="330" width="380" height="270" rx="18" fill="#22272d" stroke="#A4B2C0" strokeOpacity="0.5" strokeWidth="2" />
        <rect x="196" y="360" width="170" height="110" rx="8" fill="#0A0A0A" />
        <rect x="206" y="370" width="150" height="90" rx="4" fill="#1A4A3A" />
        <path d="M206 440 L250 405 L290 430 L320 410 L356 440 L356 460 L206 460 Z" fill="#2D7A5F" />
        <circle cx="320" cy="392" r="10" fill="#F5F0E8" opacity="0.8" />
        <circle cx="210" cy="510" r="9" fill="#C4622D" />
        <text x="228" y="517" fontFamily={MONO} fontSize="18" fill="#C4622D">REC</text>
        <text x="200" y="566" fontFamily={MONO} fontSize="16" fill="#A4B2C0">00:04:12:08</text>
        <circle cx="470" cy="400" r="22" fill="#2b3138" stroke="#A4B2C0" strokeOpacity="0.5" />
        <circle cx="470" cy="470" r="14" fill="#2b3138" stroke="#A4B2C0" strokeOpacity="0.5" />
        {/* Lens barrel */}
        <rect x="550" y="370" width="190" height="190" fill="#2b3138" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={566 + i * 34} y="364" width="14" height="202" rx="3" fill="#3a414a" />
        ))}
        <path d="M740 360 L840 300 L840 630 L740 570 Z" fill="#1b1f24" stroke="#A4B2C0" strokeOpacity="0.4" strokeWidth="2" />
        <ellipse cx="840" cy="465" rx="46" ry="165" fill="#0A0A0A" />
        <ellipse cx="842" cy="465" rx="34" ry="128" fill={`url(#${id('lens')})`} />
        <ellipse cx="832" cy="420" rx="8" ry="30" fill="#F5F0E8" opacity="0.5" />
      </g>

      {/* Clapperboard */}
      <g transform="rotate(4 1250 340)">
        <rect x="1030" y="230" width="440" height="290" rx="10" fill="#0A0A0A" stroke="#F5F0E8" strokeOpacity="0.8" strokeWidth="3" />
        <rect x="1030" y="190" width="440" height="44" fill={`url(#${id('clap')})`} />
        <g transform="rotate(-14 1032 190)">
          <rect x="1030" y="140" width="440" height="44" fill={`url(#${id('clap')})`} />
        </g>
        <path d="M1030 300 L1470 300 M1030 380 L1470 380 M1176 300 L1176 450 M1322 300 L1322 450 M1030 450 L1470 450" stroke="#F5F0E8" strokeOpacity="0.6" strokeWidth="2" />
        <text x="1050" y="278" fontFamily={DISPLAY} fontSize="26" fontWeight="600" fill="#F5F0E8">PROD. CREATORS HUB 001</text>
        {[
          ['SCENE', '01'],
          ['TAKE', '03'],
          ['ROLL', 'A'],
        ].map(([k, v], i) => (
          <g key={k}>
            <text x={1050 + i * 146} y="326" fontFamily={DISPLAY} fontSize="16" letterSpacing="3" fill="#A4B2C0">{k}</text>
            <text x={1050 + i * 146} y="368" fontFamily={DISPLAY} fontSize="34" fontWeight="600" fill="#F5F0E8">{v}</text>
          </g>
        ))}
        <text x="1050" y="420" fontFamily={DISPLAY} fontSize="16" letterSpacing="3" fill="#A4B2C0">DATE</text>
        <text x="1196" y="420" fontFamily={DISPLAY} fontSize="22" fill="#F5F0E8">19.12.26</text>
      </g>

      {/* Screenplay page */}
      <g transform="rotate(-6 1000 620)">
        <rect x="868" y="430" width="300" height="390" fill="#0A0A0A" opacity="0.35" transform="translate(10 12)" />
        <rect x="868" y="430" width="300" height="390" fill="#F5F0E8" />
        <text x="896" y="478" fontFamily={MONO} fontSize="15" fontWeight="700" fill="#0A0A0A">INT. STUDIO — NIGHT</text>
        {[200, 236, 180].map((w, i) => (
          <rect key={i} x="896" y={500 + i * 18} width={w} height="7" rx="3" fill="#0A0A0A" opacity="0.45" />
        ))}
        <text x="1018" y="590" textAnchor="middle" fontFamily={MONO} fontSize="14" fontWeight="700" fill="#0A0A0A">CREATOR</text>
        {[150, 170, 120].map((w, i) => (
          <rect key={i} x={1018 - w / 2} y={604 + i * 17} width={w} height="7" rx="3" fill="#0A0A0A" opacity="0.6" />
        ))}
        {[236, 210, 236, 150].map((w, i) => (
          <rect key={i} x="896" y={680 + i * 18} width={w} height="7" rx="3" fill="#0A0A0A" opacity="0.45" />
        ))}
        <path d="M896 770 C940 740 980 790 1030 760" stroke="#C4622D" strokeWidth="3" fill="none" />
        <text x="1140" y="808" textAnchor="end" fontFamily={MONO} fontSize="13" fill="#0A0A0A" opacity="0.6">12.</text>
      </g>

      {/* Film strip */}
      <g transform="rotate(-5 800 860)">
        <rect x="-60" y="790" width="1720" height="150" fill="#0A0A0A" />
        {Array.from({ length: 44 }, (_, i) => (
          <g key={i}>
            <rect x={-50 + i * 40} y="800" width="18" height="12" rx="2" fill="#F5F0E8" opacity="0.75" />
            <rect x={-50 + i * 40} y="918" width="18" height="12" rx="2" fill="#F5F0E8" opacity="0.75" />
          </g>
        ))}
        {FRAME_SCENES.map((c, i) => {
          const x = -40 + i * 212
          return (
            <g key={i}>
              <rect x={x} y="824" width="196" height="82" fill={c} />
              <rect x={x} y="824" width="196" height="40" fill={`url(#${id('sky')})`} />
              <circle cx={x + 40 + (i % 3) * 50} cy={846 + (i % 2) * 6} r="10" fill="#F5F0E8" opacity="0.7" />
              <path d={`M${x} 906 L${x + 60} 870 L${x + 110} 892 L${x + 150} 876 L${x + 196} 900 L${x + 196} 906 Z`} fill="#0A0A0A" opacity="0.5" />
              <circle cx={x + 120} cy="872" r="7" fill="#0A0A0A" />
              <rect x={x + 113} y="879" width="14" height="27" rx="4" fill="#0A0A0A" />
            </g>
          )
        })}
      </g>

      <text x="80" y="110" fontFamily={DISPLAY} fontSize="20" letterSpacing="6" fill="#F5F0E8" opacity="0.55">
        THE SET · FILM &amp; STORYTELLING
      </text>
    </ArtSvg>
  )
}
