import { Position } from '@/types';

export async function getSolanaPortfolio(address: string): Promise<Position[]> {
  const now = new Date();
  return [
    {
      walletAddress: address,
      tokenSymbol: 'SOL',
      tokenAddress: 'So11111111111111111111111111111111111111112',
      balance: 27.3,
      valueUSD: 4210,
      chain: 'solana',
      chainType: 'solana',
      priceUSD: 154.2,
      change24h: 5.2,
      change30d: 22.7,
      costBasisUSD: 3431,
      unrealizedPnL: 779,
      updatedAt: now,
    },
    {
      walletAddress: address,
      tokenSymbol: 'JUP',
      tokenAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      balance: 2840,
      valueUSD: 2411,
      chain: 'solana',
      chainType: 'solana',
      priceUSD: 0.849,
      change24h: 2.8,
      change30d: 15.4,
      costBasisUSD: 2130,
      unrealizedPnL: 281,
      updatedAt: now,
    },
  ];
}
