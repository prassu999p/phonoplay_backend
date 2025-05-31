// scripts/generate-word-image-mapping.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BUCKET_NAME = 'phonic-images';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function generateWordImageMapping() {
  console.log('🔍 Generating word-image mapping...');
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase URL or Anon Key');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // List all files in the words folder
    console.log('📂 Listing files in bucket...');
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('words');

    if (error) {
      console.error('❌ Error listing files:', error);
      process.exit(1);
    }

    if (!files || files.length === 0) {
      console.log('ℹ️ No files found in the bucket');
      return;
    }

    console.log(`✅ Found ${files.length} image files`);

    // Create mapping of word to image URL
    const wordImageMap: Record<string, string> = {};

    files.forEach(file => {
      if (file.name) {
        // Remove file extension to get the word
        const word = file.name.replace(/\.[^/.]+$/, '').toLowerCase();
        const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/words/${file.name}`;
        wordImageMap[word] = imageUrl;
      }
    });

    // Create the data directory if it doesn't exist
    const dataDir = join(__dirname, '../src/data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    // Save the mapping to a JSON file
    const outputPath = join(dataDir, 'wordImageMap.json');
    writeFileSync(outputPath, JSON.stringify(wordImageMap, null, 2));
    console.log(`📝 Word-image mapping saved to: ${outputPath}`);

    // Create a TypeScript version for type safety
    const tsContent = `// This file is auto-generated. Do not edit manually.

export const wordImageMap = ${JSON.stringify(wordImageMap, null, 2)} as const;

export type WordImageMap = typeof wordImageMap;
export type Word = keyof WordImageMap;
`;

    const tsOutputPath = join(dataDir, 'wordImageMap.ts');
    writeFileSync(tsOutputPath, tsContent);
    console.log(`📝 TypeScript mapping saved to: ${tsOutputPath}`);

    console.log('✨ Done!');
    
  } catch (error) {
    console.error('❌ An error occurred:', error);
    process.exit(1);
  }
}

generateWordImageMapping();