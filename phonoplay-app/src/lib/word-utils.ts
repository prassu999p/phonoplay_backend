// Utility functions and data for phoneme-based word selection

// Example phoneme list (customize as needed)
export const allPhonemes: string[] = [
  'a', 'e', 'i', 'o', 'u', 'p', 'b', 't', 'd', 'k', 'g', 'f', 'v', 's', 'z', 'm', 'n', 'l', 'r'
];

// Example word list (replace with your real data)
export interface Word {
  id?: number;
  word: string;  // Changed from 'text' to 'word' to match actual data
  phonemes: string[];
  image_path?: string;  // Added to match actual data
}

export const allWords: Word[] = [
  { id: 1, word: 'cat', phonemes: ['k', 'a', 't'], image_path: 'words/cat.webp' },
  { id: 2, word: 'dog', phonemes: ['d', 'o', 'g'], image_path: 'words/dog.webp' },
  { id: 3, word: 'sun', phonemes: ['s', 'u', 'n'], image_path: 'words/sun.webp' },
  { id: 4, word: 'red', phonemes: ['r', 'e', 'd'], image_path: 'words/red.webp' },
  { id: 5, word: 'milk', phonemes: ['m', 'i', 'l', 'k'], image_path: 'words/milk.webp' },
  // Add more words as needed
];

// Returns all words containing ALL selected phonemes
export function getWordsByPhonemes(selected: string[]): Word[] {
  if (selected.length === 0) return allWords;
  return allWords.filter(word =>
    selected.every(p => word.phonemes.includes(p))
  );
}
