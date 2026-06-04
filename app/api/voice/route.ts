import { NextRequest, NextResponse } from 'next/server';
import { synthesizeGoogleTTS } from '@/lib/google-tts';
import { streamVoice } from '@/lib/elevenlabs';

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  // 1) Primary: Google Cloud Text-to-Speech (free tier, works from Vercel)
  try {
    const audio = await synthesizeGoogleTTS(text);
    if (audio) {
      return new Response(new Uint8Array(audio), {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-store',
        },
      });
    }
  } catch (error) {
    console.error('Google TTS failed, trying ElevenLabs:', error);
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
