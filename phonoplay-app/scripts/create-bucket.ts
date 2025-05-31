import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BUCKET_NAME = 'word-images';

async function createBucket() {
  console.log('🚀 Creating Supabase Storage bucket...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Anon Key not found in environment variables');
    process.exit(1);
  }
  
  console.log('🔗 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    if (buckets?.some(b => b.name === BUCKET_NAME)) {
      console.log(`✅ Bucket '${BUCKET_NAME}' already exists`);
      return;
    }
    
    // Create the bucket
    console.log(`🔄 Creating bucket '${BUCKET_NAME}'...`);
    const { data: bucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    });
    
    if (createError) {
      console.error(`❌ Error creating bucket:`, createError);
      
      if (createError.message.includes('row-level security')) {
        console.log('\n⚠️  Row-level security is preventing bucket creation.');
        console.log('Please run the SQL script in the Supabase SQL Editor to set up the necessary policies.');
      }
      
      return;
    }
    
    console.log(`✅ Successfully created bucket '${BUCKET_NAME}':`, bucket);
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  }
}

createBucket().catch(console.error);
