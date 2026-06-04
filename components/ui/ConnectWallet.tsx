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
        // Use demo address for hackathon
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
        // Use demo address for hackathon
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
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <button
        onClick={connectEVM}
        disabled={connecting}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        <Wallet size={18} weight="fill" />
        {connecting ? 'Connecting...' : 'Connect EVM Wallet'}
      </button>
      <button
        onClick={connectSolana}
        disabled={connecting}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        <Wallet size={18} />
        Connect Solana Wallet
      </button>
      <button
        onClick={useDemoWallet}
        className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors text-center py-1"
      >
        Use demo wallet instead
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
