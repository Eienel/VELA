// Price + 24h change lookups via CoinGecko's free by-contract endpoint.
// One call per chain returns USD price and 24h % change for many tokens,
// keyed by lowercased contract address.

const CG_BASE = 'https://api.coingecko.com/api/v3';

// CoinGecko asset-platform ids for each chain we support.
export const CG_PLATFORM: Record<string, string> = {
  ethereum: 'ethereum',
  base: 'base',
  arbitrum: 'arbitrum-one',
  solana: 'solana',
};

export interface PriceInfo {
  usd: number;
  change24h: number;
}

function cgHeaders(): HeadersInit {
  const key = process.env.COINGECKO_API_KEY;
  return key ? { 'x-cg-demo-api-key': key } : {};
}

// Fetch prices for a batch of token contract/mint addresses on one chain.
// Returns a map keyed by lowercased address.
export async function getTokenPrices(
  chain: string,
  addresses: string[]
): Promise<Record<string, PriceInfo>> {
  const platform = CG_PLATFORM[chain];
  const out: Record<string, PriceInfo> = {};
  if (!platform || addresses.length === 0) return out;

  // CoinGecko caps the contract list length; chunk to be safe.
  const chunks: string[][] = [];
  for (let i = 0; i < addresses.length; i += 100) chunks.push(addresses.slice(i, i + 100));

  for (const chunk of chunks) {
    const url =
      `${CG_BASE}/simple/token_price/${platform}` +
      `?contract_addresses=${chunk.join(',')}` +
      `&vs_currencies=usd&include_24hr_change=true`;
    try {
      const res = await fetch(url, { headers: cgHeaders() });
      if (!res.ok) continue;
      const data = await res.json();
      for (const [addr, info] of Object.entries<any>(data)) {
        if (info?.usd != null) {
          out[addr.toLowerCase()] = { usd: info.usd, change24h: info.usd_24h_change ?? 0 };
        }
      }
    } catch {
      // Skip this chunk on failure; partial prices are fine.
    }
  }
  return out;
}

// Native coin price (ETH, SOL) by CoinGecko id.
export async function getNativePrice(id: 'ethereum' | 'solana'): Promise<PriceInfo> {
  try {
    const url = `${CG_BASE}/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetch(url, { headers: cgHeaders() });
    if (res.ok) {
      const data = await res.json();
      const info = data[id];
      if (info?.usd != null) return { usd: info.usd, change24h: info.usd_24h_change ?? 0 };
    }
  } catch {
    // fall through
  }
  return { usd: 0, change24h: 0 };
}
