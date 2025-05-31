import { readFileSync } from 'fs';
import { join } from 'path';
import { uploadWordImages } from '../src/lib/storage/storage';

// Load word entries from the JSON file
const loadWordEntries = (): any[] => {
  try {
    const data = readFileSync(join(__dirname, '../../wordEntries.json'), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading word entries:', error);
    process.exit(1);
  }
};

// Main function to run the upload
const main = async () => {
  console.log('🚀 Starting image upload to Supabase Storage...');
  
  // Load word entries
  const words = loadWordEntries();
  console.log(`📚 Loaded ${words.length} word entries`);
  
  // Upload images
  console.log('🔄 Uploading images...');
  const result = await uploadWordImages(words);
  
  // Log results
  console.log('\n📊 Upload Results:');
  console.log(`✅ Successfully uploaded: ${result.successful?.length || 0} images`);
  
  if (result.failed && result.failed.length > 0) {
    console.log(`❌ Failed to upload: ${result.failed.length} images`);
    console.log('\nFailed uploads:');
    result.failed.forEach((item: any) => {
      console.log(`- ${item.word}: ${item.error}`);
    });
  }
  
  console.log('\n✨ Upload process completed!');
};

// Run the script
main().catch(console.error);
