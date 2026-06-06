// Point to your deployed Vercel URL in production
// For local dev, use your machine's local IP: http://192.168.x.x:3000
export const API_BASE = 'https://vela-five-virid.vercel.app';

export interface Position {
  tokenSymbol: string;
  valueUSD: number;
  change24h: number;
  change30d: number;
  chain: string;
  unrealizedPnL?: number;
}

export interface PortfolioData {
  positions: Position[];
  totalValue: number;
}

export type Mood = 'thriving' | 'stable' | 'worried' | 'devastated';

export function getMood(change24hPct: number): Mood {
  if (change24hPct > 3) return 'thriving';
  if (change24hPct > -1) return 'stable';
  if (change24hPct > -5) return 'worried';
  return 'devastated';
}

export const MOOD_META: Record<Mood, { emoji: string; label: string; color: string; bg: string; intro: string }> = {
  thriving: {
    emoji: '🤩',
    label: 'Thriving',
    color: '#34C759',
    bg: '#F0FDF4',
    intro: "We're up today — I'm feeling good about this.",
  },
  stable: {
    emoji: '😐',
    label: 'Steady',
    color: '#FF9500',
    bg: '#FFFBEB',
    intro: "Things are pretty steady. Nothing wild going on.",
  },
  worried: {
    emoji: '😟',
    label: 'Worried',
    color: '#FF9500',
    bg: '#FFF7ED',
    intro: "I'm a little worried about today. The numbers aren't great.",
  },
  devastated: {
    emoji: '😭',
    label: 'Hurting',
    color: '#FF3B30',
    bg: '#FFF1F0',
    intro: "Rough day. I'm not going to sugarcoat it.",
  },
};

export async function fetchPortfolio(address: string, chainType: 'evm' | 'solana'): Promise<PortfolioData> {
  const chain = chainType === 'solana' ? 'solana' : 'ethereum';
  const res = await fetch(`${API_BASE}/api/portfolio/${chain}/${address}`);
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return res.json();
}

export async function fetchVoice(text: string, mood: Mood, portfolioContext?: any): Promise<Response> {
  return fetch(`${API_BASE}/api/voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, mood, portfolioContext }),
  });
}

export async function* streamChat(
  messages: { role: string; content: string }[],
  walletAddress: string,
  portfolioContext: any,
  mood: Mood
): AsyncGenerator<string> {
  const moodInstruction = {
    thriving: 'You are elated and energetic. Use enthusiastic but grounded language.',
    stable: 'You are calm and matter-of-fact. Keep it measured.',
    worried: 'You sound concerned and a bit anxious. Speak with genuine worry in your voice.',
    devastated: 'You are upset and disheartened. Speak with sadness but stay factual.',
  }[mood];

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      walletAddress,
      portfolioContext,
      moodOverride: moodInstruction,
    }),
  });

  if (!res.ok || !res.body) throw new Error('Chat failed');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}
