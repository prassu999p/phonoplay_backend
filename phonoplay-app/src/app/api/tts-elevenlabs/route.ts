import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/tts-elevenlabs
 * Body: { text: string, voice_id?: string, language?: string }
 * Returns: { audio_url: string }
 */
export async function POST(req: NextRequest) {
  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
    const { text, voice_id = 'EXAVITQu4vr4xnSDxMaL', model_id = 'eleven_monolingual_v1', output_format = 'mp3_44100_128' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid text' }, { status: 400 });
    }

    const url = `${ELEVENLABS_TTS_URL}/${voice_id}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY ?? '',
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id,
        output_format
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'TTS API error', details: errorText }, { status: 500 });
    }

    // Get audio buffer and return as a downloadable URL or as a base64 string
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    return NextResponse.json({ audio_url: audioUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 500 });
  }
}
