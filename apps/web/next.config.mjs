import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root directory
// Always load .env in development and build, Vercel will provide env vars in production
config({ path: resolve(process.cwd(), '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
  },
}

export default nextConfig
