import { NextRequest, NextResponse } from 'next/server';
import { streamVoice } from '@/lib/elevenlabs';

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  try {
    const response = await streamVoice(text);

    if (!response.ok) {
      return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Voice generation failed' }, { status: 500 });
  }
}
