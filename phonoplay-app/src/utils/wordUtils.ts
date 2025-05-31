import { WordEntry } from '@/types/word';
import wordEntries from '@/../wordEntries.json';

/**
 * Get all available phonemes from the word list
 */
export const getAllPhonemes = (): string[] => {
  const phonemeSet = new Set<string>();
  
  wordEntries.forEach((entry: WordEntry) => {
    entry.phonemes.forEach(phoneme => {
      phonemeSet.add(phoneme);
    });
  });
  
  return Array.from(phonemeSet).sort();
};

/**
 * Filter words based on selected phonemes
 */
export const filterWordsByPhonemes = (phonemes: string[]): WordEntry[] => {
  if (phonemes.length === 0) return [];
  
  return wordEntries.filter((entry: WordEntry) => {
    return entry.phonemes.some(phoneme => phonemes.includes(phoneme));
  });
};

/**
 * Get a random word from the word list
 */
export const getRandomWord = (words: WordEntry[]): WordEntry => {
  if (words.length === 0) {
    throw new Error('No words available');
  }
  
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
};

/**
 * Get the next word based on the current session
 * This is a placeholder for more complex AI logic
 */
export const getNextWord = (session: {
  selectedPhonemes: string[];
  recentPerformance: boolean[];
  previousWords: string[];
}): WordEntry => {
  const { selectedPhonemes, recentPerformance, previousWords } = session;
  
  // Get all words that match the selected phonemes
  const matchingWords = filterWordsByPhonemes(selectedPhonemes);
  
  // Filter out words that were recently used
  const availableWords = matchingWords.filter(
    word => !previousWords.includes(word.word)
  );
  
  // If no words are available, return a random word from all matching words
  if (availableWords.length === 0) {
    return getRandomWord(matchingWords);
  }
  
  // Simple logic: if recent performance is poor, choose an easier word
  const recentSuccessRate = recentPerformance.length > 0
    ? recentPerformance.filter(Boolean).length / recentPerformance.length
    : 1;
    
  if (recentSuccessRate < 0.5) {
    // Choose a shorter word if struggling
    const sortedByLength = [...availableWords].sort(
      (a, b) => a.word.length - b.word.length
    );
    return sortedByLength[0];
  }
  
  // Otherwise, return a random word from available words
  return getRandomWord(availableWords);
};
