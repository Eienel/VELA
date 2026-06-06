'use client';
import { motion } from 'framer-motion';

interface Props {
  size?: number;
  thinking?: boolean;
  speaking?: boolean;
}

export default function VelaMascot({ size = 48, thinking = false, speaking = false }: Props) {
  const s = size;
  const c = s / 2;
  const outerR = s * 0.44;
  const circ = 2 * Math.PI * outerR;

  // Navigation chevron / V-shape
  const arm = s * 0.22;
  const tipY = c + s * 0.14;
  const topY = c - s * 0.16;
  const leftX = c - arm;
  const rightX = c + arm;

  return (
    <div style={{ display: 'inline-block', flexShrink: 0 }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {/* Thin outer ring — partial arc, rotates when thinking */}
        <motion.circle
          cx={c}
          cy={c}
          r={outerR}
          stroke="#D2D2D7"
          strokeWidth={1}
          fill="none"
          strokeDasharray={`${circ * 0.72} ${circ * 0.28}`}
          animate={thinking ? { rotate: 360 } : { rotate: 0 }}
          transition={thinking ? { duration: 1.8, repeat: Infinity, ease: 'linear' } : { duration: 0.5 }}
          style={{ transformOrigin: `${c}px ${c}px` }}
        />
        {/* V chevron lines */}
        <line
          x1={leftX} y1={topY}
          x2={c} y2={tipY}
          stroke="#1D1D1F"
          strokeWidth={s * 0.048}
          strokeLinecap="round"
        />
        <line
          x1={rightX} y1={topY}
          x2={c} y2={tipY}
          stroke="#1D1D1F"
          strokeWidth={s * 0.048}
          strokeLinecap="round"
        />
        {/* Amber vertex dot */}
        <motion.circle
          cx={c}
          cy={tipY}
          r={s * 0.07}
          fill="#FF9500"
          animate={speaking ? { scale: [1, 1.5, 1], opacity: [1, 0.7, 1] } : { scale: 1, opacity: 1 }}
          transition={speaking ? { duration: 0.75, repeat: Infinity } : {}}
          style={{ transformOrigin: `${c}px ${tipY}px` }}
        />
        {/* Small top-left dot */}
        <circle cx={leftX} cy={topY} r={s * 0.035} fill="#AEAEB2" />
        {/* Small top-right dot */}
        <circle cx={rightX} cy={topY} r={s * 0.035} fill="#AEAEB2" />
      </svg>
    </div>
  );
}
