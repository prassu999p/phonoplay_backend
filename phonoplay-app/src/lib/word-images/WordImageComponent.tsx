import React from 'react';
import Image from 'next/image';
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

  // onError is handled differently with next/image, or can use onLoadingComplete
  // For simplicity, removing custom handleError for now.

  return (
    <Image
      src={imageUrl}
      alt={word}
      className={`word-image ${className}`}
      width={100} // Default width, adjust as needed
      height={100} // Default height, adjust as needed
      // onError could be implemented via onLoadingComplete or by checking if src is valid before rendering
    />
  );
};

export default WordImage;
