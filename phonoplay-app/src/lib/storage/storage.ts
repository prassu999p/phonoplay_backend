import { createClient } from '@supabase/supabase-js';
import { WordEntry } from '@/types/word';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Make sure this matches exactly with the bucket name in Supabase
const BUCKET_NAME = 'phonic-images';

// Debug function to list all buckets
async function listAllBuckets() {
  console.log('🔍 Listing all buckets...');
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('❌ Error listing buckets:', error);
    return [];
  }
  
  console.log('📦 Available buckets:', buckets?.map(b => b.name).join(', ') || 'None');
  return buckets || [];
}

/**
 * Uploads a file to Supabase Storage
 */
export const uploadFile = async (filePath: string, file: File): Promise<{ data: any; error: any }> => {
  console.log(`📤 Attempting to upload ${filePath} to bucket '${BUCKET_NAME}'`);
  
  try {
    // List all buckets for debugging
    console.log('🔍 Checking available buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return { data: null, error: listError };
    }
    
    console.log('📦 Available buckets:', buckets?.map((b: any) => b.name).join(', ') || 'None');
    
    if (!buckets?.some((b: any) => b.name === BUCKET_NAME)) {
      const errorMsg = `Bucket '${BUCKET_NAME}' does not exist. Available buckets: ${buckets?.map((b: any) => b.name).join(', ') || 'None'}`;
      console.error(`❌ ${errorMsg}`);
      return { data: null, error: new Error(errorMsg) };
    }
    
    console.log(`🔄 Uploading file to bucket '${BUCKET_NAME}'...`);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error(`❌ Error uploading ${filePath}:`, error);
      
      // Try to get bucket info for more details
      try {
        const { data: bucketInfo, error: bucketError } = await supabase.storage
          .getBucket(BUCKET_NAME);
          
        if (bucketError) {
          console.error(`❌ Could not get bucket info for '${BUCKET_NAME}':`, bucketError);
        } else {
          console.log(`ℹ️ Bucket info for '${BUCKET_NAME}':`, bucketInfo);
        }
      } catch (bucketInfoError) {
        console.error('❌ Error getting bucket info:', bucketInfoError);
      }
      
      return { data: null, error };
    }
    
    console.log(`✅ Successfully uploaded ${filePath}`);
    
    // Get public URL for the uploaded file
    try {
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
      
      console.log(`🔗 Public URL: ${urlData.publicUrl}`);
      
      return { 
        data: { 
          ...data, 
          publicUrl: urlData.publicUrl 
        }, 
        error: null 
      };
    } catch (urlError) {
      console.error('❌ Error getting public URL:', urlError);
      return { data, error: null }; // Still return success even if we couldn't get the URL
    }
    
  } catch (error) {
    console.error(`❌ Exception while uploading ${filePath}:`, error);
    return { data: null, error };
  }
};

/**
 * Gets the public URL for a file in storage
 */
export const getPublicUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
  return data.publicUrl;
};

interface UploadResult {
  success: boolean;
  message: string;
  successful?: Array<{
    word: string;
    success: boolean;
    fileName: string;
    publicUrl: string;
  }>;
  failed?: Array<{
    word: string;
    success: boolean;
    error: string;
  }>;
}

/**
 * Uploads all word images to Supabase Storage
 * @param words Array of word entries with image paths
 */
export const uploadWordImages = async (words: WordEntry[]): Promise<UploadResult> => {
  try {
    // First, check if the bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      throw bucketError;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.error(`Bucket '${BUCKET_NAME}' does not exist`);
      return { success: false, message: `Bucket '${BUCKET_NAME}' does not exist` };
    }
    
    // Upload each image
    const uploadPromises = words.map(async (word) => {
      try {
        // Skip if no image path
        if (!word.image_path) return null;
        
        // Extract filename from path
        const fileName = word.image_path.split('/').pop();
        if (!fileName) return null;
        
        // Check if file exists in public folder
        const response = await fetch(`/img/${fileName}`);
        if (!response.ok) {
          console.warn(`Image not found: ${fileName}`);
          return null;
        }
        
        // Convert to blob
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type });
        
        // Upload to Supabase Storage
        const { error } = await uploadFile(fileName, file);
        
        if (error) {
          console.error(`Error uploading ${fileName}:`, error);
          return { 
            word: word.word, 
            success: false, 
            error: error.message,
            fileName: ''
          };
        }
        
        // Get the public URL
        const publicUrl = getPublicUrl(fileName);
        
        return { 
          word: word.word, 
          success: true, 
          fileName,
          publicUrl,
          error: ''
        };
      } catch (error) {
        console.error(`Error processing ${word.word}:`, error);
        return { 
          word: word.word, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          fileName: ''
        };
      }
    });
    
    // Wait for all uploads to complete and filter out nulls
    const results = (await Promise.all(uploadPromises)).filter(Boolean) as Array<{
      word: string;
      success: boolean;
      fileName: string;
      publicUrl?: string;
      error: string;
    }>;
    
    const successful = results.filter(r => r.success).map(({ word, fileName, publicUrl }) => ({
      word,
      success: true,
      fileName,
      publicUrl: publicUrl || ''
    }));
    
    const failed = results.filter(r => !r.success).map(({ word, error }) => ({
      word,
      success: false,
      error
    }));
    
    return {
      success: failed.length === 0,
      message: `Uploaded ${successful.length} images, ${failed.length} failed`,
      successful,
      failed
    };
    
  } catch (error) {
    console.error('Error in uploadWordImages:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Lists all files in the word-images bucket
 */
export const listWordImages = async () => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list();
    
  if (error) {
    console.error('Error listing word images:', error);
    throw error;
  }
  
  return data;
};
