'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

  const chainExposure: Record<string, number> = {};
  positions.forEach(p => {
    chainExposure[p.chain] = (chainExposure[p.chain] || 0) + p.valueUSD;
  });

  if (loading) {
    return (
      <div className="p-5 space-y-4 animate-pulse bg-[#070708] border-l border-zinc-800">
        <div className="h-3 bg-zinc-800 rounded w-24" />
        <div className="h-10 bg-zinc-800 rounded w-32" />
        {[1,2,3].map(i => <div key={i} className="h-12 bg-zinc-800 rounded" />)}
      </div>
    );
  }

  return (
    <div className="bg-[#070708] border-l border-zinc-800 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-zinc-800">
        <div className="text-[10px] tracking-[0.25em] text-zinc-600 font-mono uppercase mb-2">Portfolio Snapshot</div>
        <div className="font-display text-4xl text-zinc-50 font-bold tracking-tight leading-none">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`font-mono text-sm mt-2 ${change30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change30dPct >= 0 ? '+' : ''}{change30dPct.toFixed(1)}%
          <span className="text-zinc-600 ml-1 font-sans text-xs">this month</span>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="p-5">
          <p className="text-xs text-zinc-700 leading-relaxed">No positions found. Connect a funded wallet or use the demo wallet.</p>
        </div>
      ) : (
        <>
          {/* Top positions */}
          <div className="p-5 pb-3 border-b border-zinc-800">
            <div className="text-[10px] tracking-[0.25em] text-zinc-600 font-mono uppercase mb-3">Top Positions</div>
            <div>
              {[...positions].sort((a, b) => b.valueUSD - a.valueUSD).slice(0, 5).map((p, i) => (
                <motion.div
                  key={p.tokenSymbol}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <PositionCard
                    symbol={p.tokenSymbol}
                    value={p.valueUSD}
                    change={p.change24h}
                    allocation={totalValue > 0 ? (p.valueUSD / totalValue) * 100 : 0}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chain exposure */}
          <div className="p-5">
            <div className="text-[10px] tracking-[0.25em] text-zinc-600 font-mono uppercase mb-3">Chain Exposure</div>
            <div className="space-y-2.5">
              {Object.entries(chainExposure)
                .sort(([, a], [, b]) => b - a)
                .map(([chain, val]) => {
                  const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
                  return (
                    <div key={chain}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400 capitalize font-mono">{chain}</span>
                        <span className="font-mono text-zinc-500">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-none overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                          className="h-full bg-zinc-600 rounded-none"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
