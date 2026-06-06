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
      <div className="p-5 space-y-4 animate-pulse bg-white border-r border-[#D2D2D7]">
        <div className="h-2.5 bg-[#F5F5F7] rounded-full w-16" />
        <div className="h-9 bg-[#F5F5F7] rounded-xl w-36" />
        <div className="h-4 bg-[#F5F5F7] rounded-full w-24" />
        <div className="h-px bg-[#F5F5F7] my-4" />
        {[1,2,3].map(i => <div key={i} className="h-6 bg-[#F5F5F7] rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="bg-white border-r border-[#D2D2D7] overflow-y-auto flex flex-col">
      {/* Wallet address */}
      <div className="p-5 pb-4 border-b border-[#F5F5F7]">
        <div className="text-[11px] tracking-[0.18em] text-[#AEAEB2] font-mono uppercase mb-2">Wallet</div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] text-[#6E6E73]">{address.slice(0, 6)}...{address.slice(-4)}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-medium ${chainType === 'solana' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-[#1D1D1F]'}`}>
            {chainType === 'solana' ? 'SOL' : 'ETH'}
          </span>
        </div>
      </div>

      {/* Total value */}
      <div className="p-5 pb-4 border-b border-[#F5F5F7]">
        <div className="text-[11px] tracking-[0.18em] text-[#AEAEB2] font-mono uppercase mb-2">Total Value</div>
        <div className="text-[34px] text-[#1D1D1F] font-semibold tracking-tight leading-none">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`font-mono text-[13px] mt-2 font-medium ${change24h >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
          {change24h >= 0 ? '+' : ''}${Math.abs(change24h).toFixed(2)}
          <span className="text-[#AEAEB2] mx-1 font-sans font-normal">·</span>
          {change24hPct >= 0 ? '+' : ''}{change24hPct.toFixed(1)}%
          <span className="text-[#AEAEB2] ml-1 font-sans font-normal text-[12px]">today</span>
        </div>
        {totalPnL !== 0 && (
          <div className={`font-mono text-[11px] mt-1 ${totalPnL >= 0 ? 'text-[#34C759]/80' : 'text-[#FF3B30]/80'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(0)} unrealized P&L
          </div>
        )}
      </div>

      {/* Allocation bars */}
      <div className="p-5 flex-1">
        <div className="text-[11px] tracking-[0.18em] text-[#AEAEB2] font-mono uppercase mb-4">
          Allocation <span className="text-[#D2D2D7] ml-1">/ {positions.length}</span>
        </div>
        {positions.length === 0 ? (
          <p className="text-[13px] text-[#AEAEB2] leading-relaxed">
            No token balances found. Use the demo wallet to explore Vela.
          </p>
        ) : (
          <div className="space-y-3.5">
            {allocationBars.map((item, i) => (
              <motion.div
                key={item.symbol}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-[#1D1D1F] font-mono font-medium">{item.symbol}</span>
                  <span className="font-mono text-[#6E6E73]">{item.pct.toFixed(1)}%</span>
                </div>
                <div className="h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
                    className={`h-full rounded-full ${i === 0 ? 'bg-[#3056D7]' : 'bg-[#D2D2D7]'}`}
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
