import { Position } from '@/types';

// Mock data for demo - in production would use Alchemy/Ankr RPC
export async function getEVMPortfolio(address: string): Promise<Position[]> {
  const now = new Date();
  return [
    {
      walletAddress: address,
      tokenSymbol: 'ETH',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      balance: 12.847,
      valueUSD: 22695,
      chain: 'ethereum',
      chainType: 'evm',
      priceUSD: 1766.5,
      change24h: 4.1,
      change30d: 8.2,
      costBasisUSD: 20960,
      unrealizedPnL: 1735,
      updatedAt: now,
    },
    {
      walletAddress: address,
      tokenSymbol: 'ARB',
      tokenAddress: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      balance: 18420,
      valueUSD: 10875,
      chain: 'arbitrum',
      chainType: 'evm',
      priceUSD: 0.59,
      change24h: -3.1,
      change30d: -18.3,
      costBasisUSD: 11722,
      unrealizedPnL: -847,
      updatedAt: now,
    },
    {
      walletAddress: address,
      tokenSymbol: 'USDC',
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      balance: 7092,
      valueUSD: 7092,
      chain: 'ethereum',
      chainType: 'evm',
      priceUSD: 1.0,
      change24h: 0,
      change30d: 0,
      costBasisUSD: 7092,
      unrealizedPnL: 0,
      updatedAt: now,
    },
  ];
}
