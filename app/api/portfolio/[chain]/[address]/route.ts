import { NextRequest, NextResponse } from 'next/server';
import { getEVMPortfolio } from '@/lib/portfolio-evm';
import { getSolanaPortfolio } from '@/lib/portfolio-solana';
import { getZerionPortfolio, hasZerion } from '@/lib/portfolio-zerion';
import { upsertPositions, upsertWallet } from '@/lib/mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { chain: string; address: string } }
) {
  try {
    const { chain, address } = params;
    let positions;

    // Prefer Zerion when configured: better token coverage + DeFi positions.
    // Fall back to the Alchemy/Helius readers on error or when no key is set.
    if (hasZerion()) {
      try {
        positions = await getZerionPortfolio(address, chain);
      } catch (e) {
        console.error('Zerion read failed, falling back:', e);
      }
    }

    if (!positions) {
      if (chain === 'solana') {
        positions = await getSolanaPortfolio(address);
      } else {
        positions = await getEVMPortfolio(address, chain as 'ethereum' | 'base' | 'arbitrum');
      }
    }

    const totalValue = positions.reduce((sum, p) => sum + p.valueUSD, 0);

    // Persist to MongoDB (agent memory). Non-blocking: if the DB is
    // unconfigured or unreachable, still return the portfolio so the
    // dashboard works.
    try {
      await upsertPositions(address, positions);
      await upsertWallet({
        address,
        chainType: chain === 'solana' ? 'solana' : 'evm',
        chains: Array.from(new Set(positions.map(p => p.chain))),
        lastScanned: new Date(),
        totalValueUSD: totalValue,
      });
    } catch (dbError) {
      console.error('MongoDB persist skipped:', dbError);
    }

    return NextResponse.json({ positions, totalValue });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}
