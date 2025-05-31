import React from 'react';
import { wordImageMap } from '@/data/wordImageMap';

interface WordImageProps {
  word: string;
  className?: string;
}

export const WordImage: React.FC<WordImageProps> = ({ word, className = '' }) => {
  const imageUrl = word ? wordImageMap[word.trim().toLowerCase() as keyof typeof wordImageMap] : undefined;

  if (!imageUrl) {
    console.warn(`No image found for word: ${word}`);
    return null;
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
  };

  return (
    <img
      src={imageUrl}
      alt={word}
      className={`word-image ${className}`}
      onError={handleError}
    />
  );
};

export default WordImage;
