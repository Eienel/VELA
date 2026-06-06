import { Position } from '@/types';
import { getTokenPrices, getNativePrice } from '@/lib/prices';
import { enrichWithCostBasis } from '@/lib/cost-basis';

type EVMChain = 'ethereum' | 'base' | 'arbitrum';

// Minimum USD value for a token to show — filters airdropped spam/dust.
const MIN_TOKEN_USD = 1;

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

async function rpc(url: string, method: string, params: any[]): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }),
  });
  if (!res.ok) throw new Error(`RPC ${method} failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`RPC ${method}: ${json.error.message}`);
  return json.result;
}

const NATIVE_SYMBOL: Record<EVMChain, string> = {
  ethereum: 'ETH',
  base: 'ETH',
  arbitrum: 'ETH',
};

// Read every ERC-20 a wallet holds via Alchemy, price each through CoinGecko,
// and drop anything worth less than MIN_TOKEN_USD (spam filter).
async function getRealEVMPortfolio(address: string, chain: EVMChain): Promise<Position[]> {
  const url = alchemyUrl(chain);
  if (!url) throw new Error('No ALCHEMY_API_KEY');
  const now = new Date();

  // 1. Native balance + every ERC-20 balance.
  const [nativeHex, balResult] = await Promise.all([
    rpc(url, 'eth_getBalance', [address, 'latest']),
    rpc(url, 'alchemy_getTokenBalances', [address, 'erc20']),
  ]);

  const rawBalances: { contractAddress: string; tokenBalance: string }[] =
    (balResult?.tokenBalances || []).filter(
      (b: any) => b.tokenBalance && b.tokenBalance !== '0x' + '0'.repeat(64)
    );

  // 2. Metadata (symbol + decimals) for each held token.
  const metas = await Promise.all(
    rawBalances.map(async b => {
      try {
        const m = await rpc(url, 'alchemy_getTokenMetadata', [b.contractAddress]);
        return { contract: b.contractAddress.toLowerCase(), raw: b.tokenBalance, meta: m };
      } catch {
        return null;
      }
    })
  );

  // 3. Prices + 24h change for all held tokens in one CoinGecko call.
  const contracts = rawBalances.map(b => b.contractAddress.toLowerCase());
  const [prices, nativePrice] = await Promise.all([
    getTokenPrices(chain, contracts),
    getNativePrice('ethereum'),
  ]);

  const positions: Position[] = [];

  // Native coin position.
  const nativeBalance = parseInt(nativeHex, 16) / 1e18;
  const nativeValue = nativeBalance * nativePrice.usd;
  if (nativeValue >= MIN_TOKEN_USD) {
    positions.push({
      walletAddress: address,
      tokenSymbol: NATIVE_SYMBOL[chain],
      tokenAddress: '0x0000000000000000000000000000000000000000',
      balance: nativeBalance,
      valueUSD: nativeValue,
      chain,
      chainType: 'evm',
      priceUSD: nativePrice.usd,
      change24h: nativePrice.change24h,
      change30d: 0,
      costBasisUSD: nativeValue,
      unrealizedPnL: 0,
      updatedAt: now,
    });
  }

  // ERC-20 positions.
  for (const item of metas) {
    if (!item || !item.meta) continue;
    const decimals = item.meta.decimals ?? 18;
    const balance = parseInt(item.raw, 16) / Math.pow(10, decimals);
    const price = prices[item.contract];
    if (!price) continue; // unknown/untradeable token → skip
    const valueUSD = balance * price.usd;
    if (valueUSD < MIN_TOKEN_USD) continue; // spam/dust filter
    positions.push({
      walletAddress: address,
      tokenSymbol: item.meta.symbol || '???',
      tokenAddress: item.contract,
      balance,
      valueUSD,
      chain,
      chainType: 'evm',
      priceUSD: price.usd,
      change24h: price.change24h,
      change30d: 0,
      costBasisUSD: valueUSD,
      unrealizedPnL: 0,
      updatedAt: now,
    });
  }

  // Enrich with real cost basis + unrealized P&L from transfer history.
  await enrichWithCostBasis(address, chain, positions);

  return positions.sort((a, b) => b.valueUSD - a.valueUSD);
}

// Entry point: try real on-chain read, fall back to demo data when no API
// key is configured or the providers error out.
export async function getEVMPortfolio(
  address: string,
  chain: EVMChain = 'ethereum'
): Promise<Position[]> {
  if (process.env.ALCHEMY_API_KEY) {
    try {
      const real = await getRealEVMPortfolio(address, chain);
      if (real.length > 0) return real;
    } catch (e) {
      console.error('EVM real read failed, using demo data:', e);
    }
  }
  return getMockEVMPortfolio(address, chain);
}

// Demo / fallback data.
export async function getMockEVMPortfolio(
  address: string,
  chain: EVMChain = 'ethereum'
): Promise<Position[]> {
  const now = new Date();

  if (chain === 'base') {
    return [
      {
        walletAddress: address,
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
        balance: 5.21,
        valueUSD: 9206,
        chain: 'base',
        chainType: 'evm',
        priceUSD: 1767.0,
        change24h: 3.8,
        change30d: 7.4,
        costBasisUSD: 8500,
        unrealizedPnL: 706,
        updatedAt: now,
      },
      {
        walletAddress: address,
        tokenSymbol: 'USDC',
        tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        balance: 4200,
        valueUSD: 4200,
        chain: 'base',
        chainType: 'evm',
        priceUSD: 1.0,
        change24h: 0,
        change30d: 0,
        costBasisUSD: 4200,
        unrealizedPnL: 0,
        updatedAt: now,
      },
      {
        walletAddress: address,
        tokenSymbol: 'AERO',
        tokenAddress: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
        balance: 12000,
        valueUSD: 2160,
        chain: 'base',
        chainType: 'evm',
        priceUSD: 0.18,
        change24h: -5.2,
        change30d: -22.1,
        costBasisUSD: 3000,
        unrealizedPnL: -840,
        updatedAt: now,
      },
    ];
  }

  if (chain === 'arbitrum') {
    return [
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
        tokenSymbol: 'ETH',
        tokenAddress: '0x0000000000000000000000000000000000000000',
        balance: 3.5,
        valueUSD: 6183,
        chain: 'arbitrum',
        chainType: 'evm',
        priceUSD: 1767.0,
        change24h: 4.1,
        change30d: 8.2,
        costBasisUSD: 5800,
        unrealizedPnL: 383,
        updatedAt: now,
      },
      {
        walletAddress: address,
        tokenSymbol: 'USDC',
        tokenAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        balance: 3500,
        valueUSD: 3500,
        chain: 'arbitrum',
        chainType: 'evm',
        priceUSD: 1.0,
        change24h: 0,
        change30d: 0,
        costBasisUSD: 3500,
        unrealizedPnL: 0,
        updatedAt: now,
      },
    ];
  }

  // Default: Ethereum
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
