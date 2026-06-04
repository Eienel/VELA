'use client';
import VelaMascot from './VelaMascot';

interface Props {
  address?: string;
  chainType?: 'evm' | 'solana';
  onDisconnect?: () => void;
}

export default function TopNav({ address, chainType, onDisconnect }: Props) {
  const truncate = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-2">
        <VelaMascot size={28} />
        <span className="font-semibold tracking-tighter text-zinc-50 text-lg">VELA</span>
      </div>
      {address && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <div className={`w-2 h-2 rounded-full ${chainType === 'solana' ? 'bg-purple-400' : 'bg-amber-400'}`} />
            <span className="mono text-xs text-zinc-400">{truncate(address)}</span>
            <span className="text-xs text-zinc-600 uppercase">{chainType === 'solana' ? 'SOL' : 'ETH'}</span>
          </div>
          <button
            onClick={onDisconnect}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </nav>
  );
}
