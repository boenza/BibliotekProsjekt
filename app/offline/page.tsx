'use client'

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--white-warm, #fdfcfa)' }}>
      <div className="max-w-sm text-center">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(15,61,84,0.06)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--ocean, #0f3d54)" strokeWidth="1.5">
            <path d="M1 1l22 22" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink, #1a2b3c)' }}>
          Ingen nettilkobling
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--ink-muted, #8a9bae)' }}>
          Det ser ut som du er frakoblet. Sjekk nettforbindelsen din og prøv igjen.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
          style={{ background: 'var(--ocean, #0f3d54)' }}
        >
          Prøv igjen
        </button>
        <p className="text-xs mt-6" style={{ color: 'var(--ink-muted, #8a9bae)' }}>
          Sider du har besøkt tidligere kan fortsatt være tilgjengelige
        </p>
      </div>
    </div>
  )
}
