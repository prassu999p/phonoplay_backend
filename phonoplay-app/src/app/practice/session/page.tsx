"use client";
// Practice Session Screen
// This page displays words one at a time for practice, with navigation and (future) recording.

import React, { useState } from 'react';
import { allWords, Word } from '@/lib/word-utils';
import { WordCard } from '@/components/words/WordCard';

export default function PracticeSessionPage() {
  // State to track which word we're on
  const [currentIdx, setCurrentIdx] = useState(0);
  // State for the session word list
  const [sessionWords, setSessionWords] = useState<Word[] | null>(null);
  // State for error
  const [error, setError] = useState<string | null>(null);

  // On mount, load the word list from localStorage
  React.useEffect(() => {
    try {
      const data = window.localStorage.getItem('phonoplay-session-words');
      if (data) {
        setSessionWords(JSON.parse(data));
      } else {
        setError('No practice session found. Please start a new session.');
      }
    } catch (e) {
      setError('Failed to load session words.');
    }
  }, []);

  // If error, show message
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  // If not loaded yet, show loading
  if (!sessionWords) {
    return <div className="p-6 text-center">Loading session...</div>;
  }

  const total = sessionWords.length;
  const currentWord = sessionWords[currentIdx];
  // Defensive: fallback if LLMWordEntry fields are missing
  const displayWord = currentWord.word || currentWord.text || '';
  const displayPhonemes = currentWord.phonemes || [];

  // Handlers for navigation
  function goNext() {
    setCurrentIdx((idx) => Math.min(idx + 1, total - 1));
  }
  function goPrev() {
    setCurrentIdx((idx) => Math.max(idx - 1, 0));
  }

  // Stub for recording (to implement later)
  function handleRecord() {
    alert('Recording feature coming soon!');
  }

  // If finished all words, show session complete
  if (currentIdx >= total) {
    return <div className="p-6 text-center text-green-700 font-bold">Session Complete! 🎉</div>;
  }

  if (!currentWord) {
    return <div className="p-6 text-center">No words available for practice.</div>;
  }

  return (
    <main className="max-w-xl mx-auto p-4 flex flex-col items-center">
      <div className="mb-2 text-gray-500 text-sm">
        Word {currentIdx + 1} of {total}
      </div>
      {/* Use correct fields from LLMWordEntry for WordCard */}
      <WordCard word={displayWord} phonemes={displayPhonemes} />
      <div className="flex gap-2 my-4">
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={goPrev}
          disabled={currentIdx === 0}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:bg-blue-300"
          onClick={goNext}
          disabled={currentIdx === total - 1}
        >
          Next
        </button>
      </div>
      <button
        className="px-6 py-3 rounded bg-green-600 text-white font-bold mt-2"
        onClick={handleRecord}
      >
        Record
      </button>
      <div className="mt-4 text-gray-400">
        {/* Placeholder for feedback */}
        Feedback will appear here after you record.
      </div>
    </main>
  );
}

// ---
// Explanations:
// - Uses React state to track current word index
// - Uses WordCard to display the word and image
// - Navigation buttons let you move through the list
// - Record button is a stub for now
// - Feedback area is a placeholder
//
// Next: connect to word selection, implement audio recording, and add feedback logic
