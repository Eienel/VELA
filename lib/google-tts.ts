// Gemini native Text-to-Speech via the AI Studio API.
// Supports mood-based style prompting — Gemini performs the emotion.

const SAMPLE_RATE = 24000;

function pcmToWav(pcm: Buffer, sampleRate = SAMPLE_RATE): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

export type Mood = 'thriving' | 'stable' | 'worried' | 'devastated';

const MOOD_VOICE: Record<Mood, string> = {
  thriving:   'Aoede',
  stable:     'Kore',
  worried:    'Kore',
  devastated: 'Kore',
};

// Build a personalized style prompt from real portfolio numbers
export function buildMoodStyle(mood: Mood, portfolioContext?: any): string {
  const base = {
    thriving:   'upbeat, enthusiastic, and energetic — clearly excited and proud',
    stable:     'calm, measured, and composed — steady and matter-of-fact',
    worried:    'anxious and concerned — clearly troubled and uneasy',
    devastated: 'slow, dejected, and sad — clearly hurt and disheartened',
  }[mood];

  if (!portfolioContext?.positions?.length) {
    return `Say the following in a ${base} voice: `;
  }

  const positions = portfolioContext.positions as any[];
  const totalValue: number = portfolioContext.totalValue || 0;
  const change24h = positions.reduce((s: number, p: any) => s + (p.valueUSD * p.change24h / 100), 0);
  const change24hPct = totalValue > 0 ? (change24h / totalValue) * 100 : 0;

  const sorted = [...positions].sort((a, b) => (a.valueUSD * a.change24h / 100) - (b.valueUSD * b.change24h / 100));
  const worst = sorted[0];
  const best = sorted[sorted.length - 1];

  let context = '';
  if (mood === 'thriving') {
    context = `You are up $${Math.abs(change24h).toFixed(0)} (${Math.abs(change24hPct).toFixed(1)}%) today.`
      + (best ? ` ${best.tokenSymbol} is your star performer.` : '');
  } else if (mood === 'stable') {
    context = `Portfolio is flat — ${change24hPct >= 0 ? '+' : ''}${change24hPct.toFixed(1)}% today. Nothing dramatic.`;
  } else if (mood === 'worried') {
    context = `You are down $${Math.abs(change24h).toFixed(0)} (${Math.abs(change24hPct).toFixed(1)}%) today.`
      + (worst ? ` ${worst.tokenSymbol} is dragging things down.` : '');
  } else {
    context = `You are down $${Math.abs(change24h).toFixed(0)} (${Math.abs(change24hPct).toFixed(1)}%) today — it hurts.`
      + (worst ? ` ${worst.tokenSymbol} is your worst performer right now.` : '');
  }

  return `Say the following in a ${base} voice. Context for your emotional state: ${context} Now say: `;
}

export interface TTSResult {
  audio: Buffer;
  contentType: string;
}

export async function synthesizeGoogleTTS(text: string, mood?: Mood, portfolioContext?: any): Promise<TTSResult | null> {
  const key = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) return null;

  const voiceName = mood ? MOOD_VOICE[mood] : (process.env.GOOGLE_TTS_VOICE || 'Kore');
  const styledText = mood ? buildMoodStyle(mood, portfolioContext) + text : text;
  const model = 'gemini-2.5-flash-preview-tts';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: styledText }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
        },
      }),
    }
  );

  if (!response.ok) {
    console.error('Gemini TTS error:', await response.text());
    return null;
  }

  const data = await response.json();
  const part = data?.candidates?.[0]?.content?.parts?.find(
    (p: any) => p.inlineData?.data
  );
  const b64 = part?.inlineData?.data;
  if (!b64) return null;

  const mime: string = part.inlineData.mimeType || '';
  const rateMatch = mime.match(/rate=(\d+)/);
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : SAMPLE_RATE;

  const pcm = Buffer.from(b64, 'base64');
  return { audio: pcmToWav(pcm, sampleRate), contentType: 'audio/wav' };
}
