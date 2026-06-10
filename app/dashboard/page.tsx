'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/dashboard/TopNav';
import WalletPanel from '@/components/dashboard/WalletPanel';
import ChatPanel from '@/components/dashboard/ChatPanel';
import PortfolioPanel from '@/components/dashboard/PortfolioPanel';
import ConnectWallet from '@/components/ui/ConnectWallet';

type ChainType = 'evm' | 'solana';
type ApiChain = 'ethereum' | 'base' | 'arbitrum' | 'solana';

function toApiChain(chain: string): ApiChain {
  if (chain === 'solana') return 'solana';
  if (chain === 'base') return 'base';
  if (chain === 'arbitrum') return 'arbitrum';
  return 'ethereum';
}

export default function Dashboard() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [chainType, setChainType] = useState<ChainType>('evm');
  const [apiChain, setApiChain] = useState<ApiChain>('ethereum');
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const addr = localStorage.getItem('vela_address');
    const chain = localStorage.getItem('vela_chain') || 'evm';
    if (addr) {
      setAddress(addr);
      setChainType(chain === 'solana' ? 'solana' : 'evm');
      setApiChain(toApiChain(chain));
    }
  }, []);

  useEffect(() => {
    if (!address) return;
    fetch(`/api/portfolio/${apiChain}/${address}`)
      .then(r => r.json())
      .then(data => setPortfolioData(data));
  }, [address, apiChain]);

  const handleConnect = (addr: string, chain: ChainType, specificChain?: string) => {
    const resolved = specificChain || chain;
    localStorage.setItem('vela_address', addr);
    localStorage.setItem('vela_chain', resolved);
    setAddress(addr);
    setChainType(chain);
    setApiChain(toApiChain(resolved));
  };

  const handleDisconnect = () => {
    localStorage.removeItem('vela_address');
    localStorage.removeItem('vela_chain');
    router.push('/');
  };

  if (!mounted) return null;

  if (!address) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center gap-8">
        <h2 className="text-[28px] font-semibold tracking-tight text-[#1D1D1F]">Paste a wallet address to start</h2>
        <ConnectWallet onConnect={handleConnect} />
      </div>
    );
  }

  // Compute 24h change for the mobile balance bar
  const change24h = portfolioData?.positions?.reduce(
    (sum: number, p: any) => sum + (p.valueUSD * p.change24h / 100), 0
  ) ?? 0;
  const change24hPct = portfolioData?.totalValue > 0
    ? (change24h / portfolioData.totalValue) * 100
    : 0;

  return (
    <div className="flex flex-col h-[100dvh]">
      <TopNav address={address} chainType={chainType} onDisconnect={handleDisconnect} />

      {/* Mobile-only balance bar */}
      {portfolioData && (
        <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#E5E5EA]">
          <span className="text-[17px] font-semibold tracking-tight text-[#1D1D1F]">
            ${(portfolioData.totalValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`font-mono text-[13px] font-medium ${change24h >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
            {change24h >= 0 ? '+' : ''}{change24hPct.toFixed(2)}%
            <span className="text-[#AEAEB2] font-sans font-normal ml-1 text-[12px]">today</span>
          </span>
        </div>
      )}

      {/* Desktop: three-column grid · Mobile: chat only */}
      <div className="flex-1 overflow-hidden md:grid" style={{ gridTemplateColumns: '280px 1fr 300px' }}>
        <div className="hidden md:block">
          <WalletPanel address={address} chainType={chainType} apiChain={apiChain} />
        </div>
        <ChatPanel walletAddress={address} chainType={chainType} portfolioData={portfolioData} />
        <div className="hidden md:block">
          <PortfolioPanel address={address} chainType={chainType} />
        </div>
      </div>
    </div>
  );
}
