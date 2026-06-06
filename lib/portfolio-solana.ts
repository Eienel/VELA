import { Position } from '@/types';
import { getTokenPrices, getNativePrice } from '@/lib/prices';

// Minimum USD value for a token to show — filters airdropped spam/dust.
const MIN_TOKEN_USD = 1;

function heliusUrl(): string | null {
  // Prefer an explicit RPC URL, else build one from the API key.
  if (process.env.HELIUS_RPC_URL) return process.env.HELIUS_RPC_URL;
  if (process.env.HELIUS_API_KEY)
    return `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
  return null;
}

async function rpc(url: string, method: string, params: any): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 'vela', method, params }),
  });
  if (!res.ok) throw new Error(`Helius ${method} failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`Helius ${method}: ${json.error.message}`);
  return json.result;
}

const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const WRAPPED_SOL = 'So11111111111111111111111111111111111111112';

// Read native SOL + every SPL token a wallet holds via Helius, price each
// through CoinGecko, and drop anything below MIN_TOKEN_USD (spam filter).
async function getRealSolanaPortfolio(address: string): Promise<Position[]> {
  const url = heliusUrl();
  if (!url) throw new Error('No Helius config');
  const now = new Date();

  const [lamports, tokenAccounts] = await Promise.all([
    rpc(url, 'getBalance', [address]),
    rpc(url, 'getTokenAccountsByOwner', [
      address,
      { programId: TOKEN_PROGRAM },
      { encoding: 'jsonParsed' },
    ]),
  ]);

  // Aggregate balances per mint (a wallet can have multiple accounts per mint).
  const mintBalances: Record<string, number> = {};
  for (const acc of tokenAccounts?.value || []) {
    const info = acc.account?.data?.parsed?.info;
    if (!info) continue;
    const mint = info.mint;
    const amount = info.tokenAmount?.uiAmount || 0;
    if (amount > 0) mintBalances[mint] = (mintBalances[mint] || 0) + amount;
  }

  const mints = Object.keys(mintBalances);
  const [prices, solPrice] = await Promise.all([
    getTokenPrices('solana', mints),
    getNativePrice('solana'),
  ]);

  const positions: Position[] = [];

  // Native SOL.
  const solBalance = (typeof lamports === 'object' ? lamports.value : lamports) / 1e9;
  const solValue = solBalance * solPrice.usd;
  if (solValue >= MIN_TOKEN_USD) {
    positions.push({
      walletAddress: address,
      tokenSymbol: 'SOL',
      tokenAddress: WRAPPED_SOL,
      balance: solBalance,
      valueUSD: solValue,
      chain: 'solana',
      chainType: 'solana',
      priceUSD: solPrice.usd,
      change24h: solPrice.change24h,
      change30d: 0,
      costBasisUSD: solValue,
      unrealizedPnL: 0,
      updatedAt: now,
    });
  }

  // SPL tokens.
  for (const mint of mints) {
    const price = prices[mint.toLowerCase()];
    if (!price) continue; // unknown/untradeable → skip
    const balance = mintBalances[mint];
    const valueUSD = balance * price.usd;
    if (valueUSD < MIN_TOKEN_USD) continue; // spam/dust filter
    positions.push({
      walletAddress: address,
      tokenSymbol: mint.slice(0, 4).toUpperCase(),
      tokenAddress: mint,
      balance,
      valueUSD,
      chain: 'solana',
      chainType: 'solana',
      priceUSD: price.usd,
      change24h: price.change24h,
      change30d: 0,
      costBasisUSD: valueUSD,
      unrealizedPnL: 0,
      updatedAt: now,
    });
  }

  return positions.sort((a, b) => b.valueUSD - a.valueUSD);
}

// Entry point: try real read, fall back to demo data on missing config/error.
export async function getSolanaPortfolio(address: string): Promise<Position[]> {
  if (heliusUrl()) {
    try {
      const real = await getRealSolanaPortfolio(address);
      if (real.length > 0) return real;
    } catch (e) {
      console.error('Solana real read failed, using demo data:', e);
    }
  }
  return getMockSolanaPortfolio(address);
}

// Demo / fallback data.
export async function getMockSolanaPortfolio(address: string): Promise<Position[]> {
  const now = new Date();
  return [
    {
      walletAddress: address,
      tokenSymbol: 'SOL',
      tokenAddress: WRAPPED_SOL,
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
