/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Turbopack config - tom for å bruke standard innstillinger
  turbopack: {},
  
  // ✅ Bildeoptimalisering
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  
  // ⚠️ FJERNET webpack config - ikke nødvendig med Turbopack
  // Turbopack håndterer caching automatisk og mer effektivt
  
  // ✅ Service worker headers
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ]
  },
}

module.exports = nextConfig