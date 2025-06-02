/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Default, good to keep
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mkuquzgcvktcfhgagoec.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/phonic-images/**',
      },
      // Add other hostnames if needed, for example, if NEXT_PUBLIC_SUPABASE_URL points to a different one
    ],
  },
};

module.exports = nextConfig;
