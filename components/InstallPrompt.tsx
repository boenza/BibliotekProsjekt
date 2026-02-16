'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Sjekk om appen allerede er installert
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Sjekk om brukeren har avvist banneret nylig
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedAt = parseInt(dismissed)
      // Vis ikke igjen på 7 dager
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return
    }

    // iOS-deteksjon
    const ua = navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIsIOS(isIOSDevice)

    if (isIOSDevice) {
      // Vis iOS-guide etter 3 sekunder
      const timer = setTimeout(() => setShowBanner(true), 3000)
      return () => clearTimeout(timer)
    }

    // Android/Desktop: lytt etter beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Vis banneret etter 2 sekunder
      setTimeout(() => setShowBanner(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowBanner(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setShowIOSGuide(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (!showBanner) return null

  // iOS — vis guide for å legge til hjemskjerm
  if (isIOS) {
    return (
      <>
        <div
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm animate-slide-up"
        >
          <div
            className="rounded-2xl p-4 shadow-xl"
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 12px 40px rgba(10,42,60,0.15)',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--ocean, #0f3d54), var(--fjord, #1a7a9e))' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold" style={{ color: 'var(--ink, #1a2b3c)' }}>
                  Installer Bergen Bibliotek
                </h3>
                {!showIOSGuide ? (
                  <>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted, #8a9bae)' }}>
                      Legg til appen på hjemskjermen for raskere tilgang
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => setShowIOSGuide(true)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                        style={{ background: 'var(--ocean, #0f3d54)' }}
                      >
                        Vis meg hvordan
                      </button>
                      <button onClick={handleDismiss} className="px-3 py-2 rounded-lg text-xs font-medium"
                        style={{ color: 'var(--ink-muted, #8a9bae)' }}>
                        Ikke nå
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-2 space-y-2">
                    {[
                      { nr: '1', text: 'Trykk på', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ocean)" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>, suffix: '(del-knappen)' },
                      { nr: '2', text: 'Bla ned og velg «Legg til på Hjem-skjerm»', icon: null, suffix: '' },
                      { nr: '3', text: 'Trykk «Legg til»', icon: null, suffix: '' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                          style={{ background: 'var(--ocean, #0f3d54)' }}>{step.nr}</div>
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--ink-soft, #5a6b7c)' }}>
                          {step.text} {step.icon} {step.suffix}
                        </span>
                      </div>
                    ))}
                    <button onClick={handleDismiss} className="text-xs font-medium mt-1"
                      style={{ color: 'var(--ocean, #0f3d54)' }}>
                      Skjønt!
                    </button>
                  </div>
                )}
              </div>
              <button onClick={handleDismiss} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-gray-100 flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up { animation: slide-up 0.4s ease-out; }
        `}</style>
      </>
    )
  }

  // Android/Desktop — direkte installering
  return (
    <>
      <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm animate-slide-up">
        <div
          className="rounded-2xl p-4 shadow-xl"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 12px 40px rgba(10,42,60,0.15)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--ocean, #0f3d54), var(--fjord, #1a7a9e))' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold" style={{ color: 'var(--ink, #1a2b3c)' }}>
                Installer Bergen Bibliotek
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted, #8a9bae)' }}>
                Få rask tilgang til lån, arrangementer og digitalt innhold
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--ocean, #0f3d54)' }}
                >
                  Installer app
                </button>
                <button onClick={handleDismiss} className="px-3 py-2 rounded-lg text-xs font-medium"
                  style={{ color: 'var(--ink-muted, #8a9bae)' }}>
                  Ikke nå
                </button>
              </div>
            </div>
            <button onClick={handleDismiss} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-gray-100 flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
      `}</style>
    </>
  )
}
