// Utility functions and data for phoneme-based word selection

// Example phoneme list (customize as needed)
export const allPhonemes: string[] = [
  'a', 'e', 'i', 'o', 'u', 'p', 'b', 't', 'd', 'k', 'g', 'f', 'v', 's', 'z', 'm', 'n', 'l', 'r'
];

// Example word list (replace with your real data)
export interface Word {
  text: string;
  phonemes: string[];
}

export const allWords: Word[] = [
  { text: 'cat', phonemes: ['k', 'a', 't'] },
  { text: 'dog', phonemes: ['d', 'o', 'g'] },
  { text: 'sun', phonemes: ['s', 'u', 'n'] },
  { text: 'red', phonemes: ['r', 'e', 'd'] },
  { text: 'milk', phonemes: ['m', 'i', 'l', 'k'] },
  // Add more words as needed
];

// Returns all words containing ALL selected phonemes
export function getWordsByPhonemes(selected: string[]): Word[] {
  if (selected.length === 0) return allWords;
  return allWords.filter(word =>
    selected.every(p => word.phonemes.includes(p))
  );
}
