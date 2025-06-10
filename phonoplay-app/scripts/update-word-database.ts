import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define types
type PhonemeWord = {
  word: string;
  phonemes: string[];
  image_path?: string;
};

type WordCategory = {
  [category: string]: {
    [subcategory: string]: string[];
  };
};

// Function to read JSON files
const readJsonFile = (filePath: string) => {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
};

// Function to process words from JSON files
const processWords = async () => {
  console.log('Starting word database update process...');
  
  // Read JSON files
  // These files contain categorized word lists
  console.log('Reading word JSON files...');
  const phonemeWords = readJsonFile('./phoneme_words.json') as WordCategory;
  const digraphsBlends = readJsonFile('./digraphs_blends_words.json') as WordCategory;
  
  // Log the categories found for debugging and educational purposes
  console.log('Phoneme categories found:');
  Object.keys(phonemeWords).forEach(category => {
    const subcategories = Object.keys(phonemeWords[category]);
    console.log(` - ${category} (${subcategories.length} subcategories)`);
  });
  
  console.log('Phonics categories found:');
  Object.keys(digraphsBlends).forEach(category => {
    const subcategories = Object.keys(digraphsBlends[category]);
    console.log(` - ${category} (${subcategories.length} subcategories)`);
  });
  
  if (!phonemeWords || !digraphsBlends) {
    console.error('Failed to read word files');
    return;
  }

  // Get existing words from database
  const { data: existingWords, error } = await supabase
    .from('words')
    .select('id, word, phonemes, image_path');

  if (error) {
    console.error('Error fetching existing words:', error);
    return;
  }

  // Create a map of existing words for quick lookup
  const existingWordsMap = new Map();
  existingWords?.forEach(word => {
    existingWordsMap.set(word.word.toLowerCase(), word);
  });

  console.log(`Found ${existingWordsMap.size} existing words in the database`);

  // Process and update existing words, and collect new words
  const wordsToUpdate: any[] = [];
  const wordsToInsert: any[] = [];

  // Helper function to process each category
  const processCategory = (categoryData: WordCategory, categoryPrefix: string) => {
    Object.entries(categoryData).forEach(([category, subcategories]) => {
      const mainCategory = `${categoryPrefix}_${category}`;
      
      Object.entries(subcategories).forEach(([subcategory, words]) => {
        words.forEach(word => {
          const normalizedWord = word.toLowerCase().trim();
          
          if (existingWordsMap.has(normalizedWord)) {
            // Word exists, update category and subcategory
            const existingWord = existingWordsMap.get(normalizedWord);
            wordsToUpdate.push({
              id: existingWord.id,
              category: mainCategory,
              subcategory: subcategory
            });
          } else {
            // New word, prepare for insertion
            // For proper phoneme extraction, we should use the phoneme data from the JSON files
            // or a dedicated phoneme dictionary. This is a placeholder.
            // In a production app, you would want a more sophisticated phoneme mapping
            let phonemes: string[] = [];
            
            // Check if this is a digraph/blend word - we'll need to extract phonemes differently
            if (mainCategory.startsWith('phonics_')) {
              // For digraphs/blends, use the subcategory as one of the phonemes
              phonemes = [subcategory.toUpperCase()];
              
              // Add remaining sounds (simplified)
              const remainingChars = normalizedWord.replace(subcategory, '');
              remainingChars.split('').forEach(char => {
                if (char.match(/[a-z]/i)) {
                  phonemes.push(char.toUpperCase());
                }
              });
            } else {
              // For regular phoneme words, we'll use a simple mapping
              // This is still simplified and would need refinement
              const vowels = ['a', 'e', 'i', 'o', 'u'];
              const chars = normalizedWord.split('');
              
              for (let i = 0; i < chars.length; i++) {
                const char = chars[i];
                const nextChar = chars[i + 1];
                
                // Skip characters we've already processed
                if (char === '') continue;
                
                // Check for common digraphs
                if (nextChar && ['h', 'r', 'l', 'w'].includes(nextChar) && !vowels.includes(char)) {
                  // Potential consonant blend/digraph
                  phonemes.push((char + nextChar).toUpperCase());
                  chars[i + 1] = ''; // Mark as processed
                } else if (vowels.includes(char)) {
                  // Vowel sound
                  phonemes.push(char.toUpperCase());
                } else if (char.match(/[a-z]/i)) {
                  // Other consonant
                  phonemes.push(char.toUpperCase());
                }
              }
            }
            
            wordsToInsert.push({
              word: normalizedWord,
              phonemes: phonemes,
              category: mainCategory,
              subcategory: subcategory,
              image_path: `words/${normalizedWord}.webp` // Default image path pattern
            });
          }
        });
      });
    });
  };

  // Process phoneme words
  processCategory(phonemeWords, 'phoneme');
  
  // Process digraphs and blends
  processCategory(digraphsBlends, 'phonics');

  console.log(`Updating ${wordsToUpdate.length} existing words`);
  console.log(`Inserting ${wordsToInsert.length} new words`);

  // Update existing words in batches
  const BATCH_SIZE = 50;
  for (let i = 0; i < wordsToUpdate.length; i += BATCH_SIZE) {
    const batch = wordsToUpdate.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('words').upsert(batch);
    if (error) {
      console.error('Error updating words batch:', error);
    } else {
      console.log(`Updated batch ${i / BATCH_SIZE + 1}/${Math.ceil(wordsToUpdate.length / BATCH_SIZE)}`);
    }
  }

  // Insert new words in batches
  for (let i = 0; i < wordsToInsert.length; i += BATCH_SIZE) {
    const batch = wordsToInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('words').insert(batch);
    if (error) {
      console.error('Error inserting words batch:', error);
    } else {
      console.log(`Inserted batch ${i / BATCH_SIZE + 1}/${Math.ceil(wordsToInsert.length / BATCH_SIZE)}`);
    }
  }

  console.log('Word database update completed!');
};

// Run the process
processWords()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
