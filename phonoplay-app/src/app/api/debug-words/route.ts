import { NextRequest, NextResponse } from 'next/server';
import { createClientBrowser } from '@/utils/supabase/client';

// API endpoint to debug the word fetching logic
export async function GET(request: NextRequest) {
  // Extract query parameters
  const searchParams = request.nextUrl.searchParams;
  const phonemes = searchParams.get('phonemes')?.split(',') || [];
  const categories = searchParams.get('categories')?.split(',').filter(c => c !== '') || null;
  const subcategories = searchParams.get('subcategories')?.split(',').filter(c => c !== '') || null;
  
  // Create Supabase client
  const supabase = createClientBrowser();
  
  // Log the parameters
  console.log('Debug API - Input parameters:', { phonemes, categories, subcategories });
  
  // Test with both lowercase and uppercase to debug case sensitivity
  const phonemesLowercase = phonemes.map(p => p.toLowerCase());
  const phonemesUppercase = phonemes.map(p => p.toUpperCase());
  
  // Debug parameters for RPC call
  const rpcParamsLower = {
    p_limit: 20,
    p_phonemes: phonemesLowercase,
    p_categories: categories,
    p_subcategories: subcategories
  };
  
  const rpcParamsUpper = {
    p_limit: 20,
    p_phonemes: phonemesUppercase,
    p_categories: categories,
    p_subcategories: subcategories
  };
  
  try {
    // Call the RPC function with lowercase phonemes
    const { data: dataLower, error: errorLower } = await supabase.rpc(
      'select_practice_words',
      rpcParamsLower
    );
    
    // Call the RPC function with uppercase phonemes
    const { data: dataUpper, error: errorUpper } = await supabase.rpc(
      'select_practice_words',
      rpcParamsUpper
    );
    
    // Get all words for comparison
    const { data: allWords } = await supabase.from('words').select('*').limit(100);
    
    // Let's directly examine the first few words to understand their structure
    const { data: firstFewWords } = await supabase
      .from('words')
      .select('*')
      .limit(5);
    
    // Try a direct query to get words with phoneme 'k'
    const { data: directKQuery } = await supabase
      .from('words')
      .select('*')
      .contains('phonemes', ['k'])
      .limit(10);
    
    // Return all debug information
    return NextResponse.json({
      success: true,
      debug: {
        inputParams: { phonemes, categories, subcategories },
        rpcParamsLower,
        rpcParamsUpper,
        resultsLower: {
          data: dataLower || [],
          count: Array.isArray(dataLower) ? dataLower.length : 0,
          error: errorLower
        },
        resultsUpper: {
          data: dataUpper || [],
          count: Array.isArray(dataUpper) ? dataUpper.length : 0,
          error: errorUpper
        },
        sampleWords: Array.isArray(allWords) ? allWords.slice(0, 5) : [],
        totalWordsInDB: Array.isArray(allWords) ? allWords.length : 0,
        directKQuery: directKQuery || [],
        firstFewWords: firstFewWords || []
      }
    });
  } catch (error) {
    console.error('Error in debug API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
