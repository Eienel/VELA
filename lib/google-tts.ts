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

// Style prefix Gemini TTS understands and performs
const MOOD_STYLE: Record<Mood, string> = {
  thriving: 'Say the following in an upbeat, enthusiastic, and energetic voice — clearly happy and excited: ',
  stable:   'Say the following in a calm, measured, and composed voice: ',
  worried:  'Say the following in an anxious, concerned voice — clearly troubled and uneasy: ',
  devastated: 'Say the following in a slow, dejected, sad voice — clearly hurt and disheartened: ',
};

// Different voices also have personality — Kore is calm/neutral, Aoede is expressive
const MOOD_VOICE: Record<Mood, string> = {
  thriving:   'Aoede',   // expressive, bright
  stable:     'Kore',    // neutral, calm
  worried:    'Kore',    // same but tone shifts via style prompt
  devastated: 'Kore',    // slower via style prompt
};

export interface TTSResult {
  audio: Buffer;
  contentType: string;
}

export async function synthesizeGoogleTTS(text: string, mood?: Mood): Promise<TTSResult | null> {
  const key = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) return null;

  const voiceName = mood ? MOOD_VOICE[mood] : (process.env.GOOGLE_TTS_VOICE || 'Kore');
  const styledText = mood ? MOOD_STYLE[mood] + text : text;
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
