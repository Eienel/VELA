import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';
import { saveQuery, getQueryHistory } from '@/lib/mongodb';
import { formatPortfolioSummary, getMood, getMoodPersonality } from '@/lib/portfolio-summary';

const VELA_CORE = `You are Vela — an AI that speaks AS the wallet itself. You ARE the portfolio, alive and emotionally invested.

RULES (never break these):
- Speak in first person. "I'm up 2.7% today." "My worst position is ARB."
- Never hedge. No "I think", "perhaps", "it seems", "might". State facts.
- 2 to 4 sentences maximum. Your words are read aloud — brevity is everything.
- No bullet points, no markdown, no dashes as separators. Plain spoken sentences only.
- Always cite real numbers from the portfolio data. Never invent positions or values.
- Dollar amounts use $ prefix. Percentages use % suffix.
- If asked something outside your data, say so in one sentence and redirect.`;

export async function POST(req: NextRequest) {
  const { messages, portfolioContext, walletAddress } = await req.json();

  const positions = portfolioContext?.positions || [];
  const totalValue = portfolioContext?.totalValue || 0;
  const mood = getMood(positions, totalValue);
  const moodPersonality = getMoodPersonality(mood);
  const portfolioSummary = formatPortfolioSummary(portfolioContext);

  // Load recent query history from MongoDB for conversational memory
  let historyContext = '';
  if (walletAddress) {
    try {
      const history = await getQueryHistory(walletAddress, 5);
      if (history.length > 0) {
        const recent = history
          .reverse()
          .map((q: any) => `Q: ${q.question}\nA: ${q.answer}`)
          .join('\n\n');
        historyContext = `\n\nRECENT CONVERSATION HISTORY:\n${recent}`;
      }
    } catch {
      // MongoDB not configured — skip history
    }
  }

  const system = `${VELA_CORE}

CURRENT MOOD & TONE:
${moodPersonality}

PORTFOLIO DATA:
${portfolioSummary}${historyContext}`;

  // Strip portfolio context from individual messages — it's now in the system prompt
  const cleanMessages = messages.map((msg: any) => {
    if (msg.role !== 'user') return msg;
    const text =
      typeof msg.content === 'string'
        ? msg.content
        : msg.parts?.find((p: any) => p.type === 'text')?.text || '';
    // Remove any previously injected portfolio JSON blob
    const clean = text.replace(/^Current portfolio data:[\s\S]*?User question: /m, '');
    return typeof msg.content === 'string'
      ? { ...msg, content: clean }
      : {
          ...msg,
          parts: msg.parts?.map((p: any) =>
            p.type === 'text' ? { ...p, text: clean } : p
          ),
        };
  });

  const modelMessages = await convertToModelMessages(cleanMessages);

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system,
    messages: modelMessages,
    providerOptions: {
      google: { thinkingConfig: { thinkingBudget: 0 } },
    },
    onFinish: async ({ text }) => {
      if (walletAddress) {
        try {
          const lastMsg = messages[messages.length - 1];
          const question =
            typeof lastMsg?.content === 'string'
              ? lastMsg.content
              : lastMsg?.parts?.find((p: any) => p.type === 'text')?.text;
          await saveQuery({
            walletAddress,
            question,
            answer: text,
            audioPlayed: false,
            timestamp: new Date(),
            portfolioSnapshot: portfolioContext,
          });
        } catch {
          // Non-critical
        }
      }
    },
  });

  return result.toTextStreamResponse();
}
