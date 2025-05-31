import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BUCKET_NAME = 'phonic-images';

async function testBucket() {
  console.log('🚀 Testing Supabase Storage with phonic-images bucket...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Anon Key not found in environment variables');
    process.exit(1);
  }
  
  console.log('🔗 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. List all buckets
    console.log('\n1. Listing all buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
    } else {
      console.log('📦 Available buckets:', buckets?.map(b => b.name).join(', ') || 'None');
    }
    
    // 2. Try to upload a test file directly
    console.log(`\n2. Testing file upload to '${BUCKET_NAME}'...`);
    const testFilePath = join(__dirname, '../public/img/test.jpg');
    
    try {
      console.log('📂 Reading test file...');
      const fileContent = readFileSync(testFilePath);
      
      // Create a Blob from the file content
      const blob = new Blob([fileContent], { type: 'image/jpeg' });
      
      console.log('🔄 Uploading file...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload('test-upload.jpg', blob, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) {
        console.error('❌ Upload failed:', uploadError);
      } else {
        console.log('✅ Upload successful:', uploadData);
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl('test-upload.jpg');
        
        console.log('🔗 Public URL:', urlData.publicUrl);
      }
      
    } catch (fileError) {
      console.error('❌ Error with file operation:', fileError);
    }
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  }
}

testBucket().catch(console.error);
