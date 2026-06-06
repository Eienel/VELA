// Zerion API portfolio reader.
//
// One call returns a wallet's fungible positions across every chain —
// including DeFi (staked, deposited, locked, lending) — already priced in USD
// with 24h change and built-in spam filtering. We filter to the requested
// chain and map into our Position shape.

import { Position } from '@/types';

const ZERION_BASE = 'https://api.zerion.io/v1';

// Minimum absolute USD value for a position to show (spam/dust filter).
const MIN_TOKEN_USD = 1;

function zerionAuth(): string | null {
  const key = process.env.ZERION_API_KEY;
  if (!key) return null;
  // Basic auth: API key as username, empty password.
  const token = Buffer.from(`${key}:`).toString('base64');
  return `Basic ${token}`;
}

export function hasZerion(): boolean {
  return !!process.env.ZERION_API_KEY;
}

// Map our chain ids to Zerion chain ids (they happen to match today, but keep
// the indirection explicit).
const ZERION_CHAIN: Record<string, string> = {
  ethereum: 'ethereum',
  base: 'base',
  arbitrum: 'arbitrum',
  solana: 'solana',
};

export async function getZerionPortfolio(address: string, chain: string): Promise<Position[]> {
  const auth = zerionAuth();
  if (!auth) throw new Error('No ZERION_API_KEY');
  const wantChain = ZERION_CHAIN[chain] || chain;
  const now = new Date();

  // no_filter returns both wallet and DeFi positions; only_non_trash drops spam.
  const url =
    `${ZERION_BASE}/wallets/${address}/positions/` +
    `?currency=usd&filter[positions]=no_filter&filter[trash]=only_non_trash&sort=value`;

  const res = await fetch(url, {
    headers: { Authorization: auth, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Zerion positions failed: ${res.status}`);
  const json = await res.json();

  const positions: Position[] = [];
  for (const item of json.data || []) {
    const attr = item.attributes || {};
    const rels = item.relationships || {};
    const posChain = rels.chain?.data?.id;
    if (posChain !== wantChain) continue; // only the requested chain
    if (attr.flags && attr.flags.is_trash) continue;

    const value: number = attr.value ?? 0;
    if (Math.abs(value) < MIN_TOKEN_USD) continue; // dust/spam filter

    const fungible = attr.fungible_info || {};
    const impl = (fungible.implementations || []).find((i: any) => i.chain_id === posChain);

    positions.push({
      walletAddress: address,
      tokenSymbol: (fungible.symbol || '???').toUpperCase(),
      tokenAddress: impl?.address || '0x0000000000000000000000000000000000000000',
      balance: attr.quantity?.float ?? 0,
      valueUSD: value,
      chain: posChain,
      chainType: posChain === 'solana' ? 'solana' : 'evm',
      priceUSD: attr.price ?? 0,
      change24h: attr.changes?.percent_1d ?? 0,
      change30d: 0,
      costBasisUSD: value,
      unrealizedPnL: 0,
      positionType: attr.position_type || 'wallet',
      protocol: attr.protocol || rels.dapp?.data?.id || undefined,
      updatedAt: now,
    });
  }

  return positions.sort((a, b) => b.valueUSD - a.valueUSD);
}
