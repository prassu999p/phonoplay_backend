import { createClient } from '@supabase/supabase-js';

// Store a single instance of the client to prevent multiple instances
let supabaseClientInstance: ReturnType<typeof createClient> | null = null;

/**
 * Creates a Supabase client for use in the browser.
 * Uses a singleton pattern to prevent multiple client instances.
 * 
 * @returns A Supabase client configured with browser settings
 */
export const createClientBrowser = () => {
  // Return the existing instance if we already have one
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }
  
  // Make sure we have the environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Creating new Supabase client with URL:', 
    supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // Create the client with browser-specific settings
  supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      // Disable automated retries to better diagnose issues
      fetch: undefined
    }
  });
  
  return supabaseClientInstance;
};

// Default export for easier imports
export default createClientBrowser;
