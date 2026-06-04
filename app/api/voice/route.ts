import { NextRequest, NextResponse } from 'next/server';
import { synthesizeGoogleTTS } from '@/lib/google-tts';
import { streamVoice } from '@/lib/elevenlabs';

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  // 1) Primary: Gemini native TTS (free tier, no billing, works from Vercel)
  try {
    const result = await synthesizeGoogleTTS(text);
    if (result) {
      return new Response(new Uint8Array(result.audio), {
        headers: {
          'Content-Type': result.contentType,
          'Cache-Control': 'no-store',
        },
      });
    }
  } catch (error) {
    console.error('Gemini TTS failed, trying ElevenLabs:', error);
  }

  // 2) Fallback: ElevenLabs (if a paid key is configured)
  try {
    const response = await streamVoice(text);
    if (response.ok) {
      return new Response(response.body, {
        headers: { 'Content-Type': 'audio/mpeg' },
      });
    }
  } catch (error) {
    console.error('ElevenLabs failed:', error);
  }

  // 3) Signal the client to use its browser SpeechSynthesis fallback
  return NextResponse.json({ error: 'TTS unavailable' }, { status: 503 });
}
