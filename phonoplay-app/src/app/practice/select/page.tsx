"use client";
// Word Selection Screen for Practice
// This page allows users to select phonemes and start a practice session with matching words.

import React, { useState } from 'react';
import { allPhonemes, getWordsByPhonemes } from '@/lib/word-utils';

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

  // Get words that match selected phonemes
  const matchingWords = getWordsByPhonemes(selectedPhonemes);

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
        <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-gray-700">
          {matchingWords.length} word{matchingWords.length !== 1 ? 's' : ''} match your selection
        </span>
      </div>
      <button
        className="w-full py-3 rounded bg-blue-600 text-white font-semibold text-lg disabled:bg-blue-300 transition-colors"
        disabled={matchingWords.length === 0}
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
