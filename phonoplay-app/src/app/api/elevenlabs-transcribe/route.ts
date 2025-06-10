import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Config for Next.js App Router
export const config = {
  runtime: 'nodejs',
};

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'scribe_v1';

export async function POST(req: NextRequest) {
  try {
    // Get form data from request
    const formData = await req.formData();
    const audioFile = formData.get('file') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Get optional parameters with defaults
    const language_code = formData.get('language_code')?.toString() || 'eng';
    const tag_audio_events = formData.get('tag_audio_events')?.toString() || 'true';
    const timestamps_granularity = formData.get('timestamps_granularity')?.toString() || 'word';
    const model_id = formData.get('model_id')?.toString() || ELEVENLABS_MODEL_ID;
    
    // Create a new FormData for the ElevenLabs API
    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append('model_id', model_id);
    elevenLabsFormData.append('file', audioFile);
    elevenLabsFormData.append('language_code', language_code);
    elevenLabsFormData.append('tag_audio_events', tag_audio_events);
    elevenLabsFormData.append('timestamps_granularity', timestamps_granularity);
    
    // Send to ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: elevenLabsFormData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('ElevenLabs API error:', data);
      return NextResponse.json({ error: data.error || 'Transcription failed' }, { status: 500 });
    }
    
    // Return the full ElevenLabs response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in elevenlabs-transcribe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
