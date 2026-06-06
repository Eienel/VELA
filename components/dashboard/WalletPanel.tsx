'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
      })
      .catch(() => setLoading(false));
  }, [address, chainType]);

  const change24h = positions.reduce((sum, p) => sum + (p.valueUSD * p.change24h / 100), 0);
  const change24hPct = totalValue > 0 ? (change24h / totalValue) * 100 : 0;
  const totalPnL = positions.reduce((sum, p) => sum + (p.unrealizedPnL || 0), 0);

  const sorted = [...positions].sort((a, b) => b.valueUSD - a.valueUSD);
  const allocationBars = sorted.slice(0, 5).map(p => ({
    symbol: p.tokenSymbol,
    pct: totalValue > 0 ? (p.valueUSD / totalValue) * 100 : 0,
  }));

  if (loading) {
    return (
      <div className="p-5 space-y-4 animate-pulse bg-zinc-950 border-r border-zinc-800">
        <div className="h-3 bg-zinc-800 rounded w-16" />
        <div className="h-10 bg-zinc-800 rounded w-36" />
        <div className="h-4 bg-zinc-800 rounded w-24" />
        <div className="h-px bg-zinc-800 my-4" />
        {[1,2,3].map(i => <div key={i} className="h-6 bg-zinc-800 rounded" />)}
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border-r border-zinc-800 overflow-y-auto flex flex-col">
      {/* Wallet header */}
      <div className="p-5 pb-4 border-b border-zinc-800/60">
        <div className="text-xs uppercase tracking-widest text-zinc-600 mb-2">Wallet</div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-zinc-400">{address.slice(0, 6)}...{address.slice(-4)}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${chainType === 'solana' ? 'bg-violet-500/10 text-violet-400' : 'bg-amber-500/10 text-amber-500'}`}>
            {chainType === 'solana' ? 'SOL' : 'ETH'}
          </span>
        </div>
      </div>

      {/* Total value */}
      <div className="p-5 pb-4 border-b border-zinc-800/60">
        <div className="text-xs uppercase tracking-widest text-zinc-600 mb-2">Total Value</div>
        <div className="font-mono text-4xl text-zinc-50 font-semibold tracking-tight leading-none">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`font-mono text-sm mt-2 ${change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change24h >= 0 ? '+' : ''}${Math.abs(change24h).toFixed(2)}
          <span className="text-zinc-600 mx-1">·</span>
          {change24hPct >= 0 ? '+' : ''}{change24hPct.toFixed(1)}% today
        </div>
        {totalPnL !== 0 && (
          <div className={`font-mono text-xs mt-1 ${totalPnL >= 0 ? 'text-green-500/70' : 'text-red-500/70'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(0)} unrealized PnL
          </div>
        )}
      </div>

      {/* Allocation */}
      <div className="p-5 flex-1">
        <div className="text-xs uppercase tracking-widest text-zinc-600 mb-4">
          Allocation <span className="text-zinc-700 normal-case tracking-normal ml-1">({positions.length} positions)</span>
        </div>
        {positions.length === 0 ? (
          <p className="text-xs text-zinc-700 leading-relaxed">
            No token balances found. Use the demo wallet to explore Vela.
          </p>
        ) : (
          <div className="space-y-3">
            {allocationBars.map((item, i) => (
              <motion.div
                key={item.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400 font-medium">{item.symbol}</span>
                  <span className="font-mono text-zinc-500">{item.pct.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, #f59e0b, #fbbf24)`,
                      boxShadow: '0 0 8px rgba(245,158,11,0.4)',
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
