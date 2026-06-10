'use client';
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
    <nav className="flex items-center justify-between px-5 h-13 border-b border-[#D2D2D7] bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-2.5">
        <VelaMascot size={28} />
        <span className="font-semibold text-[#1D1D1F] text-[15px] tracking-tight">
          Vela<span className="text-[#AEAEB2]">.</span>
        </span>
        <span className="hidden md:block text-[11px] text-[#AEAEB2] ml-1 font-mono uppercase tracking-[0.18em]">Portfolio AI</span>
      </div>

      {address && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
            <span className="text-[11px] text-[#6E6E73] font-mono uppercase tracking-wider">Live</span>
          </div>

          <div className="w-px h-4 bg-[#D2D2D7]" />

          <div className="flex items-center gap-2 bg-[#F5F5F7] px-3 py-1.5 rounded-full border border-[#D2D2D7]">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${chainType === 'solana' ? 'bg-purple-500' : 'bg-[#1D1D1F]'}`} />
            <span className="font-mono text-[12px] text-[#1D1D1F]">{truncate(address)}</span>
            <span className="hidden sm:inline text-[10px] text-[#6E6E73] uppercase tracking-wider font-mono">{chainLabel}</span>
          </div>

          <button
            onClick={onDisconnect}
            className="text-[12px] font-medium text-[#6E6E73] hover:text-[#FF3B30] transition-colors px-3 py-1.5 rounded-full hover:bg-[#FF3B30]/8"
          >
            <span className="hidden sm:inline">Disconnect</span>
            <span className="sm:hidden">✕</span>
          </button>
        </div>
      )}
    </nav>
  );
}
