export interface WordEntry {
  word: string;
  phonemes: string[];
  image_path: string;
}

export interface PracticeSession {
  selectedPhonemes: string[];
  currentWordIndex: number;
  recentPerformance: boolean[];
  words: WordEntry[];
}
