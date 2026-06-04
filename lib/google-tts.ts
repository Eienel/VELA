// Gemini native Text-to-Speech via the AI Studio API.
// Uses the same Gemini API key (no billing / no Cloud billing account
// required) and returns playable WAV audio. Keeps the Google story for
// the hackathon while staying on the free tier.

const SAMPLE_RATE = 24000; // Gemini TTS outputs 24kHz mono 16-bit PCM

// Wrap raw signed 16-bit little-endian PCM in a minimal WAV container.
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
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

export interface TTSResult {
  audio: Buffer;
  contentType: string;
}

export async function synthesizeGoogleTTS(text: string): Promise<TTSResult | null> {
  const key =
    process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) return null;

  const voiceName = process.env.GOOGLE_TTS_VOICE || 'Kore';
  const model = 'gemini-2.5-flash-preview-tts';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
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

  // Parse sample rate from mimeType if present (e.g. "audio/L16;rate=24000")
  const mime: string = part.inlineData.mimeType || '';
  const rateMatch = mime.match(/rate=(\d+)/);
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : SAMPLE_RATE;

  const pcm = Buffer.from(b64, 'base64');
  return { audio: pcmToWav(pcm, sampleRate), contentType: 'audio/wav' };
}
