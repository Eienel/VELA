'use client';
import { motion } from 'framer-motion';

interface Props {
  size?: number;
  thinking?: boolean;
  speaking?: boolean;
}

export default function VelaMascot({ size = 48, thinking = false, speaking = false }: Props) {
  const s = size;
  const center = s / 2;

  // 5-point star path
  const starPath = () => {
    const outerR = s * 0.42;
    const innerR = s * 0.18;
    const points = 5;
    let path = '';
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      path += (i === 0 ? 'M' : 'L') + `${x},${y}`;
    }
    return path + 'Z';
  };

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ display: 'inline-block' }}
    >
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {/* Orbital ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={center - 2}
          stroke="#f59e0b"
          strokeOpacity={0.4}
          strokeWidth={1.5}
          fill="none"
          animate={thinking ? { rotate: 360 } : {}}
          transition={thinking ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
        {/* Star body */}
        <motion.path
          d={starPath()}
          fill="#f59e0b"
          animate={speaking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={speaking ? { duration: 0.8, repeat: Infinity } : {}}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
        {/* Eyes */}
        <rect x={center - 5} y={center - 7} width={3} height={4} rx={1} fill="#09090b" />
        <rect x={center + 2} y={center - 7} width={3} height={4} rx={1} fill="#09090b" />
      </svg>
    </motion.div>
  );
}
