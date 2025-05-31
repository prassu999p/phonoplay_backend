import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BUCKET_NAME = 'word-images';

async function verifyAndCreateBucket() {
  console.log('🔍 Verifying Supabase Storage bucket...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Anon Key not found in environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    console.log('📦 Available buckets:', buckets?.map(b => b.name).join(', ') || 'None');
    
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (bucketExists) {
      console.log(`✅ Bucket '${BUCKET_NAME}' exists`);
      
      // Try to upload a test file
      console.log('\n🔄 Testing file upload...');
      const testContent = 'test-content';
      const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload('test-upload.txt', testFile);
      
      if (uploadError) {
        console.error('❌ Test upload failed:', uploadError);
        
        // Try to update bucket policies using SQL
        console.log('\n🔄 Attempting to update bucket policies...');
        const { data: policyData, error: policyError } = await supabase.rpc('create_storage_policies', { bucket_name: BUCKET_NAME });
        
        if (policyError) {
          console.error('❌ Failed to update bucket policies:', policyError);
        } else {
          console.log('✅ Successfully updated bucket policies');
        }
      } else {
        console.log('✅ Test upload successful:', uploadData);
        
        // Clean up test file
        await supabase.storage
          .from(BUCKET_NAME)
          .remove(['test-upload.txt']);
      }
      
      return;
    }
    
    // Create the bucket if it doesn't exist
    console.log(`\n🔄 Creating bucket '${BUCKET_NAME}'...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5242880, // 5MB
    });
    
    if (createError) {
      console.error(`❌ Error creating bucket '${BUCKET_NAME}':`, createError);
      return;
    }
    
    console.log(`✅ Successfully created bucket '${BUCKET_NAME}'`);
    
    // Create storage policies
    console.log('🔄 Creating storage policies...');
    const { data: policyData, error: policyError } = await supabase.rpc('create_storage_policies', { bucket_name: BUCKET_NAME });
    
    if (policyError) {
      console.error('❌ Failed to create storage policies:', policyError);
    } else {
      console.log('✅ Successfully created storage policies');
    }
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  }
}

verifyAndCreateBucket().catch(console.error);
