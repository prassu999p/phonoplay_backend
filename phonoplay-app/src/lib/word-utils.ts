// Utility functions and data for phoneme-based word selection

// Example phoneme list (customize as needed)
export const allPhonemes: string[] = [
  'a', 'e', 'i', 'o', 'u', 'p', 'b', 't', 'd', 'k', 'g', 'f', 'v', 's', 'z', 'm', 'n', 'l', 'r'
];

// Word interface matching the database schema
export interface Word {
  id: number;
  word: string;
  phonemes: string[];
  category?: string;
  subcategory?: string;
  image_path?: string;
}

// Example words matching the database schema format
export const allWords: Word[] = [
  { id: 1, word: 'cat', phonemes: ['k', 'a', 't'], category: 'animals', subcategory: 'pets', image_path: '/images/cat.jpg' },
  { id: 2, word: 'dog', phonemes: ['d', 'o', 'g'], category: 'animals', subcategory: 'pets', image_path: '/images/dog.jpg' },
  { id: 3, word: 'sun', phonemes: ['s', 'u', 'n'], category: 'nature', subcategory: 'sky', image_path: '/images/sun.jpg' },
  { id: 4, word: 'red', phonemes: ['r', 'e', 'd'], category: 'colors', subcategory: 'primary', image_path: '/images/red.jpg' },
  { id: 5, word: 'milk', phonemes: ['m', 'i', 'l', 'k'], category: 'food', subcategory: 'dairy', image_path: '/images/milk.jpg' }
];

// Returns all words containing ALL selected phonemes
export function getWordsByPhonemes(selected: string[]): Word[] {
  if (selected.length === 0) return allWords;
  return allWords.filter(word =>
    selected.every(p => word.phonemes.includes(p))
  );
}
