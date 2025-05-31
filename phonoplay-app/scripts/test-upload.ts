import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { uploadWordImages } from '../src/lib/storage/storage';

// Load environment variables
dotenv.config({ path: '../.env.local' });

// Debug function to check Supabase connection
async function checkSupabaseConnection() {
  console.log('🔍 Checking Supabase connection...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Anon Key not found in environment variables');
    return false;
  }
  
  console.log('✅ Environment variables loaded');
  console.log(`🔗 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 10)}...`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test authentication
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Supabase auth test failed:', authError);
    } else {
      console.log('✅ Supabase auth test passed');
    }
    
    // Test storage
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.error('❌ Supabase storage test failed:', storageError);
      return false;
    }
    
    console.log('✅ Supabase storage test passed');
    console.log('📦 Available buckets:', buckets?.map(b => b.name).join(', ') || 'None');
    
    return true;
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error);
    return false;
  }
}

// Load test word entries from the test JSON file
const loadTestWordEntries = (): any[] => {
  try {
    const data = readFileSync(join(__dirname, '../test-word-entries.json'), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading test word entries:', error);
    process.exit(1);
  }
};

// Main function to run the test upload
const main = async () => {
  console.log('🚀 Starting test image upload to Supabase Storage...');
  
  // First, check Supabase connection
  const isConnected = await checkSupabaseConnection();
  if (!isConnected) {
    console.error('❌ Cannot proceed without a valid Supabase connection');
    process.exit(1);
  }
  
  // Load test word entries
  const words = loadTestWordEntries();
  console.log(`📚 Loaded ${words.length} test word entries`);
  
  // Check if the test image exists
  const testImagePath = join(__dirname, '../public/img/test.jpg');
  try {
    const exists = require('fs').existsSync(testImagePath);
    if (!exists) {
      console.error(`❌ Test image not found at: ${testImagePath}`);
      console.log('Please make sure the test image exists at public/img/test.jpg');
      process.exit(1);
    }
    console.log(`✅ Test image found at: ${testImagePath}`);
  } catch (error) {
    console.error('❌ Error checking test image:', error);
    process.exit(1);
  }
  
  // Upload images
  console.log('🔄 Uploading test image...');
  try {
    const result = await uploadWordImages(words);
    
    // Log results
    console.log('\n📊 Test Upload Results:');
    console.log(`✅ Successfully uploaded: ${result.successful?.length || 0} images`);
    
    if (result.successful && result.successful.length > 0) {
      console.log('\n📝 Public URLs:');
      result.successful.forEach((item: any) => {
        console.log(`- ${item.word}: ${item.publicUrl}`);
      });
    }
    
    if (result.failed && result.failed.length > 0) {
      console.log(`\n❌ Failed to upload: ${result.failed.length} images`);
      console.log('\nFailed uploads:');
      result.failed.forEach((item: any) => {
        console.log(`- ${item.word}: ${item.error}`);
      });
    }
    
    console.log('\n✨ Test upload completed!');
  } catch (error) {
    console.error('❌ Error during upload:', error);
    process.exit(1);
  }
};

// Run the test
main().catch(console.error);
