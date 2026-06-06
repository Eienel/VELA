'use client';
import { motion } from 'framer-motion';
import VelaMascot from './VelaMascot';

interface Props {
  address?: string;
  chainType?: 'evm' | 'solana';
  onDisconnect?: () => void;
}

export default function TopNav({ address, chainType, onDisconnect }: Props) {
  const truncate = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  const chainLabel = chainType === 'solana' ? 'Solana' : 'Ethereum';

  return (
    <nav className="flex items-center justify-between px-6 h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-2.5">
        <VelaMascot size={26} />
        <span className="font-semibold tracking-tighter text-zinc-50 text-base">
          VELA<span className="text-amber-500">.</span>
        </span>
        <span className="hidden md:block text-xs text-zinc-600 ml-1 font-mono">portfolio intelligence</span>
      </div>

      {address && (
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-green-500"
            />
            <span className="text-xs text-zinc-600">Live</span>
          </div>

          <div className="w-px h-4 bg-zinc-800" />

          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <div className={`w-1.5 h-1.5 rounded-full ${chainType === 'solana' ? 'bg-violet-400' : 'bg-amber-400'}`} />
            <span className="font-mono text-xs text-zinc-300">{truncate(address)}</span>
            <span className="text-xs text-zinc-600 uppercase tracking-wider">{chainLabel}</span>
          </div>

          <button
            onClick={onDisconnect}
            className="text-xs text-zinc-600 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
          >
            Disconnect
          </button>
        </div>
      )}
    </nav>
  );
}
