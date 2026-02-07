import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Felles Formidlingsløsning',
  description: 'Norges felles bibliotekløsning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  )
}
