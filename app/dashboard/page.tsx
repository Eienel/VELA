'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/dashboard/TopNav';
import WalletPanel from '@/components/dashboard/WalletPanel';
import ChatPanel from '@/components/dashboard/ChatPanel';
import PortfolioPanel from '@/components/dashboard/PortfolioPanel';
import ConnectWallet from '@/components/ui/ConnectWallet';

export default function Dashboard() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [chainType, setChainType] = useState<'evm' | 'solana'>('evm');
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const addr = localStorage.getItem('vela_address');
    const chain = localStorage.getItem('vela_chain') as 'evm' | 'solana' | null;
    if (addr) {
      setAddress(addr);
      setChainType(chain || 'evm');
    }
  }, []);

  useEffect(() => {
    if (!address) return;
    const chain = chainType === 'solana' ? 'solana' : 'ethereum';
    fetch(`/api/portfolio/${chain}/${address}`)
      .then(r => r.json())
      .then(data => setPortfolioData(data));
  }, [address, chainType]);

  const handleConnect = (addr: string, chain: 'evm' | 'solana') => {
    localStorage.setItem('vela_address', addr);
    localStorage.setItem('vela_chain', chain);
    setAddress(addr);
    setChainType(chain);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('vela_address');
    localStorage.removeItem('vela_chain');
    router.push('/');
  };

  if (!mounted) return null;

  if (!address) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-8">
        <h2 className="text-2xl font-semibold tracking-tighter text-zinc-50">Connect your wallet to start</h2>
        <ConnectWallet onConnect={handleConnect} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <TopNav address={address} chainType={chainType} onDisconnect={handleDisconnect} />
      <div className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: '280px 1fr 300px' }}>
        <WalletPanel address={address} chainType={chainType} />
        <ChatPanel walletAddress={address} chainType={chainType} portfolioData={portfolioData} />
        <PortfolioPanel address={address} chainType={chainType} />
      </div>
    </div>
  );
}
