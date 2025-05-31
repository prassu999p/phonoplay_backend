import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function listBuckets() {
  console.log('🔍 Listing all Supabase Storage buckets...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Anon Key not found in environment variables');
    process.exit(1);
  }
  
  console.log('🔗 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // List all buckets
    console.log('\nFetching buckets...');
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listing buckets:', error);
      return;
    }
    
    if (!buckets || buckets.length === 0) {
      console.log('ℹ️ No buckets found in your Supabase project.');
      return;
    }
    
    console.log('\n📦 Available buckets:');
    buckets.forEach((bucket, index) => {
      console.log(`\nBucket #${index + 1}:`);
      console.log(`  Name: ${bucket.name}`);
      console.log(`  ID: ${bucket.id}`);
      console.log(`  Public: ${bucket.public ? '✅' : '❌'}`);
      console.log(`  Created: ${bucket.created_at}`);
      console.log(`  Updated: ${bucket.updated_at}`);
    });
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  }
}

listBuckets().catch(console.error);
