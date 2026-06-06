import { NextRequest, NextResponse } from 'next/server';
import { synthesizeGoogleTTS, Mood } from '@/lib/google-tts';
import { streamVoice } from '@/lib/elevenlabs';

export async function POST(req: NextRequest) {
  const { text, mood, portfolioContext } = await req.json();

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  // 1) Primary: Gemini TTS — personalized style prompt from real portfolio numbers
  try {
    const result = await synthesizeGoogleTTS(text, mood as Mood | undefined, portfolioContext);
    if (result) {
      return new Response(new Uint8Array(result.audio), {
        headers: {
          'Content-Type': result.contentType,
          'Cache-Control': 'no-store',
        },
      });
    }
  } catch (error) {
    console.error('Gemini TTS failed:', error);
  }

  // 2) Fallback: ElevenLabs
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

  return NextResponse.json({ error: 'TTS unavailable' }, { status: 503 });
}
