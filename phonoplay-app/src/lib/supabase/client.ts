import { createClient } from '@supabase/supabase-js';

import type { SupabaseClient } from '@supabase/supabase-js';

// Use a true singleton pattern to prevent multiple client instances
let supabaseInstance: SupabaseClient | null = null;

export const createClientBrowser = () => {
  console.log('Creating new Supabase client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15) + '...');
  
  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // Return singleton instance if it exists
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  // Create new instance if it doesn't exist
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  
  return supabaseInstance;
};

// For server components or for backward compatibility
export const supabase = typeof window !== 'undefined' ? createClientBrowser() : null;

// Helper function to get the current user
export const getCurrentUser = async () => {
  const client = typeof window !== 'undefined' ? createClientBrowser() : null;
  if (!client) throw new Error('Supabase client not available');
  
  const { data: { user } } = await client.auth.getUser();
  return user;
};

// Helper function to sign out
export const signOut = async () => {
  const client = typeof window !== 'undefined' ? createClientBrowser() : null;
  if (!client) throw new Error('Supabase client not available');
  
  const { error } = await client.auth.signOut();
  if (error) console.error('Error signing out:', error.message);
  return !error;
};
