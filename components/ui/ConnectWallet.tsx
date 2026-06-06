'use client';
import { useState } from 'react';
import { Wallet } from '@phosphor-icons/react';

interface Props {
  onConnect: (address: string, chainType: 'evm' | 'solana') => void;
}

export default function ConnectWallet({ onConnect }: Props) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const connectEVM = async () => {
    setConnecting(true);
    setError('');
    try {
      if (!(window as any).ethereum) {
        onConnect('0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0BE', 'evm');
        return;
      }
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts[0]) onConnect(accounts[0], 'evm');
    } catch (e: any) {
      setError(e.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const connectSolana = async () => {
    setConnecting(true);
    setError('');
    try {
      if (!(window as any).solana) {
        onConnect('DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh', 'solana');
        return;
      }
      const resp = await (window as any).solana.connect();
      if (resp.publicKey) onConnect(resp.publicKey.toString(), 'solana');
    } catch (e: any) {
      setError(e.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const useDemoWallet = () => {
    onConnect('0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0BE', 'evm');
  };

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-xs">
      <button
        onClick={connectEVM}
        disabled={connecting}
        className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1D1D1F] hover:bg-[#3D3D3F] text-white font-semibold text-[14px] rounded-full shadow-card transition-all active:scale-[0.97] disabled:opacity-50"
      >
        <Wallet size={16} weight="fill" />
        {connecting ? 'Connecting...' : 'Connect EVM Wallet'}
      </button>
      <button
        onClick={connectSolana}
        disabled={connecting}
        className="flex items-center justify-center gap-2 px-5 py-3 border border-[#D2D2D7] bg-white text-[#1D1D1F] font-semibold text-[14px] rounded-full transition-all active:scale-[0.97] hover:bg-[#F5F5F7] disabled:opacity-50"
      >
        <Wallet size={16} />
        Connect Solana Wallet
      </button>
      <button
        onClick={useDemoWallet}
        className="text-[13px] text-[#AEAEB2] hover:text-[#6E6E73] transition-colors text-center py-2"
      >
        Use demo wallet
      </button>
      {error && <p className="text-[12px] text-[#FF3B30]">{error}</p>}
    </div>
  );
}
