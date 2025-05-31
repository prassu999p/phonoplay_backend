// src/components/words/WordCard.tsx
'use client';

import WordImage from '@/lib/word-images/WordImageComponent';

interface WordCardProps {
  word: string;
  phonemes: string[];
  image_path?: string | null;
  className?: string;
}

export function WordCard({ word, phonemes, image_path, className = '' }: WordCardProps) {
  return (
    <div className={`border rounded-lg p-4 shadow-sm bg-white ${className}`}>
      <h2 className="text-xl font-bold text-center mb-2 capitalize">{word}</h2>
      <div className="h-40 flex items-center justify-center mb-2">
        <WordImage 
          word={word} 
          image_path={image_path}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      {phonemes && phonemes.length > 0 && (
        <div className="text-center text-gray-600">
          {phonemes.join(' • ')}
        </div>
      )}
    </div>
  );
}