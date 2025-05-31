import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync, createReadStream } from 'fs';
import { join } from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BUCKET_NAME = 'word-images';

async function testStorage() {
  console.log('🚀 Testing Supabase Storage...');
  
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
    
    // 2. Get specific bucket info
    console.log(`\n2. Getting info for bucket '${BUCKET_NAME}'...`);
    const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (bucketError) {
      console.error(`❌ Error getting bucket '${BUCKET_NAME}':`, bucketError);
    } else {
      console.log(`✅ Bucket '${BUCKET_NAME}' info:`, bucketInfo);
    }
    
    // 3. Try to upload a test file using the REST API directly
    console.log(`\n3. Testing file upload to '${BUCKET_NAME}'...`);
    const testFilePath = join(__dirname, '../public/img/test.jpg');
    
    try {
      console.log('📂 Reading test file...');
      const fileStream = createReadStream(testFilePath);
      
      // Create form data
      const form = new FormData();
      form.append('file', fileStream, 'test-upload.jpg');
      
      console.log('🔄 Uploading file...');
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/test-upload.jpg`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          ...form.getHeaders(),
        },
        body: form,
      });
      
      const uploadData = await response.json();
      
      if (!response.ok) {
        console.error('❌ Upload failed:', uploadData);
      } else {
        console.log('✅ Upload successful:', uploadData);
        
        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/test-upload.jpg`;
        console.log('🔗 Public URL:', publicUrl);
      }
      
    } catch (fileError) {
      console.error('❌ Error reading test file:', fileError);
    }
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  }
}

testStorage().catch(console.error);
