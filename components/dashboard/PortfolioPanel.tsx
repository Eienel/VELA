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
      <div className="p-5 space-y-4 animate-pulse bg-white border-l border-[#D2D2D7]">
        <div className="h-2.5 bg-[#F5F5F7] rounded-full w-24" />
        <div className="h-9 bg-[#F5F5F7] rounded-xl w-32" />
        {[1,2,3].map(i => <div key={i} className="h-12 bg-[#F5F5F7] rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="bg-white border-l border-[#D2D2D7] overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-[#F5F5F7]">
        <div className="text-[11px] tracking-[0.18em] text-[#AEAEB2] font-mono uppercase mb-2">Snapshot</div>
        <div className="text-[34px] text-[#1D1D1F] font-semibold tracking-tight leading-none">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`font-mono text-[13px] mt-2 font-medium ${change30d >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
          {change30dPct >= 0 ? '+' : ''}{change30dPct.toFixed(1)}%
          <span className="text-[#AEAEB2] ml-1 font-sans font-normal text-[12px]">this month</span>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="p-5">
          <p className="text-[13px] text-[#AEAEB2] leading-relaxed">No positions found. Connect a funded wallet or use the demo wallet.</p>
        </div>
      ) : (
        <>
          {/* Top positions */}
          <div className="p-5 pb-3 border-b border-[#F5F5F7]">
            <div className="text-[11px] tracking-[0.18em] text-[#AEAEB2] font-mono uppercase mb-3">Top Positions</div>
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
            <div className="text-[11px] tracking-[0.18em] text-[#AEAEB2] font-mono uppercase mb-3">Chain Exposure</div>
            <div className="space-y-2.5">
              {Object.entries(chainExposure)
                .sort(([, a], [, b]) => b - a)
                .map(([chain, val]) => {
                  const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
                  return (
                    <div key={chain}>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="text-[#6E6E73] capitalize font-mono">{chain}</span>
                        <span className="font-mono text-[#AEAEB2]">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                          className="h-full bg-[#D2D2D7] rounded-full"
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
