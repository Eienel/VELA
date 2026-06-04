'use client';
import { useEffect, useState } from 'react';
import { Position } from '@/types';

interface Props {
  address: string;
  chainType: 'evm' | 'solana';
}

export default function WalletPanel({ address, chainType }: Props) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    const chain = chainType === 'solana' ? 'solana' : 'ethereum';
    fetch(`/api/portfolio/${chain}/${address}`)
      .then(r => r.json())
      .then(data => {
        setPositions(data.positions || []);
        setTotalValue(data.totalValue || 0);
        setLoading(false);
      });
  }, [address, chainType]);

  const change24h = positions.reduce((sum, p) => sum + (p.valueUSD * p.change24h / 100), 0);
  const change24hPct = totalValue > 0 ? (change24h / totalValue) * 100 : 0;

  const allocationBars = positions
    .sort((a, b) => b.valueUSD - a.valueUSD)
    .slice(0, 5)
    .map(p => ({ symbol: p.tokenSymbol, pct: (p.valueUSD / totalValue) * 100 }));

  if (loading) {
    return (
      <div className="p-5 space-y-4 animate-pulse">
        <div className="h-3 bg-zinc-800 rounded w-16" />
        <div className="h-8 bg-zinc-800 rounded w-32" />
        <div className="h-4 bg-zinc-800 rounded w-24" />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 border-r border-zinc-800 overflow-y-auto">
      <div>
        <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Wallet</div>
        <div className="mono text-xs text-zinc-400 break-all">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Total Value</div>
        <div className="mono text-3xl text-zinc-50 font-semibold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className={`mono text-sm mt-1 ${change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change24h >= 0 ? '+' : ''}${Math.abs(change24h).toFixed(2)} ({change24hPct >= 0 ? '+' : ''}{change24hPct.toFixed(1)}%) 24h
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Positions ({positions.length})</div>
        <div className="space-y-2.5">
          {allocationBars.map(item => (
            <div key={item.symbol}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">{item.symbol}</span>
                <span className="mono text-zinc-500">{item.pct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
