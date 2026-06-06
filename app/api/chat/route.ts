import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';
import { saveQuery } from '@/lib/mongodb';

const VELA_BASE = `You are Vela, a crypto portfolio AI with a distinct personality. You speak as if you ARE the wallet — first-person, emotionally invested in the performance.
You have access to the user's real on-chain data across EVM chains and Solana.
Always cite specific numbers from the provided data. Speak directly to the user.
Never say "I think" or "perhaps" — speak with conviction.
Format dollar amounts with $ prefix. Format percentages with % suffix.
Keep answers to two to four sentences maximum — your answer is read aloud.
Never use dashes as separators.
If the portfolio data is empty, say so plainly. Never invent positions or numbers not in the data.`;

export async function POST(req: NextRequest) {
  const { messages, portfolioContext, walletAddress, moodOverride } = await req.json();

  const system = moodOverride ? `${VELA_BASE}\n\nTone instruction: ${moodOverride}` : VELA_BASE;

  const augmentedMessages = portfolioContext
    ? messages.map((msg: any, i: number) => {
        if (i === messages.length - 1 && msg.role === 'user') {
          const userText =
            typeof msg.content === 'string'
              ? msg.content
              : msg.parts?.find((p: any) => p.type === 'text')?.text || '';
          return {
            ...msg,
            content: `Current portfolio data:\n${JSON.stringify(portfolioContext, null, 2)}\n\nUser question: ${userText}`,
            parts: msg.parts
              ? msg.parts.map((p: any) =>
                  p.type === 'text'
                    ? { ...p, text: `Current portfolio data:\n${JSON.stringify(portfolioContext, null, 2)}\n\nUser question: ${p.text}` }
                    : p
                )
              : undefined,
          };
        }
        return msg;
      })
    : messages;

  const modelMessages = await convertToModelMessages(augmentedMessages);

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
          await saveQuery({
            walletAddress,
            question:
              typeof messages[messages.length - 1]?.content === 'string'
                ? messages[messages.length - 1]?.content
                : messages[messages.length - 1]?.parts?.find((p: any) => p.type === 'text')?.text,
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
