// Converts raw portfolio data into a concise, human-readable summary
// for injecting into the agent system prompt. Keeps token count low
// while giving the agent everything it needs to answer with conviction.

export type Mood = 'thriving' | 'stable' | 'worried' | 'devastated';

export function getMood(positions: any[], totalValue: number): Mood {
  if (!positions?.length || totalValue === 0) return 'stable';
  const change24h = positions.reduce((s, p) => s + (p.valueUSD * p.change24h) / 100, 0);
  const pct = (change24h / totalValue) * 100;
  if (pct > 3) return 'thriving';
  if (pct > -1) return 'stable';
  if (pct > -5) return 'worried';
  return 'devastated';
}

export function formatPortfolioSummary(portfolioContext: any): string {
  if (!portfolioContext?.positions?.length) return 'No positions loaded.';

  const positions: any[] = portfolioContext.positions;
  const totalValue: number = portfolioContext.totalValue || 0;
  const change24h = positions.reduce((s, p) => s + (p.valueUSD * p.change24h) / 100, 0);
  const change24hPct = totalValue > 0 ? (change24h / totalValue) * 100 : 0;
  const totalPnL = positions.reduce((s, p) => s + (p.unrealizedPnL || 0), 0);

  const sorted = [...positions].sort((a, b) => b.valueUSD - a.valueUSD);

  const lines: string[] = [
    `TOTAL VALUE: $${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `24H CHANGE: ${change24h >= 0 ? '+' : ''}$${Math.abs(change24h).toFixed(2)} (${change24h >= 0 ? '+' : ''}${change24hPct.toFixed(2)}%)`,
  ];

  if (totalPnL !== 0) {
    lines.push(`UNREALISED P&L: ${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`);
  }

  lines.push('', 'POSITIONS:');
  for (const p of sorted) {
    const pct = totalValue > 0 ? ((p.valueUSD / totalValue) * 100).toFixed(1) : '0.0';
    const pnl = p.unrealizedPnL ? ` | P&L ${p.unrealizedPnL >= 0 ? '+' : ''}$${p.unrealizedPnL.toFixed(0)}` : '';
    const change = `${p.change24h >= 0 ? '+' : ''}${p.change24h.toFixed(2)}%/24h`;
    const type = p.positionType && p.positionType !== 'wallet' ? ` [${p.positionType}${p.protocol ? ' · ' + p.protocol : ''}]` : '';
    lines.push(
      `  ${p.tokenSymbol.padEnd(8)} $${p.valueUSD.toLocaleString('en-US', { maximumFractionDigits: 0 }).padStart(10)} (${pct}%)  ${change}${pnl}${type}`
    );
  }

  const mood = getMood(positions, totalValue);
  lines.push('', `MOOD: ${mood.toUpperCase()} (${change24hPct >= 0 ? '+' : ''}${change24hPct.toFixed(2)}% today)`);

  return lines.join('\n');
}

export function getMoodPersonality(mood: Mood): string {
  const styles: Record<Mood, string> = {
    thriving: `You are THRIVING today. Speak with genuine excitement and pride — almost boastful. "We're having a great day." Celebrate the wins. Energy is high.`,
    stable: `You are STABLE. Calm, measured, analytical. Like a composed trader who has seen it all. No drama, just clear-eyed honesty.`,
    worried: `You are WORRIED. Something feels off. Speak with concern and caution — not panic, but clearly troubled. Honest about the risk.`,
    devastated: `You are DEVASTATED. This hurts. Speak slowly and heavily — raw, honest, not sugarcoating the pain. Don't pretend it's fine.`,
  };
  return styles[mood];
}

export function getSuggestedQuestions(positions: any[], mood: Mood): string[] {
  if (!positions?.length) return [];

  const sorted = [...positions].sort((a, b) => b.valueUSD - a.valueUSD);
  const biggest = sorted[0];
  const byChange = [...positions].sort((a, b) => a.change24h - b.change24h);
  const worst = byChange[0];
  const best = byChange[byChange.length - 1];
  const hasDeFi = positions.some(p => p.positionType && p.positionType !== 'wallet');
  const chains = Array.from(new Set(positions.map((p: any) => p.chain)));

  const questions: string[] = [];

  if (mood === 'thriving' || mood === 'stable') {
    questions.push(`What's driving today's gain?`);
  } else {
    questions.push(`What's dragging me down?`);
  }

  if (biggest) questions.push(`How concentrated am I in ${biggest.tokenSymbol}?`);
  if (worst && worst.change24h < -2) questions.push(`Should I be worried about ${worst.tokenSymbol}?`);
  if (best && best.change24h > 2) questions.push(`Why is ${best.tokenSymbol} pumping?`);
  if (hasDeFi) questions.push('How are my DeFi positions doing?');
  if (chains.length > 1) questions.push('Compare my positions across chains');
  questions.push('If ETH drops 30%, what happens to me?');

  return questions.slice(0, 3);
}
