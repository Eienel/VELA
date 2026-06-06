'use client';
import { useState } from 'react';

interface Props {
  onConnect: (address: string, chainType: 'evm' | 'solana', chain?: string) => void;
}

type ChainOption = 'evm' | 'base' | 'arbitrum' | 'solana';

const CHAIN_LABELS: Record<ChainOption, string> = {
  evm: 'Ethereum',
  base: 'Base',
  arbitrum: 'Arbitrum',
  solana: 'Solana',
};

const DEMO_ADDRESSES: Record<ChainOption, { address: string; type: 'evm' | 'solana' }> = {
  evm: { address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0BE', type: 'evm' },
  base: { address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0BE', type: 'evm' },
  arbitrum: { address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0BE', type: 'evm' },
  solana: { address: 'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh', type: 'solana' },
};

export default function ConnectWallet({ onConnect }: Props) {
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState<ChainOption>('evm');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) { setError('Paste a wallet address to continue'); return; }
    const isSolana = chain === 'solana';
    const isValidEVM = /^0x[0-9a-fA-F]{40}$/.test(trimmed);
    const isValidSolana = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
    if (isSolana && !isValidSolana) { setError("That doesn't look like a Solana address"); return; }
    if (!isSolana && !isValidEVM) { setError("That doesn't look like a valid address"); return; }
    setError('');
    onConnect(trimmed, isSolana ? 'solana' : 'evm', chain);
  };

  const useDemo = () => {
    const { address: demoAddr, type } = DEMO_ADDRESSES[chain];
    onConnect(demoAddr, type, chain);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
      {/* Chain selector */}
      <div className="flex gap-1.5 p-1 bg-[#F5F5F7] rounded-full">
        {(Object.keys(CHAIN_LABELS) as ChainOption[]).map(c => (
          <button
            key={c}
            type="button"
            onClick={() => { setChain(c); setError(''); setAddress(''); }}
            className={`flex-1 text-[11px] font-mono font-medium py-1.5 rounded-full transition-all ${
              chain === c
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#AEAEB2] hover:text-[#6E6E73]'
            }`}
          >
            {CHAIN_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Address input */}
      <input
        type="text"
        value={address}
        onChange={e => { setAddress(e.target.value); setError(''); }}
        placeholder={chain === 'solana' ? 'Solana address...' : '0x wallet address...'}
        className="w-full bg-white border border-[#E8E8ED] rounded-xl px-4 py-3 text-[13px] font-mono text-[#1D1D1F] placeholder-[#AEAEB2] outline-none focus:border-[#3056D7] transition-colors"
        autoComplete="off"
        spellCheck={false}
      />

      {error && <p className="text-[12px] text-[#FF3B30] px-1">{error}</p>}

      <button
        type="submit"
        className="bg-[#1D1D1F] text-white font-semibold text-[14px] px-5 py-3 rounded-full hover:bg-[#3056D7] transition-colors active:scale-[0.97]"
      >
        Load wallet
      </button>

      <button type="button" onClick={useDemo} className="text-[13px] text-[#AEAEB2] hover:text-[#6E6E73] transition-colors text-center py-1">
        Use demo wallet
      </button>
    </form>
  );
}
