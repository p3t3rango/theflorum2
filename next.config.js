/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['oaidalleapiprodscus.blob.core.windows.net'],
  }
}

module.exports = nextConfig 