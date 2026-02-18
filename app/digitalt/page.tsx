'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'

type TabType = 'ebøker' | 'lydbøker' | 'film'

interface DigitalItem {
  id: string; tittel: string; forfatter?: string; regissør?: string | null; type: string
  coverUrl: string | null; beskrivelse: string | null; utgivelsesår: number | null
  sjanger: string; tilgjengelig: boolean; leverandør: string; lenkeTilInnhold: string; varighet?: string | null
}

/* ───── SVG icons ───── */
const icons = {
  ebook: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M12 18h.01"/><path d="M10 6h4"/></svg>,
  headphones: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>,
  film: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  lock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  globe: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  newspaper: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5"/></svg>,
  baby: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 12h.01M15 12h.01"/><circle cx="12" cy="12" r="10"/><path d="M8 15c1 1.333 2.667 2 5 2s3.667-.667 4.5-2"/></svg>,
  book: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  play: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
}

/* ───── Digital services data ───── */
const TJENESTER = [
  { id: 'biblio', navn: 'Biblio', beskrivelse: 'E-bøker og lydbøker — lån direkte til enheten din', url: 'https://www.biblio.no',
    icon: icons.book, logoUrl: '/logos/biblio.jpg', color: 'var(--ocean)', features: ['Ubegrenset utlån', 'Les offline', 'Norsk og internasjonalt', 'Automatisk retur'] },
  { id: 'filmoteket', navn: 'Filmoteket', beskrivelse: 'Norsk og internasjonal film i HD-kvalitet', url: 'https://www.filmoteket.no',
    icon: icons.film, logoUrl: '/logos/filmoteket.jpg', color: 'var(--fjord)', features: ['HD streaming', 'Norsk film og serier', 'Dokumentarer', 'Ingen ekstra kostnad'] },
  { id: 'pressreader', navn: 'PressReader', beskrivelse: 'Tusenvis av aviser og magasiner fra hele verden', url: 'https://www.pressreader.com',
    icon: icons.newspaper, logoUrl: '/logos/pressreader.jpg', color: 'var(--terracotta)', features: ['7 000+ publikasjoner', '60+ språk', 'Les på alle enheter', 'Daglig oppdatert'] },
  { id: 'libby', navn: 'Libby / OverDrive', beskrivelse: 'Engelskspråklige e-bøker og lydbøker', url: 'https://www.overdrive.com',
    icon: icons.globe, logoUrl: '/logos/libby.jpg', color: '#7c5cbf', features: ['Engelsk litteratur', 'Bestselgere', 'Kindle-kompatibel', 'Anbefalt for deg'] },
]

const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: 'ebøker', label: 'E-bøker', icon: icons.ebook },
  { key: 'lydbøker', label: 'Lydbøker', icon: icons.headphones },
  { key: 'film', label: 'Film', icon: icons.film },
]

export default function DigitaltInnholdPage() {
  const { status } = useSession()
  const isLoggedIn = status === 'authenticated'
  const [activeTab, setActiveTab] = useState<TabType>('ebøker')
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<DigitalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'browse' | 'services'>('browse')

  useEffect(() => { fetchContent() }, [activeTab, searchQuery])

  const fetchContent = async () => {
    setIsLoading(true)
    try {
      let url = '/api/digitalt?'
      if (activeTab === 'ebøker') url += 'type=books&subType=ebok'
      else if (activeTab === 'lydbøker') url += 'type=books&subType=lydbok'
      else if (activeTab === 'film') url += 'type=films'
      if (searchQuery) url += `&søk=${encodeURIComponent(searchQuery)}`
      const response = await fetch(url)
      const data = await response.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching digital content:', error)
      setItems([])
    } finally { setIsLoading(false) }
  }

  const getProviderName = (p: string) => {
    switch (p) { case 'biblio': return 'Biblio'; case 'filmoteket': return 'Filmoteket'; default: return p }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--white-warm, #fdfcfa)' }}>
      <PublicHeader />

      {/* ═══════ PAGE HEADER ═══════ */}
      <div style={{ background: 'linear-gradient(135deg, var(--ocean-deep, #0a2a3c) 0%, var(--ocean, #0f3d54) 60%, var(--fjord, #1a7a9e) 100%)' }}>
        <div className="container-custom py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Digitalt bibliotek
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(212,228,237,0.6)' }}>
            E-bøker, lydbøker, film og digitale tjenester — gratis med ditt lånekort
          </p>

          {/* View toggle */}
          <div className="flex gap-2 mt-6">
            {([
              { key: 'browse' as const, label: 'Utforsk innhold' },
              { key: 'services' as const, label: 'Velg tjeneste' },
            ]).map(v => (
              <button key={v.key} onClick={() => setView(v.key)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: view === v.key ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
                  color: view === v.key ? '#fff' : 'rgba(212,228,237,0.6)',
                  border: `1px solid ${view === v.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container-custom py-8 pb-16">

        {/* ═══════ LOGIN / STATUS BANNER ═══════ */}
        {!isLoggedIn ? (
          <div className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ background: 'rgba(15,61,84,0.04)', border: '1px solid rgba(15,61,84,0.08)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(15,61,84,0.08)', color: 'var(--ocean)' }}>{icons.lock}</div>
            <div className="flex-1">
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Logg inn for full tilgang</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>Alt digitalt innhold er gratis for lånekortinnehavere ved Bergen Offentlige Bibliotek.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: 'var(--ocean)' }}>Logg inn</Link>
              <Link href="/registrer" className="text-xs font-medium" style={{ color: 'var(--ocean)' }}>Bli låner →</Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-4 mb-8 flex items-center gap-3"
            style={{ background: 'rgba(45,107,78,0.04)', border: '1px solid rgba(45,107,78,0.12)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,107,78,0.1)', color: 'var(--forest)' }}>{icons.check}</div>
            <p className="text-sm font-medium" style={{ color: 'var(--forest)' }}>Du er innlogget — alle digitale tjenester er tilgjengelige.</p>
          </div>
        )}

        {/* ═══════ SERVICES VIEW ═══════ */}
        {view === 'services' && (
          <div className="space-y-4">
            {TJENESTER.map(t => (
              <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer"
                className="block rounded-2xl p-6 transition-all hover:scale-[1.005] group"
                style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  {/* Icon + info */}
                  <div className="flex items-center gap-4 flex-1">
                    {t.logoUrl ? (
                        <img src={t.logoUrl} alt={t.navn} className="w-12 h-12 rounded-xl object-contain flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `color-mix(in srgb, ${t.color} 8%, transparent)`, color: t.color }}>
                          {t.icon}
                    </div>
                  )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold group-hover:text-[var(--ocean)] transition-colors"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{t.navn}</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>{t.beskrivelse}</p>
                    </div>
                  </div>
                  {/* Features */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 md:flex-nowrap">
                    {t.features.map(f => (
                      <span key={f} className="flex items-center gap-1 text-[11px] whitespace-nowrap" style={{ color: 'var(--ink-muted)' }}>
                        <span style={{ color: t.color }}>{icons.check}</span> {f}
                      </span>
                    ))}
                  </div>
                  {/* Arrow */}
                  <div className="hidden md:flex items-center pl-4 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--ocean)' }}>{icons.arrow}</div>
                </div>
              </a>
            ))}

            {/* SSO note */}
            {isLoggedIn && (
              <div className="rounded-xl p-4 text-center" style={{ background: 'var(--mist)' }}>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                  Tjenestene åpnes med automatisk innlogging via lånekort-SSO. Du trenger ikke logge inn på nytt.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═══════ BROWSE VIEW ═══════ */}
        {view === 'browse' && (
          <div>
            {/* Tabs + search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--mist)' }}>
                {TABS.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: activeTab === tab.key ? '#fff' : 'transparent',
                      color: activeTab === tab.key ? 'var(--ocean)' : 'var(--ink-muted)',
                      boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-muted)' }}>{icons.search}</div>
                <input type="text" placeholder={`Søk i ${activeTab}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--ink)' }} />
              </div>
            </div>

            {/* Count */}
            <p className="text-xs mb-4" style={{ color: 'var(--ink-muted)' }}>
              {isLoading ? 'Søker...' : <><strong>{items.length}</strong> {activeTab} tilgjengelig</>}
            </p>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div className="aspect-[2/3]" style={{ background: 'var(--mist)' }} />
                    <div className="p-3 space-y-2">
                      <div className="h-4 rounded" style={{ background: 'var(--mist)', width: '80%' }} />
                      <div className="h-3 rounded" style={{ background: 'var(--mist)', width: '50%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--mist)', color: 'var(--ink-muted)' }}>
                  {icons.search}
                </div>
                <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>Ingen resultater funnet</p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="mt-2 text-sm font-medium" style={{ color: 'var(--ocean)' }}>
                    Nullstill søk →
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map(item => (
                  <div key={item.id} className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02] group"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
                    {/* Cover */}
                    <div className="aspect-[2/3] relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, var(--sand-warm) 0%, var(--sand-deep) 100%)' }}>
                      {item.coverUrl ? (
                        <img src={item.coverUrl} alt={item.tittel} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          <div style={{ color: 'var(--ink-muted)', opacity: 0.3 }}>
                            {activeTab === 'film' ? icons.film : activeTab === 'lydbøker' ? icons.headphones : icons.ebook}
                          </div>
                          <p className="text-xs text-center mt-2 font-medium" style={{ color: 'var(--ink-muted)', opacity: 0.5 }}>{item.tittel}</p>
                        </div>
                      )}
                      {/* Provider badge */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', color: 'var(--ink-soft)' }}>
                        {getProviderName(item.leverandør)}
                      </div>
                      {/* Play/Read overlay on hover */}
                      <a href={item.lenkeTilInnhold} target="_blank" rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(10,42,60,0.5)' }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--ocean)' }}>
                          {activeTab === 'film' ? icons.play : icons.book}
                        </div>
                      </a>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <h3 className="text-sm font-bold leading-tight line-clamp-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{item.tittel}</h3>
                      <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'var(--ink-muted)' }}>{item.forfatter || item.regissør}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--mist)', color: 'var(--ink-muted)' }}>{item.sjanger}</span>
                        {item.utgivelsesår && <span className="text-[10px]" style={{ color: 'var(--ink-muted)' }}>{item.utgivelsesår}</span>}
                        {item.varighet && <span className="text-[10px]" style={{ color: 'var(--ink-muted)' }}>{item.varighet}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
