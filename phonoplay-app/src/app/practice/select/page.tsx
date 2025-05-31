"use client";
// Word Selection Screen for Practice
// This page allows users to select phonemes and start a practice session with matching words.

import React, { useState } from 'react';
import { allPhonemes } from '@/lib/word-utils';
import { getWordsByPhonemesLLM, LLMWordEntry } from '@/lib/llmWordSelector';

// --- Helper: List of all phonemes ---
// You should have a utility that exports allPhonemes (string[])
// and getWordsByPhonemes(phonemes: string[]): Word[]

// --- PhonemeChip Component ---
// This component represents a selectable phoneme chip/button
function PhonemeChip({ phoneme, selected, onClick }: {
  phoneme: string;
  selected: boolean;
  onClick: (phoneme: string) => void;
}) {
  return (
    <button
      type="button"
      className={`px-3 py-2 rounded-full border m-1 text-sm font-medium transition-colors duration-150 ${selected ? 'bg-blue-500 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'}`}
      onClick={() => onClick(phoneme)}
      aria-pressed={selected}
    >
      {phoneme}
    </button>
  );
}

// --- Main Page Component ---
export default function WordSelectionPage() {
  // State for selected phonemes
  const [selectedPhonemes, setSelectedPhonemes] = useState<string[]>([]);

  // State for LLM-matched words
  const [matchingWords, setMatchingWords] = useState<LLMWordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch words from LLM API whenever phoneme selection changes
  React.useEffect(() => {
    if (selectedPhonemes.length === 0) {
      setMatchingWords([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    getWordsByPhonemesLLM(selectedPhonemes)
      .then(setMatchingWords)
      .catch((e) => setError(e.message || 'Unknown error'))
      .finally(() => setLoading(false));
  }, [selectedPhonemes]);

  // Toggle phoneme selection
  function togglePhoneme(phoneme: string) {
    setSelectedPhonemes((prev) =>
      prev.includes(phoneme)
        ? prev.filter((p) => p !== phoneme)
        : [...prev, phoneme]
    );
  }

  // Handler for starting practice (for now, just alert)
  function startPractice() {
    if (matchingWords.length === 0) return;
    // In a real app, you would navigate to the practice page and pass the selected words
    alert(`Starting practice with ${matchingWords.length} words!`);
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Select Phonemes to Practice</h1>
      <div className="flex flex-wrap justify-center mb-6">
        {allPhonemes.map((phoneme) => (
          <PhonemeChip
            key={phoneme}
            phoneme={phoneme}
            selected={selectedPhonemes.includes(phoneme)}
            onClick={togglePhoneme}
          />
        ))}
      </div>
      <div className="mb-4 text-center">
        {loading ? (
          <span className="inline-block bg-yellow-100 px-3 py-1 rounded-full text-yellow-700">Loading words...</span>
        ) : error ? (
          <span className="inline-block bg-red-100 px-3 py-1 rounded-full text-red-700">{error}</span>
        ) : (
          <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-gray-700">
            {matchingWords.length} word{matchingWords.length !== 1 ? 's' : ''} match your selection
          </span>
        )}
      </div>

      {/* Show the actual words returned from the API */}
      {!loading && !error && matchingWords.length > 0 && (
        <div className="mb-6">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingWords.map((word) => (
              <li key={word.id} className="border rounded p-3 flex items-center gap-3 bg-gray-50">
                {/* Display image if available */}
                {word.image_path ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/phonic-images/${word.image_path}`}
                    alt={word.word}
                    className="w-12 h-12 object-contain bg-white rounded"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded text-gray-400">No image</div>
                )}
                <div>
                  <div className="font-bold text-lg">{word.word}</div>
                  <div className="text-xs text-gray-600">Phonemes: {word.phonemes.join(' - ')}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        className="w-full py-3 rounded bg-blue-600 text-white font-semibold text-lg disabled:bg-blue-300 transition-colors"
        disabled={loading || matchingWords.length === 0}
        onClick={startPractice}
      >
        Start Practice
      </button>
    </main>
  );
}

// ---
// Explanations:
// - allPhonemes: an array of all phoneme strings in your app.
// - getWordsByPhonemes: a function that returns all words matching the selected phonemes.
// - PhonemeChip: a reusable component for each selectable phoneme.
// - The main page manages state and displays the grid, count, and button.
//
// Next steps: hook up navigation to the actual practice screen and pass the word list.
