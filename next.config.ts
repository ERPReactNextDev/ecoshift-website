import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' }
    ]
  },
  // R3F/Three.js needs to be transpiled
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing']
}

export default nextConfig
