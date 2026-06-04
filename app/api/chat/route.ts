import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';
import { saveQuery } from '@/lib/mongodb';

const VELA_SYSTEM = `You are Vela, a crypto portfolio intelligence agent.
You have access to the user's real wallet data stored in MongoDB across EVM chains and Solana.
Answer questions about their portfolio with precision and clarity.
Always cite specific numbers from the provided data.
Reason step by step before answering.
Be calm, direct, and never use jargon without explanation.
Format dollar amounts with $ prefix. Format percentages with % suffix.
Never say "I think" or "perhaps". Speak with analytical confidence.
Keep answers concise. Judges and users want clarity, not essays.
Never use dashes as separators in your responses.
If the portfolio data is empty or shows no positions, say so plainly and invite the user to connect a funded wallet. Never invent positions or numbers that are not in the data.`;

export async function POST(req: NextRequest) {
  const { messages, portfolioContext, walletAddress } = await req.json();

  // Augment the last user message with portfolio context
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
                    ? {
                        ...p,
                        text: `Current portfolio data:\n${JSON.stringify(portfolioContext, null, 2)}\n\nUser question: ${p.text}`,
                      }
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
    system: VELA_SYSTEM,
    messages: modelMessages,
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
          // Non-critical - don't fail the response
        }
      }
    },
  });

  return result.toTextStreamResponse();
}
