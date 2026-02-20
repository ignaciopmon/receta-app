/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com', // Permite imágenes de Vercel Blob
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Permite imágenes de Supabase Storage
      }
    ],
  },
}

export default nextConfig