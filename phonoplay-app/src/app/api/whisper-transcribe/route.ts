import { NextRequest, NextResponse } from 'next/server';

// POST /api/whisper-transcribe
// Accepts: multipart/form-data with an 'audio' file (webm/wav/mp3)
// Returns: { text: string } or { error }
export async function POST(req: NextRequest) {
  try {
    // Parse the incoming form-data
    const formData = await req.formData();
    const audio = formData.get('audio');

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json({ error: 'No audio file provided.' }, { status: 400 });
    }

    // Prepare form data for OpenAI Whisper
    const whisperForm = new FormData();
    whisperForm.append('file', audio, 'recording.webm');
    whisperForm.append('model', 'whisper-1');
    whisperForm.append('response_format', 'json');
    whisperForm.append('language', 'en');

    // Call OpenAI Whisper API
    const openaiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: whisperForm as any, // TS workaround
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return NextResponse.json({ error: 'OpenAI Whisper error', details: err }, { status: 500 });
    }

    const data = await openaiRes.json();
    return NextResponse.json(data); // { text: "transcribed text" }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
