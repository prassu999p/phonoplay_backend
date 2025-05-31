// Fetch words from the LLM-driven API route based on selected phonemes
export interface LLMWordEntry {
  id: number;
  word: string;
  phonemes: string[];
  image_path: string | null;
}

export async function getWordsByPhonemesLLM(phonemes: string[]): Promise<LLMWordEntry[]> {
  const res = await fetch('/api/llm-word-selection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phonemes }),
  });
  if (!res.ok) throw new Error('Failed to fetch words from LLM API');
  const data = await res.json();
  return data.words;
}
