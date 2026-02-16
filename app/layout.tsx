import type { Metadata, Viewport } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import BottomNav from '@/components/BottomNav'
import InstallPrompt from '@/components/InstallPrompt'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'Bergen Bibliotek',
  description: 'Din digitale portal til Bergen Bibliotek — lån, arrangementer og digitalt innhold',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Biblioteket',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Bergen Bibliotek',
    title: 'Bergen Bibliotek',
    description: 'Lån bøker, delta på arrangementer og utforsk digitalt innhold',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f3d54',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <head>
        {/* PWA — Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/images/icon-192.png" />

        {/* PWA — Splash screens for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <BottomNav />
          <InstallPrompt />
          <ServiceWorkerRegistration />
        </AuthProvider>
      </body>
    </html>
  )
}
