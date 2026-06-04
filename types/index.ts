export type ChainType = 'evm' | 'solana';

export interface Position {
  walletAddress: string;
  tokenSymbol: string;
  tokenAddress: string;
  balance: number;
  valueUSD: number;
  chain: string;
  chainType: ChainType;
  priceUSD: number;
  change24h: number;
  change30d: number;
  costBasisUSD: number;
  unrealizedPnL: number;
  correlationToETH: number;
  updatedAt: Date;
}

export interface Wallet {
  address: string;
  chainType: ChainType;
  chains: string[];
  lastScanned: Date;
  totalValueUSD: number;
}

export interface Query {
  walletAddress: string;
  question: string;
  answer: string;
  audioPlayed: boolean;
  timestamp: Date;
  portfolioSnapshot: object;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
}
