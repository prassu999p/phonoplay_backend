import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Set up Supabase client (server-side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Use OpenRouter API for LLM
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Set this in your environment variables
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export async function POST(req: NextRequest) {
  // Parse both JSON body and search params for model name
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const body = await req.json();
  const { phonemes, model: bodyModel } = body;
  const queryModel = searchParams.get('model');
  // Fetch default model from environment variable, allow override
  const envModel = process.env.OPENROUTER_MODEL;
  const model = bodyModel || queryModel || envModel || 'openai/gpt-3.5-turbo';

  if (!phonemes || !Array.isArray(phonemes) || phonemes.length === 0) {
    return NextResponse.json({ error: 'Invalid phonemes' }, { status: 400 });
  }

  // 1. Use OpenRouter LLM to suggest words
  // IMPORTANT: Instruct the LLM to output ONLY a comma-separated list, no numbers or extra text, for reliable parsing.
  const prompt = `List 10 simple, child-friendly English words that use these phonemes: ${phonemes.join(', ')}. Output ONLY a comma-separated list of the words, with no numbering, no dashes, no explanations, and no extra text.`;

  // Log the model and prompt for debugging
  console.log('[LLM] Using model:', model);
  console.log('[LLM] Prompt:', prompt);

  let llmWords: string[] = [];
  let text = '';
  try {
    // Pass the chosen model to OpenRouter
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: "You are a helpful assistant for a children's phonics app." },
          { role: 'user', content: prompt },
        ],
        max_tokens: 60,
        temperature: 0.5,
      }),
    });
    const data = await response.json();
    text = data.choices?.[0]?.message?.content || '';
    // Log the raw LLM response
    console.log('[LLM] Raw response text:', text);
    llmWords = text.split(',').map((w: string) => w.trim().toLowerCase()).filter(Boolean);
    // Log the parsed word array
    console.log('[LLM] Parsed words:', llmWords);
  } catch (error) {
    console.error('[LLM] Error fetching from OpenRouter:', error);
    return NextResponse.json({ error: 'Failed to fetch from LLM', details: String(error) }, { status: 500 });
  }

  // 2. Filter words using Supabase (only those in your table)
  let validWords = [];
  if (llmWords.length > 0) {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .in('word', llmWords);
    // Log the Supabase query and results
    console.log('[Supabase] Querying for words:', llmWords);
    console.log('[Supabase] Query result:', data);
    if (error) {
      console.error('[Supabase] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch from Supabase', details: error.message }, { status: 500 });
    }
    validWords = data || [];
  }

  return NextResponse.json({ words: validWords });
}
