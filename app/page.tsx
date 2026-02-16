'use client'

import PersonalisertSeksjon from '@/components/PersonalisertSeksjon'
import AnbefalingerSeksjon from '@/components/AnbefalingerSeksjon'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import Hero from '@/components/Hero'
import VarselBanner from '@/components/VarselBanner'

interface Arrangement {
  id: string
  tittel: string
  dato: string
  klokkeslett: string
  kategori: string
  sted: string
  bildeUrl: string | null
}

interface Artikkel {
  id: string
  tittel: string
  ingress: string
  bildeUrl: string | null
  kategori: string
  opprettet: string
}

// Scroll reveal hook with fallback
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) { setVisible(true); return }
    // Check if already in viewport
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold, rootMargin: '50px' }
    )
    observer.observe(el)
    // Safety fallback
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => { observer.disconnect(); clearTimeout(timer) }
  }, [threshold])
  return { ref, visible }
}

// Category icons
const KATEGORI_IKON: Record<string, JSX.Element> = {
  'Forfatterbesøk': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  'Barneaktivitet': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  'Verksted': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/></svg>,
  'Boklubb': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  'Konsert': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  'Kurs': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5"/></svg>,
  'Ungdomsarrangement': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  'Debatt': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
}

const DEFAULT_IKON = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>

export default function HomePage() {
  const [arrangementer, setArrangementer] = useState<Arrangement[]>([])
  const [artikler, setArtikler] = useState<Artikkel[]>([])

  const quickLinks = useScrollReveal()
  const eventsSection = useScrollReveal()
  const infoSection = useScrollReveal()
  const artikkelSection = useScrollReveal()

  useEffect(() => {
    fetch('/api/arrangementer')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setArrangementer(data.filter((a: any) => a.publisert).slice(0, 3))
      })
      .catch(() => {})

    fetch('/api/artikler?publisert=true')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setArtikler(data.slice(0, 3))
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--white-warm, #fdfcfa)' }}>
      <PublicHeader />
      <Hero />

      {/* Varsler */}
      <div className="container-custom -mt-2 relative z-10">
        <VarselBanner />
      </div>

      {/* Personalisert seksjon — kun for innloggede (L-8) */}
      <PersonalisertSeksjon />

      {/* Anbefalinger */}
      <AnbefalingerSeksjon />

      {/* ═══ Quick Links ═══ */}
      <section ref={quickLinks.ref} className="py-16 md:py-20" style={{ background: 'var(--sand, #f5efe6)' }}>
        <div className="container-custom">
          <div className={`text-center mb-12 animate-fade-up`}>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
            >
              Utforsk biblioteket
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-muted)' }}>
              Alt du trenger — samlet på ett sted
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                href: '/katalog',
                title: 'Søk i katalogen',
                desc: 'Finn bøker, tidsskrifter, filmer og mer i hele samlingen',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
                color: 'var(--ocean, #0f3d54)',
                bg: 'linear-gradient(135deg, rgba(15,61,84,0.06) 0%, rgba(26,122,158,0.06) 100%)',
              },
              {
                href: '/digitalt',
                title: 'Digitalt innhold',
                desc: 'E-bøker, lydbøker og streaming — helt gratis med lånekort',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>,
                color: 'var(--terracotta, #c75b3f)',
                bg: 'linear-gradient(135deg, rgba(199,91,63,0.06) 0%, rgba(224,122,95,0.06) 100%)',
              },
              {
                href: '/arrangementer',
                title: 'Arrangementer',
                desc: 'Forfattermøter, kurs, verksteder og aktiviteter for alle aldre',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
                color: 'var(--forest, #2d6b4e)',
                bg: 'linear-gradient(135deg, rgba(45,107,78,0.06) 0%, rgba(61,139,101,0.06) 100%)',
              },
            ].map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative p-8 rounded-2xl transition-all duration-400 card-lift animate-fade-up`}
                style={{
                  animationDelay: `${0.1 + i * 0.1}s`,
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: item.bg, color: item.color }}
                >
                  {item.icon}
                </div>
                <h3
                  className="text-xl font-bold mb-2 transition-colors group-hover:text-[#0f3d54]"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                  {item.desc}
                </p>
                <div
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-all group-hover:gap-2.5"
                  style={{ color: item.color }}
                >
                  Utforsk
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Kommende Arrangementer ═══ */}
      {arrangementer.length > 0 && (
        <section ref={eventsSection.ref} className="py-16 md:py-20">
          <div className="container-custom">
            <div className={`mb-10 animate-fade-up`}>
              <div className="section-divider mb-4" />
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2
                    className="text-3xl md:text-4xl font-bold tracking-tight"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
                  >
                    Kommende arrangementer
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: 'var(--ink-muted)' }}>
                    Bli med på noe spennende
                  </p>
                </div>
                <Link
                  href="/arrangementer"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium link-underline pb-0.5 flex-shrink-0"
                  style={{ color: 'var(--ocean)' }}
                >
                  Se alle
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {arrangementer.map((arr, i) => {
                const dag = new Date(arr.dato)
                const dagNavn = dag.toLocaleDateString('nb-NO', { weekday: 'short' }).replace('.', '')
                const dagNum = dag.getDate()
                const maaned = dag.toLocaleDateString('nb-NO', { month: 'short' }).replace('.', '')
                const ikon = KATEGORI_IKON[arr.kategori] || DEFAULT_IKON

                return (
                  <Link
                    key={arr.id}
                    href="/arrangementer"
                    className={`group rounded-2xl overflow-hidden card-lift animate-fade-up`}
                    style={{
                      animationDelay: `${0.15 + i * 0.1}s`,
                      background: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Date strip */}
                    <div className="flex">
                      <div
                        className="flex flex-col items-center justify-center px-5 py-4 flex-shrink-0"
                        style={{ background: 'var(--ocean)', color: '#ffffff', minWidth: '72px' }}
                      >
                        <span className="text-[10px] uppercase tracking-wider opacity-60">{dagNavn}</span>
                        <span className="text-2xl font-bold leading-none my-0.5" style={{ fontFamily: 'var(--font-display)' }}>{dagNum}</span>
                        <span className="text-[10px] uppercase tracking-wider opacity-60">{maaned}</span>
                      </div>
                      <div className="p-5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-ocean" style={{ fontSize: '11px' }}>
                            {ikon}
                            {arr.kategori}
                          </span>
                        </div>
                        <h3
                          className="font-bold leading-snug mb-1.5 truncate group-hover:text-[#0f3d54] transition-colors"
                          style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--ink)' }}
                        >
                          {arr.tittel}
                        </h3>
                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--ink-muted)' }}>
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                            {arr.klokkeslett}
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            {arr.sted}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Aktuelt / Artikler ═══ */}
      {artikler.length > 0 && (
        <section ref={artikkelSection.ref} className="py-16 md:py-20" style={{ background: 'var(--mist, #f0f4f7)' }}>
          <div className="container-custom">
            <div className={`mb-10 animate-fade-up`}>
              <div className="section-divider mb-4" />
              <div className="flex items-end justify-between gap-4">
                <h2
                  className="text-3xl md:text-4xl font-bold tracking-tight"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
                >
                  Aktuelt
                </h2>
                <Link
                  href="/aktuelt"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium link-underline pb-0.5"
                  style={{ color: 'var(--ocean)' }}
                >
                  Alle artikler
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {artikler.map((art, i) => (
                <Link
                  key={art.id}
                  href="/aktuelt"
                  className={`group rounded-2xl overflow-hidden card-lift animate-fade-up`}
                  style={{
                    animationDelay: `${0.15 + i * 0.1}s`,
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="h-40 overflow-hidden">
                    {art.bildeUrl ? (
                      <img
                        src={art.bildeUrl}
                        alt={art.tittel}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, var(--sand) 0%, var(--sand-warm) 100%)' }} />
                    )}
                  </div>
                  <div className="p-5">
                    {art.kategori && (
                      <span className="badge badge-terracotta mb-2" style={{ fontSize: '11px' }}>
                        {art.kategori}
                      </span>
                    )}
                    <h3
                      className="font-bold leading-snug mb-2 group-hover:text-[#0f3d54] transition-colors"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--ink)' }}
                    >
                      {art.tittel}
                    </h3>
                    <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                      {art.ingress}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Info Section ═══ */}
      <section ref={infoSection.ref} className="py-16 md:py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Åpningstider */}
            <div
              className={`rounded-2xl p-8 md:p-10 animate-slide-left`}
              style={{
                background: 'linear-gradient(135deg, #0f3d54 0%, #16526e 100%)',
                color: '#ffffff',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  Åpningstider
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['Mandag – Fredag', '10:00 – 20:00'],
                  ['Lørdag', '10:00 – 16:00'],
                  ['Søndag', 'Stengt'],
                ].map(([dag, tid]) => (
                  <div key={dag} className="flex justify-between items-center py-2 border-b border-white/10">
                    <span style={{ color: 'rgba(212,228,237,0.8)' }}>{dag}</span>
                    <span className="font-semibold">{tid}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs" style={{ color: 'rgba(212,228,237,0.5)' }}>
                Bergen Hovedbibliotek · Strømgaten 6
              </p>
            </div>

            {/* Bli medlem */}
            <div
              className={`rounded-2xl p-8 md:p-10 animate-slide-right`}
              style={{
                background: 'var(--sand)',
                border: '1px solid var(--sand-deep)',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,107,78,0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6m3-3h-6"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                  Bli medlem — helt gratis
                </h3>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--ink-soft)' }}>
                Med lånekort hos Bergen Bibliotek får du tilgang til:
              </p>
              <div className="space-y-3">
                {[
                  ['Lån av bøker, filmer og spill', 'var(--forest)'],
                  ['E-bøker og lydbøker via Biblio', 'var(--ocean)'],
                  ['Streaming på Filmoteket', 'var(--terracotta)'],
                  ['Påmelding til arrangementer', 'var(--fjord)'],
                ].map(([text, color]) => (
                  <div key={text} className="flex items-center gap-3 text-sm" style={{ color: 'var(--ink-soft)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    {text}
                  </div>
                ))}
              </div>
              <Link
                href="/registrer"
                className="mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #2d6b4e, #3d8b65)', boxShadow: '0 4px 12px rgba(45,107,78,0.2)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6m3-3h-6"/></svg>
                Registrer deg nå
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer style={{ background: 'var(--ocean-deep, #0a2a3c)', color: '#ffffff' }}>
        <div className="container-custom py-16">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1a7a9e, #d4e4ed)' }}
                >
                  <span className="text-xs font-bold" style={{ color: '#0a2a3c', fontFamily: 'var(--font-display)' }}>BB</span>
                </div>
                <span className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                  Bergen Bibliotek
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(212,228,237,0.4)' }}>
                Felles Formidlingsløsning for norske folkebibliotek. 
                Din lokale møteplass for kultur og kunnskap.
              </p>
            </div>

            {/* Besøk oss */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(212,228,237,0.5)' }}>
                Besøk oss
              </h4>
              <div className="space-y-2 text-sm" style={{ color: 'rgba(212,228,237,0.65)' }}>
                <p>Strømgaten 6</p>
                <p>5015 Bergen</p>
                <p className="pt-1">Man–Fre: 10–20</p>
                <p>Lørdag: 10–16</p>
              </div>
            </div>

            {/* Kontakt */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(212,228,237,0.5)' }}>
                Kontakt
              </h4>
              <div className="space-y-2 text-sm" style={{ color: 'rgba(212,228,237,0.65)' }}>
                <p>55 56 85 60</p>
                <p>post@bergen.bibliotek.no</p>
              </div>
            </div>

            {/* Lenker */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(212,228,237,0.5)' }}>
                Snarveier
              </h4>
              <div className="space-y-2 text-sm">
                {[
                  { href: '/katalog', label: 'Katalog' },
                  { href: '/digitalt', label: 'Digitalt innhold' },
                  { href: '/arrangementer', label: 'Arrangementer' },
                  { href: '/aktuelt', label: 'Aktuelt' },
                  { href: '/admin', label: 'For ansatte →' },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block transition-colors"
                    style={{ color: 'rgba(212,228,237,0.5)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(212,228,237,0.5)'}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div
            className="mt-12 pt-8 text-center text-xs"
            style={{ borderTop: '1px solid rgba(212,228,237,0.08)', color: 'rgba(212,228,237,0.3)' }}
          >
            © 2026 Bergen Offentlige Bibliotek · Felles Formidlingsløsning
          </div>
        </div>
      </footer>
    </div>
  )
}
