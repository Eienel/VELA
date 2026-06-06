// Cost-basis + unrealized P&L from on-chain transfer history.
//
// Approach (average-cost method):
//   1. Pull every incoming/outgoing transfer for the wallet via Alchemy
//      alchemy_getAssetTransfers (with timestamps).
//   2. For each token, value every acquisition at its USD price on that day
//      (CoinGecko historical daily series, one call per token).
//   3. Walk transfers chronologically keeping a running (qty, totalCost);
//      sells reduce cost at the current average. Remaining cost = cost basis
//      of the still-held position.
//
// Everything is best-effort: any failure leaves the position's existing
// costBasisUSD/unrealizedPnL untouched.

import { Position } from '@/types';
import { CG_PLATFORM } from '@/lib/prices';

type EVMChain = 'ethereum' | 'base' | 'arbitrum';

const CG_BASE = 'https://api.coingecko.com/api/v3';

function cgHeaders(): HeadersInit {
  const key = process.env.COINGECKO_API_KEY;
  return key ? { 'x-cg-demo-api-key': key } : {};
}

const ALCHEMY_SUBDOMAIN: Record<EVMChain, string> = {
  ethereum: 'eth-mainnet',
  base: 'base-mainnet',
  arbitrum: 'arb-mainnet',
};

function alchemyUrl(chain: EVMChain): string | null {
  const key = process.env.ALCHEMY_API_KEY;
  if (!key) return null;
  return `https://${ALCHEMY_SUBDOMAIN[chain]}.g.alchemy.com/v2/${key}`;
}

interface Transfer {
  contract: string; // lowercased; '' for native
  value: number;
  ts: number; // ms
  incoming: boolean;
}

async function getAssetTransfers(
  url: string,
  address: string,
  direction: 'to' | 'from'
): Promise<any[]> {
  const params: any = {
    fromBlock: '0x0',
    toBlock: 'latest',
    category: ['erc20', 'external'],
    withMetadata: true,
    excludeZeroValue: true,
    maxCount: '0x3e8', // 1000
    order: 'asc',
  };
  if (direction === 'to') params.toAddress = address;
  else params.fromAddress = address;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'alchemy_getAssetTransfers',
      params: [params],
    }),
  });
  if (!res.ok) throw new Error(`getAssetTransfers ${direction} failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result?.transfers || [];
}

function normalize(transfers: any[], incoming: boolean): Transfer[] {
  return transfers
    .map(t => {
      const value = typeof t.value === 'number' ? t.value : parseFloat(t.value);
      if (!value || !isFinite(value)) return null;
      const ts = t.metadata?.blockTimestamp
        ? new Date(t.metadata.blockTimestamp).getTime()
        : 0;
      // External (native) transfers have null rawContract address.
      const contract = (t.rawContract?.address || '').toLowerCase();
      return { contract, value, ts, incoming };
    })
    .filter((t): t is Transfer => t !== null && t.ts > 0);
}

// Build a date(UTC midnight) -> USD price lookup for one token over a range.
async function dailyPriceSeries(
  chain: EVMChain,
  contract: string,
  fromTs: number
): Promise<Record<string, number>> {
  const platform = CG_PLATFORM[chain];
  const from = Math.floor(fromTs / 1000) - 86400;
  const to = Math.floor(Date.now() / 1000);
  const path = contract
    ? `${CG_BASE}/coins/${platform}/contract/${contract}/market_chart/range`
    : `${CG_BASE}/coins/ethereum/market_chart/range`; // native ETH
  const url = `${path}?vs_currency=usd&from=${from}&to=${to}`;

  const out: Record<string, number> = {};
  try {
    const res = await fetch(url, { headers: cgHeaders() });
    if (!res.ok) return out;
    const data = await res.json();
    for (const [ms, price] of data.prices || []) {
      const day = new Date(ms).toISOString().slice(0, 10);
      out[day] = price; // last write for a day wins; fine for daily granularity
    }
  } catch {
    // empty lookup → caller skips this token
  }
  return out;
}

function priceOnDay(series: Record<string, number>, ts: number): number | null {
  // Walk back up to 7 days to find the nearest available daily price.
  for (let i = 0; i < 7; i++) {
    const day = new Date(ts - i * 86400000).toISOString().slice(0, 10);
    if (series[day] != null) return series[day];
  }
  return null;
}

// Enrich positions in place with real cost basis + unrealized P&L.
export async function enrichWithCostBasis(
  address: string,
  chain: EVMChain,
  positions: Position[]
): Promise<Position[]> {
  const url = alchemyUrl(chain);
  if (!url || positions.length === 0) return positions;

  let incoming: Transfer[];
  let outgoing: Transfer[];
  try {
    const [toT, fromT] = await Promise.all([
      getAssetTransfers(url, address, 'to'),
      getAssetTransfers(url, address, 'from'),
    ]);
    incoming = normalize(toT, true);
    outgoing = normalize(fromT, false);
  } catch (e) {
    console.error('Transfer history fetch failed, skipping cost basis:', e);
    return positions;
  }

  // Group transfers per token key (lowercased contract; '' = native).
  const all = [...incoming, ...outgoing].sort((a, b) => a.ts - b.ts);
  const byToken: Record<string, Transfer[]> = {};
  for (const t of all) {
    (byToken[t.contract] ||= []).push(t);
  }

  await Promise.all(
    positions.map(async pos => {
      const isNative = pos.tokenAddress === '0x0000000000000000000000000000000000000000';
      const key = isNative ? '' : pos.tokenAddress.toLowerCase();
      const txs = byToken[key];
      if (!txs || txs.length === 0) return;

      const firstTs = txs[0].ts;
      const series = await dailyPriceSeries(chain, key, firstTs);
      if (Object.keys(series).length === 0) return;

      let qty = 0;
      let cost = 0; // USD
      for (const tx of txs) {
        if (tx.incoming) {
          const price = priceOnDay(series, tx.ts);
          if (price == null) continue;
          cost += tx.value * price;
          qty += tx.value;
        } else {
          if (qty <= 0) continue;
          const avg = cost / qty;
          const sold = Math.min(tx.value, qty);
          cost -= avg * sold;
          qty -= sold;
        }
      }

      if (qty > 0 && cost > 0) {
        pos.costBasisUSD = cost;
        pos.unrealizedPnL = pos.valueUSD - cost;
      }
    })
  );

  return positions;
}
