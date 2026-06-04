'use client';
import { useEffect, useState } from 'react';
import { Position } from '@/types';
import PositionCard from './PositionCard';

interface Props {
  address: string;
  chainType: 'evm' | 'solana';
}

export default function PortfolioPanel({ address, chainType }: Props) {
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
      })
      .catch(() => setLoading(false));
  }, [address, chainType]);

  const change30d = positions.reduce((sum, p) => sum + (p.valueUSD * p.change30d / 100), 0);
  const change30dPct = totalValue > 0 ? (change30d / totalValue) * 100 : 0;

  // Chain exposure
  const chainExposure: Record<string, number> = {};
  positions.forEach(p => {
    chainExposure[p.chain] = (chainExposure[p.chain] || 0) + p.valueUSD;
  });

  if (loading) {
    return (
      <div className="p-5 space-y-4 animate-pulse border-l border-zinc-800">
        <div className="h-3 bg-zinc-800 rounded w-24" />
        <div className="h-8 bg-zinc-800 rounded w-32" />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 border-l border-zinc-800 overflow-y-auto">
      <div>
        <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Portfolio Snapshot</div>
        <div className="mono text-3xl text-zinc-50 font-semibold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className={`mono text-sm mt-1 ${change30d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change30dPct >= 0 ? '+' : ''}{change30dPct.toFixed(1)}% this month
        </div>
      </div>

      {positions.length === 0 ? (
        <p className="text-xs text-zinc-600 leading-relaxed">
          This wallet holds no tokens Vela can read yet. Once it has positions, your snapshot, top holdings, and chain exposure appear here.
        </p>
      ) : (
        <>
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Top Positions</div>
            <div>
              {positions.sort((a, b) => b.valueUSD - a.valueUSD).slice(0, 5).map(p => (
                <PositionCard
                  key={p.tokenSymbol}
                  symbol={p.tokenSymbol}
                  value={p.valueUSD}
                  change={p.change24h}
                  allocation={totalValue > 0 ? (p.valueUSD / totalValue) * 100 : 0}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Chain Exposure</div>
            <div className="space-y-2">
              {Object.entries(chainExposure)
                .sort(([, a], [, b]) => b - a)
                .map(([chain, val]) => (
                  <div key={chain} className="flex justify-between text-sm">
                    <span className="text-zinc-400 capitalize">{chain}</span>
                    <span className="mono text-zinc-300">{totalValue > 0 ? ((val / totalValue) * 100).toFixed(0) : 0}%</span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
