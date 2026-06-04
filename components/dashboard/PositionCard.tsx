interface Props {
  symbol: string;
  value: number;
  change: number;
  allocation?: number;
}

// Simple sparkline data
const generateSparkline = (trend: number) => {
  const points = [];
  let y = 50;
  for (let i = 0; i < 10; i++) {
    y += (Math.random() - 0.4) * 15 * (trend > 0 ? 1 : -1);
    y = Math.max(10, Math.min(90, y));
    points.push(`${i * 11},${y}`);
  }
  return points.join(' ');
};

export default function PositionCard({ symbol, value, change, allocation }: Props) {
  const isPositive = change >= 0;
  const sparkline = generateSparkline(change);

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
          <span className="text-xs font-semibold text-zinc-300">{symbol.slice(0, 2)}</span>
        </div>
        <div>
          <div className="text-sm font-medium text-zinc-200">{symbol}</div>
          {allocation !== undefined && (
            <div className="text-xs text-zinc-600 mono">{allocation.toFixed(1)}%</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <svg width={55} height={20} viewBox="0 0 110 90" className="opacity-70">
          <polyline
            points={sparkline}
            fill="none"
            stroke={isPositive ? '#22c55e' : '#ef4444'}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-right">
          <div className="mono text-sm text-zinc-200">${value.toLocaleString()}</div>
          <div className={`mono text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
