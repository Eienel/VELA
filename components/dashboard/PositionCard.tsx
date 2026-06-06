'use client';
import { useMemo } from 'react';

interface Props {
  symbol: string;
  value: number;
  change: number;
  allocation?: number;
}

const TOKEN_COLORS: Record<string, string> = {
  ETH: '#627EEA',
  ARB: '#28A0F0',
  SOL: '#9945FF',
  USDC: '#2775CA',
  JUP: '#5BAAEF',
  BTC: '#F7931A',
};

const generateSparkline = (trend: number, seed: number) => {
  const points: string[] = [];
  let y = 50;
  let r = seed;
  const rand = () => { r = (r * 1664525 + 1013904223) & 0xffffffff; return (r >>> 0) / 0xffffffff; };
  for (let i = 0; i < 10; i++) {
    y += (rand() - (trend > 0 ? 0.38 : 0.62)) * 18;
    y = Math.max(8, Math.min(92, y));
    points.push(`${i * 11},${y}`);
  }
  return points.join(' ');
};

export default function PositionCard({ symbol, value, change, allocation }: Props) {
  const isPositive = change >= 0;
  const color = TOKEN_COLORS[symbol] || '#AEAEB2';
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const sparkline = useMemo(() => generateSparkline(change, seed), [change, seed]);

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F5F5F7] last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <span className="text-[10px] font-bold font-mono" style={{ color }}>{symbol.slice(0, 3)}</span>
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[#1D1D1F] leading-none">{symbol}</div>
          {allocation !== undefined && (
            <div className="text-[11px] font-mono text-[#AEAEB2] mt-0.5">{allocation.toFixed(1)}%</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <svg width={44} height={18} viewBox="0 0 110 100" className="opacity-70">
          <polyline
            points={sparkline}
            fill="none"
            stroke={isPositive ? '#34C759' : '#FF3B30'}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-right min-w-[72px]">
          <div className="font-mono text-[13px] font-medium text-[#1D1D1F] leading-none">${value.toLocaleString()}</div>
          <div className={`font-mono text-[11px] mt-0.5 ${isPositive ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
