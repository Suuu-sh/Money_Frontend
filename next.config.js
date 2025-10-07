/**
 * Next.js configuration
 * - `output: 'export'` enables static export for nginx hosting
 * - `rewrites` proxies frontend API calls to the Go backend during local dev
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
