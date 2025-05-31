import React from 'react';
import { wordImageMap } from '@/data/wordImageMap';

interface WordImageProps {
  word: string;
  image_path?: string | null;
  className?: string;
}

export const WordImage: React.FC<WordImageProps> = ({ word, image_path, className = '' }) => {
  // If image_path is provided (from Supabase), use it directly
  let imageUrl: string | undefined = undefined;
  if (image_path) {
    // Build the full Supabase public URL
    imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/phonic-images/${image_path}`;
  } else {
    // Fallback: use local mapping for legacy support
    const cleanWord = word.trim().toLowerCase().replace(/[^a-z'-]/g, '');
    console.log('Word for image lookup:', JSON.stringify(word), '=>', cleanWord);
    imageUrl = cleanWord ? wordImageMap[cleanWord as keyof typeof wordImageMap] : undefined;
  }

  if (!imageUrl) {
    console.warn(`No image found for word:`, word, image_path);
    return <div className={`w-20 h-20 flex items-center justify-center bg-gray-200 rounded text-gray-400 ${className}`}>No image</div>;
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
