import { ArtSvg, DISPLAY, useArtIds, type ArtProps } from './shared'

/** The atelier: a dress form in patterned cloth, tape measure, pattern pieces, scissors, thread. */
export function FashionArt(props: ArtProps) {
  const id = useArtIds()
  return (
    <ArtSvg {...props}>
      <defs>
        <linearGradient id={id('bg')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b1c0d" />
          <stop offset="1" stopColor="#170b05" />
        </linearGradient>
        <radialGradient id={id('light')} cx="0.32" cy="0.2" r="0.6">
          <stop offset="0" stopColor="#C4622D" stopOpacity="0.55" />
          <stop offset="1" stopColor="#C4622D" stopOpacity="0" />
        </radialGradient>
        {/* Wax-print inspired repeat */}
        <pattern id={id('print')} width="96" height="96" patternUnits="userSpaceOnUse">
          <rect width="96" height="96" fill="#C4622D" />
          <circle cx="48" cy="48" r="26" fill="#F5F0E8" />
          <circle cx="48" cy="48" r="17" fill="#1A4A3A" />
          <circle cx="48" cy="48" r="7" fill="#00E5A0" />
          <path d="M0 0 L16 0 L0 16 Z M96 0 L80 0 L96 16 Z M0 96 L16 96 L0 80 Z M96 96 L80 96 L96 80 Z" fill="#0A0A0A" />
          <circle cx="0" cy="48" r="6" fill="#0A0A0A" />
          <circle cx="96" cy="48" r="6" fill="#0A0A0A" />
          <circle cx="48" cy="0" r="6" fill="#0A0A0A" />
          <circle cx="48" cy="96" r="6" fill="#0A0A0A" />
        </pattern>
        <pattern id={id('stripe')} width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="40" height="40" fill="#1A4A3A" />
          <rect width="14" height="40" fill="#F5F0E8" />
          <rect x="20" width="4" height="40" fill="#00E5A0" />
        </pattern>
        <pattern id={id('check')} width="48" height="48" patternUnits="userSpaceOnUse">
          <rect width="48" height="48" fill="#0A0A0A" />
          <rect width="24" height="24" fill="#C4622D" />
          <rect x="24" y="24" width="24" height="24" fill="#C4622D" />
          <rect x="10" y="10" width="4" height="4" fill="#F5F0E8" />
          <rect x="34" y="34" width="4" height="4" fill="#F5F0E8" />
        </pattern>
        <linearGradient id={id('fold')} x1="0" x2="1">
          <stop offset="0" stopColor="#0A0A0A" stopOpacity="0.35" />
          <stop offset="0.45" stopColor="#0A0A0A" stopOpacity="0" />
          <stop offset="1" stopColor="#0A0A0A" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      <rect width="1600" height="1000" fill={`url(#${id('bg')})`} />
      <rect width="1600" height="1000" fill={`url(#${id('light')})`} />

      {/* Cutting table */}
      <path d="M760 690 L1600 640 L1600 1000 L700 1000 Z" fill="#E8E4DC" opacity="0.08" />
      <path d="M760 690 L1600 640" stroke="#F5F0E8" strokeOpacity="0.2" strokeWidth="2" />

      {/* Swatch cards */}
      {[
        { x: 880, y: 130, r: -8, f: id('print') },
        { x: 1040, y: 120, r: 4, f: id('stripe') },
        { x: 1200, y: 140, r: -3, f: id('check') },
        { x: 1360, y: 125, r: 7, f: null },
      ].map((c, i) => (
        <g key={i} transform={`rotate(${c.r} ${c.x + 70} ${c.y + 95})`}>
          <rect x={c.x + 6} y={c.y + 8} width="140" height="190" rx="6" fill="#0A0A0A" opacity="0.35" />
          <rect x={c.x} y={c.y} width="140" height="190" rx="6" fill="#F5F0E8" />
          <rect x={c.x + 12} y={c.y + 12} width="116" height="130" rx="3" fill={c.f ? `url(#${c.f})` : '#00E5A0'} />
          <rect x={c.x + 12} y={c.y + 156} width="70" height="7" rx="3.5" fill="#0A0A0A" opacity="0.6" />
          <rect x={c.x + 12} y={c.y + 170} width="44" height="6" rx="3" fill="#0A0A0A" opacity="0.3" />
        </g>
      ))}

      {/* Dress form stand */}
      <rect x="512" y="790" width="16" height="130" fill="#0A0A0A" />
      <path d="M520 910 L420 975 M520 910 L620 975 M520 910 L520 985" stroke="#0A0A0A" strokeWidth="14" strokeLinecap="round" />
      {/* Dress form */}
      <rect x="500" y="178" width="40" height="64" rx="10" fill="#E8E4DC" />
      <ellipse cx="520" cy="178" rx="26" ry="9" fill="#d6d0c4" />
      <path
        d="M430 250 C470 234 570 234 610 250 C642 262 652 300 648 340 C642 400 600 432 598 470 C596 520 640 560 640 620 L400 620 C400 560 444 520 442 470 C440 432 398 400 392 340 C388 300 398 262 430 250 Z"
        fill="#E8E4DC"
      />

      {/* Draped garment */}
      <path
        d="M436 262 C500 248 560 250 606 262 L598 336 C580 420 556 462 596 522 C640 600 700 704 740 820 L300 820 C342 700 400 600 444 522 C474 462 452 404 432 336 Z"
        fill={`url(#${id('print')})`}
      />
      <path
        d="M436 262 C500 248 560 250 606 262 L598 336 C580 420 556 462 596 522 C640 600 700 704 740 820 L300 820 C342 700 400 600 444 522 C474 462 452 404 432 336 Z"
        fill={`url(#${id('fold')})`}
      />
      <path d="M470 540 C450 640 420 720 400 818 M560 540 C590 640 630 720 650 818 M515 560 C515 660 512 740 515 818" stroke="#0A0A0A" strokeOpacity="0.28" strokeWidth="5" fill="none" />
      {/* Hem shadow and sash */}
      <path d="M300 820 C420 836 620 836 740 820 L736 830 C620 848 420 848 304 830 Z" fill="#0A0A0A" opacity="0.4" />
      <path d="M440 470 C490 486 556 486 600 470 L604 500 C556 518 490 518 436 500 Z" fill="#1A4A3A" />
      <path d="M520 488 L560 560 L536 566 Z M520 488 L494 566 L470 558 Z" fill="#1A4A3A" />
      <circle cx="520" cy="490" r="12" fill="#00E5A0" />

      {/* Tape measure */}
      <path d="M468 246 C450 330 440 430 428 540" stroke="#F2E6C9" strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M572 246 C590 320 604 400 612 484" stroke="#F2E6C9" strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M468 246 C500 236 540 236 572 246" stroke="#F2E6C9" strokeWidth="18" fill="none" />
      <path d="M468 246 C450 330 440 430 428 540" stroke="#0A0A0A" strokeWidth="9" strokeDasharray="2 12" fill="none" />
      <path d="M572 246 C590 320 604 400 612 484" stroke="#0A0A0A" strokeWidth="9" strokeDasharray="2 12" fill="none" />
      <rect x="418" y="534" width="22" height="16" rx="3" fill="#C4622D" />

      {/* Pattern piece: bodice */}
      <g transform="rotate(-7 1060 660)">
        <path d="M900 540 L1180 510 L1236 760 L936 800 Z" fill="#F5F0E8" />
        <path d="M918 556 L1166 530 L1214 744 L950 780 Z" fill="none" stroke="#C4622D" strokeWidth="3" strokeDasharray="12 9" />
        <path d="M1000 600 L1120 590 M1000 600 L1012 592 M1000 600 L1012 608 M1120 590 L1108 582 M1120 590 L1108 598" stroke="#1A4A3A" strokeWidth="3" />
        <text x="960" y="690" fontFamily={DISPLAY} fontSize="24" fontWeight="600" fill="#1A4A3A">FRONT BODICE</text>
        <text x="960" y="722" fontFamily={DISPLAY} fontSize="18" fill="#1A4A3A" opacity="0.7">CUT 2 · ON GRAIN</text>
      </g>

      {/* Pattern piece: sleeve */}
      <g transform="rotate(5 1400 720)">
        <path d="M1260 620 C1320 556 1470 556 1530 620 L1490 860 L1300 860 Z" fill="#E8E4DC" />
        <path d="M1276 630 C1330 576 1460 576 1514 630 L1478 846 L1312 846 Z" fill="none" stroke="#1A4A3A" strokeWidth="3" strokeDasharray="12 9" />
        <text x="1330" y="740" fontFamily={DISPLAY} fontSize="22" fontWeight="600" fill="#C4622D">SLEEVE</text>
      </g>

      {/* Scissors */}
      <g transform="rotate(-18 1120 880)">
        <path d="M1100 870 L1360 846 L1362 858 Z" fill="#A4B2C0" />
        <path d="M1100 880 L1360 870 L1356 880 Z" fill="#7d8995" />
        <circle cx="1060" cy="858" r="30" fill="none" stroke="#0A0A0A" strokeWidth="14" />
        <circle cx="1062" cy="912" r="30" fill="none" stroke="#0A0A0A" strokeWidth="14" />
        <circle cx="1104" cy="876" r="7" fill="#C4622D" />
      </g>

      {/* Spool, thread and needle */}
      <g>
        <rect x="1300" y="330" width="120" height="22" rx="6" fill="#7a3d1c" />
        <rect x="1314" y="352" width="92" height="120" fill="#00E5A0" />
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M1314 ${360 + i * 11} L1406 ${356 + i * 11}`} stroke="#0A0A0A" strokeOpacity="0.25" strokeWidth="2" />
        ))}
        <rect x="1300" y="472" width="120" height="22" rx="6" fill="#7a3d1c" />
        <path d="M1406 420 C1470 440 1480 520 1430 560 C1380 600 1460 640 1520 600" stroke="#00E5A0" strokeWidth="3" fill="none" />
        <path d="M1500 470 L1560 640" stroke="#A4B2C0" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="1505" cy="484" rx="3" ry="9" transform="rotate(-19 1505 484)" fill="none" stroke="#170b05" strokeWidth="2" />
      </g>

      <text x="80" y="110" fontFamily={DISPLAY} fontSize="20" letterSpacing="6" fill="#F5F0E8" opacity="0.55">
        ATELIER · FASHION
      </text>
    </ArtSvg>
  )
}
