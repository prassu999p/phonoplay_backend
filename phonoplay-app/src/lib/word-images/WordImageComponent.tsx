import React from 'react';
import Image from 'next/image'; // Import next/image
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

  // Robust error handling: track image load error in state
  const [imgError, setImgError] = React.useState(false);
  React.useEffect(() => {
    setImgError(false); // Reset error when image_path changes
  }, [image_path]);

  const handleError = () => setImgError(true);

  if (!imageUrl || imgError) {
    // No image or failed to load, render nothing (no placeholder)
    return null;
  }

  return (
    <Image
    <Image
      src={imageUrl}
      alt={word}
      className={`word-image ${className}`}
      onError={handleError}
      width={100} // Placeholder width - adjust as needed
      height={100} // Placeholder height - adjust as needed
      // If you want the image to be responsive and scale with the container,
      // you might need a different approach, e.g., style={{ objectFit: 'contain' }}
      // or using the `fill` prop with a sized parent container.
    />
  );
};

export default WordImage;
