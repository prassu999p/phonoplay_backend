import { NextRequest, NextResponse } from 'next/server';

// SECURITY: In production, always store API keys in environment variables, not in code!
const SMALLEST_AI_API_KEY = process.env.SMALLEST_AI_API_KEY;
const SMALLEST_AI_TTS_URL = 'https://waves-api.smallest.ai/api/v1/lightning-v2/get_speech';

/**
 * POST /api/tts
 * Body: { text: string, voice?: string }
 * Returns: { audio_url: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { text, voice_id = 'en_us_0' } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid text' }, { status: 400 });
    }

    // Prepare payload according to Smallest AI docs
    const payload = {
      text,
      voice_id,
      add_wav_header: false,
      sample_rate: 24000,
      speed: 1,
      consistency: 0.5,
      similarity: 0,
      enhancement: 1,
      language: 'en',
    };

    // Call Smallest AI TTS API
    const response = await fetch(SMALLEST_AI_TTS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SMALLEST_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'TTS API error', details: errorText }, { status: 500 });
    }

    // Adjust this according to the actual API response
    const data = await response.json();
    if (!data.audio_url && !data.audioContent) {
      return NextResponse.json({ error: 'No audio_url or audioContent in TTS response', details: data }, { status: 500 });
    }

    // Return the audio URL or content to the frontend
    return NextResponse.json({ audio_url: data.audio_url || data.audioContent });
  } catch (error) {
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 500 });
  }
}
