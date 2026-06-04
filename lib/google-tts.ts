// Google Cloud Text-to-Speech via REST API key auth.
// Reuses the same Google API key as Gemini (requires the
// Cloud Text-to-Speech API to be enabled on the project).
export async function synthesizeGoogleTTS(text: string): Promise<Buffer | null> {
  const key =
    process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) return null;

  const voiceName = process.env.GOOGLE_TTS_VOICE || 'en-US-Neural2-F';

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'en-US', name: voiceName },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0, pitch: 0 },
      }),
    }
  );

  if (!response.ok) {
    console.error('Google TTS error:', await response.text());
    return null;
  }

  const data = (await response.json()) as { audioContent?: string };
  if (!data.audioContent) return null;
  return Buffer.from(data.audioContent, 'base64');
}
