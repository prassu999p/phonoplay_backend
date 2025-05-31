import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BUCKET_NAME = 'word-images';

async function ensureBucket() {
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
    
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (bucketExists) {
      console.log(`✅ Bucket '${BUCKET_NAME}' already exists`);
      return;
    }
    
    // Create the bucket
    console.log(`🔄 Creating bucket '${BUCKET_NAME}'...`);
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
    
    // Set bucket policies
    console.log('🔄 Setting bucket policies...');
    await supabase.rpc('create_storage_policies', { bucket_name: BUCKET_NAME });
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  }
}

ensureBucket().catch(console.error);
