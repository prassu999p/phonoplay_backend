"use client";
// Word Selection Screen for Practice
// This page allows users to select phonemes and start a practice session with matching words.

import React, { useState, useEffect } from 'react';

import { getEmojiForExample } from './emojiMap';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Helper: List of all phonemes ---
// You should have a utility that exports allPhonemes (string[])
// and getWordsByPhonemes(phonemes: string[]): Word[]

// --- PhonemeChip Component ---
// This component represents a selectable phoneme chip/button with icon, label, and checkbox

interface PhonemeItem {
  id: number; // Assuming 'id' is a field, adjust if not
  phoneme: string;
  group: string;
  example: string;
  // Add any other fields that are part of your phoneme records
}

function PhonemeChip({ phoneme, selected, onClick, example }: {
  phoneme: string;
  selected: boolean;
  onClick: (phoneme: string) => void;
  example?: string;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-6 py-4 rounded-lg border shadow-sm font-bold text-lg transition-all duration-150 w-full
        ${selected ? 'bg-pink-100 border-pink-400 ring-2 ring-pink-300' : 'bg-white border-gray-200 hover:bg-gray-100'}
        cursor-pointer`}
      style={{ minWidth: 120, color: '#222' }}
      onClick={() => onClick(phoneme)}
      aria-pressed={selected}
    >
      <span className="text-2xl mr-2">{getEmojiForExample(example || '')}</span>
      <span className="text-xl font-bold" style={{ color: '#222' }}>{phoneme}</span>
    </button>
  );
}

// --- Main Page Component ---
export default function WordSelectionPage() {
  // State for selected phonemes
  // State for selected phonemes
  const [selectedPhonemes, setSelectedPhonemes] = useState<string[]>([]);

  // State for loading and error (only used when starting practice)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for fetched phonemes
  const [groupedPhonemes, setGroupedPhonemes] = useState<Record<string, PhonemeItem[]> | null>(null);
  const [fetchingPhonemes, setFetchingPhonemes] = useState(true);

  // Fetch phonemes from Supabase and group by 'group'
  useEffect(() => {
    async function fetchPhonemes() {
      setFetchingPhonemes(true);
      const { data, error } = await supabase.from('phonemes').select('*');
      if (error) {
        setError('Failed to load phonemes.');
        setFetchingPhonemes(false);
        return;
      }
      // Group by 'group' field
      const grouped: Record<string, PhonemeItem[]> = {};
      (data as PhonemeItem[]).forEach((row: PhonemeItem) => {
        if (!grouped[row.group]) grouped[row.group] = [];
        grouped[row.group].push(row);
      });
      setGroupedPhonemes(grouped);
      setFetchingPhonemes(false);
    }
    fetchPhonemes();
  }, []);

  // Toggle phoneme selection
  function togglePhoneme(phoneme: string) { // Removed category and subcategory parameters
    setSelectedPhonemes((prev) =>
      prev.includes(phoneme)
        ? prev.filter((p) => p !== phoneme)
        : [...prev, phoneme]
    );
  }

  // Handler for starting practice: fetch words from LLM, save, and navigate
  // Uses Next.js router for navigation (App Router best practice)
  const router = useRouter();

  // Helper: categorize selected phonemes
  function splitSelections() {
    // You may want to adjust these lists to match your DB and UI
    const CONSONANTS = [
      'B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','X','Y','Z',
      'CH','SH','TH','ST','PL','CL','DR','SW' // Add all your consonant blends/digraphs
    ];
    const SHORT_VOWELS = ['A','E','I','O','U'];
    const LONG_VOWELS = ['AY', 'EE', 'AI', 'OA', 'YU']; // Updated to match new DB identifiers

    const consonantPhonemes = selectedPhonemes.filter(p => CONSONANTS.includes(p));
    const shortVowelPhonemes = selectedPhonemes.filter(p => SHORT_VOWELS.includes(p));
    const longVowelPhonemes = selectedPhonemes.filter(p => LONG_VOWELS.includes(p));
    return { consonantPhonemes, shortVowelPhonemes, longVowelPhonemes };
  }

  async function startPractice() {
    if (selectedPhonemes.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const { consonantPhonemes, shortVowelPhonemes, longVowelPhonemes } = splitSelections();
      const params = new URLSearchParams();
      // Always include consonants
      consonantPhonemes.forEach(p => params.append('phonemes', p));
      // Always include short vowels (if selected)
      shortVowelPhonemes.forEach(p => params.append('phonemes', p));
      // Only include long vowels if selected
      if (longVowelPhonemes.length > 0) {
        longVowelPhonemes.forEach(p => params.append('phonemes', p));
      }
      // Categories/subcategories filtering removed as state variables were removed
      router.push(`/practice/session?${params.toString()}`);
    } catch (e: unknown) {
      let errorMessage = 'Failed to start practice.';
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full flex justify-between items-center px-6 pt-4">
        <div />
        <div className="flex items-center gap-2">
          {/* Placeholder for avatar/user menu */}
          <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">?</span>
        </div>
      </div>
      <div className="flex flex-col items-center mt-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <span className="text-3xl">🎤</span>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Welcome to PhonicsPlay! <span className="align-middle">🎉</span></h1>
        <h2 className="text-lg text-pink-600 font-medium text-center mb-6">Choose your sounds to practice</h2>
        <div className="bg-white rounded-xl shadow-lg px-16 py-10 flex flex-col items-center w-full max-w-6xl">
          {fetchingPhonemes && <div className="mb-4 text-center text-gray-500">Loading phonemes...</div>}
          {/* Render grouped phonemes by section */}
          {groupedPhonemes && Object.entries(groupedPhonemes).map(([group, phonemeList]) => (
            <div key={group} className="mb-6 w-full">
              <h3 className="text-lg font-semibold mb-2 capitalize text-gray-700">{group.replace('_', ' ')}</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {phonemeList.map((item: PhonemeItem) => (
                  <PhonemeChip
                    key={item.phoneme}
                    phoneme={item.phoneme}
                    selected={selectedPhonemes.includes(item.phoneme)}
                    onClick={() => togglePhoneme(item.phoneme)} // Removed category/subcategory args
                    example={item.example}
                  />
                ))}
              </div>
            </div>
          ))}
          {/* Show loading or error only when starting practice */}
          <div className="mb-3 text-center min-h-[28px]">
            {loading && (
              <span className="inline-block bg-yellow-100 px-3 py-1 rounded-full text-yellow-700">Loading words...</span>
            )}
            {error && (
              <span className="inline-block bg-red-100 px-3 py-1 rounded-full text-red-700">{error}</span>
            )}
          </div>
          <button
            className="w-full py-3 rounded-lg bg-pink-600 text-white font-bold text-lg shadow-md mt-2 disabled:bg-pink-300 transition-colors"
            disabled={loading || selectedPhonemes.length === 0}
            onClick={startPractice}
          >
            ▶ Start Practice!
          </button>
        </div>
      </div>
    </div>
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
