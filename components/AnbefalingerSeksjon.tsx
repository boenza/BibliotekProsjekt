'use client'

import { useState, useEffect, useRef } from 'react'

interface Anbefaling {
  id: string
  tittel: string
  forfatter: string | null
  beskrivelse: string
  bildeUrl: string | null
  publisert: boolean
}

export default function AnbefalingerSeksjon() {
  const [anbefalinger, setAnbefalinger] = useState<Anbefaling[]>([])
  const [selectedAnbefaling, setSelectedAnbefaling] = useState<Anbefaling | null>(null)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAnbefalinger = async () => {
      try {
        const response = await fetch('/api/anbefalinger')
        const data = await response.json()
        if (Array.isArray(data)) {
          setAnbefalinger(data.filter((a: Anbefaling) => a.publisert).slice(0, 4))
        }
      } catch (error) {
        console.error('Error fetching anbefalinger:', error)
      }
    }
    fetchAnbefalinger()
  }, [])

  // Scroll reveal with fallback
  useEffect(() => {
    const el = sectionRef.current
    if (!el) { setVisible(true); return }
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1, rootMargin: '50px' }
    )
    observer.observe(el)
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => { observer.disconnect(); clearTimeout(timer) }
  }, [])

  if (anbefalinger.length === 0) return null

  // Color accents for cards
  const accents = [
    { bg: 'linear-gradient(135deg, #0f3d54 0%, #1a7a9e 100%)', text: '#d4e4ed' },
    { bg: 'linear-gradient(135deg, #c75b3f 0%, #e07a5f 100%)', text: '#fde8e0' },
    { bg: 'linear-gradient(135deg, #2d6b4e 0%, #3d8b65 100%)', text: '#d4eddf' },
    { bg: 'linear-gradient(135deg, #5b4a8a 0%, #7c6bb0 100%)', text: '#e4ddf5' },
  ]

  return (
    <>
      <section ref={sectionRef} className="py-16 md:py-20" style={{ background: 'var(--white-warm, #fdfcfa)' }}>
        <div className="container-custom">
          {/* Section header */}
          <div className={`mb-10 animate-fade-up`}>
            <div className="section-divider mb-4" />
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2
                  className="text-3xl md:text-4xl font-bold tracking-tight"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--ink, #1a1f2e)' }}
                >
                  Våre ansatte anbefaler
                </h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--ink-muted, #6b7280)' }}>
                  Håndplukkede favoritter fra bibliotekets medarbeidere
                </p>
              </div>
              <a
                href="/anbefalinger"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium link-underline pb-0.5 flex-shrink-0"
                style={{ color: 'var(--ocean, #0f3d54)' }}
              >
                Se alle anbefalinger
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-7-7 7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {anbefalinger.map((anbefaling, i) => {
              const accent = accents[i % accents.length]
              return (
                <button
                  key={anbefaling.id}
                  onClick={() => setSelectedAnbefaling(anbefaling)}
                  className={`group text-left rounded-2xl overflow-hidden card-lift animate-fade-up`}
                  style={{
                    animationDelay: `${0.15 + i * 0.1}s`,
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Image / Placeholder */}
                  <div className="relative h-44 overflow-hidden">
                    {anbefaling.bildeUrl ? (
                      <img
                        src={anbefaling.bildeUrl}
                        alt={anbefaling.tittel}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: accent.bg }}
                      >
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={accent.text} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
                        </svg>
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to top, rgba(15, 61, 84, 0.4) 0%, transparent 50%)' }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 pb-5">
                    <span
                      className="badge badge-ocean mb-2.5"
                      style={{ fontSize: '11px' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      Anbefaling
                    </span>
                    <h3
                      className="font-bold leading-snug mb-1 transition-colors duration-200 group-hover:text-[#0f3d54]"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--ink, #1a1f2e)' }}
                    >
                      {anbefaling.tittel}
                    </h3>
                    {anbefaling.forfatter && (
                      <p className="text-xs mb-2" style={{ color: 'var(--ink-muted, #6b7280)' }}>
                        {anbefaling.forfatter}
                      </p>
                    )}
                    <p
                      className="text-sm leading-relaxed line-clamp-2"
                      style={{ color: 'var(--ink-soft, #3e4450)' }}
                    >
                      {anbefaling.beskrivelse}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 mt-3 text-xs font-medium transition-all duration-200 group-hover:gap-2"
                      style={{ color: 'var(--ocean, #0f3d54)' }}
                    >
                      Les mer
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14m-7-7 7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Detail modal */}
      {selectedAnbefaling && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(10, 42, 60, 0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedAnbefaling(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-scale-in"
            style={{ boxShadow: '0 24px 80px rgba(10, 42, 60, 0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            {selectedAnbefaling.bildeUrl && (
              <div className="h-56 md:h-64 overflow-hidden rounded-t-2xl">
                <img
                  src={selectedAnbefaling.bildeUrl}
                  alt={selectedAnbefaling.tittel}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-8">
              <span className="badge badge-ocean mb-3">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Bibliotekets anbefaling
              </span>
              <h2
                className="text-2xl md:text-3xl font-bold tracking-tight mb-1"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
              >
                {selectedAnbefaling.tittel}
              </h2>
              {selectedAnbefaling.forfatter && (
                <p className="text-sm mb-5" style={{ color: 'var(--ink-muted)' }}>
                  av {selectedAnbefaling.forfatter}
                </p>
              )}
              <p className="leading-relaxed" style={{ color: 'var(--ink-soft)', fontSize: '15px' }}>
                {selectedAnbefaling.beskrivelse}
              </p>
              <div className="flex gap-3 mt-8">
                <a
                  href={`/katalog?q=${encodeURIComponent(selectedAnbefaling.tittel)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #0f3d54, #1a7a9e)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  Finn i katalogen
                </a>
                <button
                  onClick={() => setSelectedAnbefaling(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: 'var(--mist)', color: 'var(--ink-soft)' }}
                >
                  Lukk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
