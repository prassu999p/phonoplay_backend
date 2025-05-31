import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BUCKET_NAME = 'phonic-images';
const IMAGE_DIR = join(__dirname, '../public/img');

interface UploadResult {
  originalPath: string;
  fileName: string;
  publicUrl: string;
  success: boolean;
  error?: string;
}

async function uploadAllImages() {
  console.log('🚀 Starting image upload to Supabase Storage...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Anon Key not found in environment variables');
    process.exit(1);
  }
  
  console.log('🔗 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. Get list of all image files in the img directory
    console.log(`\n📂 Scanning for images in ${IMAGE_DIR}...`);
    const files = readdirSync(IMAGE_DIR).filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    
    if (files.length === 0) {
      console.log('❌ No image files found in the directory');
      return;
    }
    
    console.log(`✅ Found ${files.length} image files to upload`);
    
    // 2. Upload each file
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const filePath = join(IMAGE_DIR, file);
      const fileName = basename(file);
      
      try {
        console.log(`\n🔄 Uploading ${fileName}...`);
        
        // Read the file
        const fileContent = readFileSync(filePath);
        const blob = new Blob([fileContent], { type: `image/${file.split('.').pop()}` });
        
        // Upload to Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(`words/${fileName}`, blob, {
            cacheControl: '3600',
            upsert: true,
          });
        
        if (uploadError) {
          console.error(`❌ Error uploading ${fileName}:`, uploadError.message);
          results.push({
            originalPath: filePath,
            fileName,
            publicUrl: '',
            success: false,
            error: uploadError.message
          });
          continue;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`words/${fileName}`);
        
        console.log(`✅ Uploaded: ${fileName}`);
        console.log(`   Public URL: ${urlData.publicUrl}`);
        
        results.push({
          originalPath: filePath,
          fileName,
          publicUrl: urlData.publicUrl,
          success: true
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error processing ${fileName}:`, errorMessage);
        results.push({
          originalPath: filePath,
          fileName,
          publicUrl: '',
          success: false,
          error: errorMessage
        });
      }
    }
    
    // 3. Generate a report
    console.log('\n📊 Upload Summary:');
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ ${successful.length} files uploaded successfully`);
    if (failed.length > 0) {
      console.log(`❌ ${failed.length} files failed to upload`);
      console.log('\nFailed files:');
      failed.forEach((file, index) => {
        console.log(`${index + 1}. ${file.fileName}: ${file.error}`);
      });
    }
    
    // 4. Save the results to a JSON file
    const resultFile = join(__dirname, '../public/upload-results.json');
    require('fs').writeFileSync(
      resultFile,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        bucket: BUCKET_NAME,
        successful: successful.length,
        failed: failed.length,
        files: results
      }, null, 2)
    );
    
    console.log(`\n📝 Results saved to: ${resultFile}`);
    
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  }
}

// Run the upload
uploadAllImages().catch(console.error);
