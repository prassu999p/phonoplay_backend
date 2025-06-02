"use client"; // Required for useEffect and useRouter

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import createClientBrowser from '@/utils/supabase/client'; // Your Supabase client

// Optional: A loading state component or simple text
function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading...</p>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const supabase = createClientBrowser();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        // Decide how to handle error, maybe redirect to an error page or login
        router.replace('/login'); // Fallback to login on error
        return;
      }

      if (session) {
        // User is logged in
        console.log("User is logged in, redirecting to /practice/select");
        router.replace('/practice/select');
      } else {
        // User is not logged in
        console.log("User is not logged in, redirecting to /login");
        router.replace('/login');
      }
    };

    checkUserAndRedirect();
  }, [router, supabase]); // Dependencies for useEffect

  // Render a loading state or null while checking auth and redirecting
  // This prevents the default page content from flashing
  return <Loading />;
  // Or return null; if you don't want any loading indicator
}
