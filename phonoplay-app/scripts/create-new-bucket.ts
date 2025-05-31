import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const NEW_BUCKET_NAME = 'phonoplay-images';

async function createNewBucket() {
  console.log('🚀 Creating a new Supabase Storage bucket...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Anon Key not found in environment variables');
    process.exit(1);
  }
  
  console.log('🔗 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. List all buckets first
    console.log('\n1. Listing all buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
    } else {
      console.log('📦 Available buckets:', buckets?.map(b => b.name).join(', ') || 'None');
    }
    
    // 2. Create a new bucket
    console.log(`\n2. Creating new bucket '${NEW_BUCKET_NAME}'...`);
    const { data: bucket, error: createError } = await supabase.storage.createBucket(NEW_BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    });
    
    if (createError) {
      console.error(`❌ Error creating bucket '${NEW_BUCKET_NAME}':`, createError);
      
      // Try to get more info about the error
      if (createError.message.includes('row-level security')) {
        console.log('\n⚠️  Row-level security is preventing bucket creation.');
        console.log('Please check the RLS policies in the Supabase dashboard.');
      }
      
      return;
    }
    
    console.log(`✅ Successfully created bucket '${NEW_BUCKET_NAME}':`, bucket);
    
    // 3. List buckets again to confirm
    console.log('\n3. Listing buckets after creation...');
    const { data: updatedBuckets } = await supabase.storage.listBuckets();
    console.log('📦 Updated bucket list:', updatedBuckets?.map(b => b.name).join(', ') || 'None');
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  }
}

createNewBucket().catch(console.error);
