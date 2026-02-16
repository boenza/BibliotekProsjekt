'use client'

import { useState, useEffect } from 'react'
import PublicHeader from '@/components/PublicHeader'

/* ───── SVG Icons ───── */
const icons = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  pin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  building: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/></svg>,
  monitor: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  baby: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 12h.01M15 12h.01"/><circle cx="12" cy="12" r="10"/><path d="M8 15c1 1.333 2.667 2 5 2s3.667-.667 4.5-2"/></svg>,
  school: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m4 6 8-4 8 4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M14 22v-4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4"/><path d="M18 5v17"/><path d="M6 5v17"/></svg>,
  compass: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  grid: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
}

const KATEGORI_META: Record<string, { icon: React.ReactNode; color: string }> = {
  'Rom og utstyr':              { icon: icons.building, color: 'var(--ocean)' },
  'Digitale tjenester':         { icon: icons.monitor, color: 'var(--fjord)' },
  'For barn og unge':           { icon: icons.baby, color: 'var(--terracotta)' },
  'For skoler og barnehager':   { icon: icons.school, color: 'var(--forest)' },
  'Veiledning':                 { icon: icons.compass, color: '#8b5cf6' },
  'Annet':                      { icon: icons.grid, color: '#94a3b8' },
}

interface Tjeneste {
  id: string; tittel: string; beskrivelse: string; kategori: string
  ikon: string; bildeUrl: string | null; kontaktInfo: string
  lenke: string; publisert: boolean
}

export default function TjenesterPublicPage() {
  const [tjenester, setTjenester] = useState<Tjeneste[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('Alle')
  const [søk, setSøk] = useState('')

  useEffect(() => {
    fetch('/api/tjenester')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTjenester(data.filter(t => t.publisert)) })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const kategorier = ['Alle', ...new Set(tjenester.map(t => t.kategori))]
  const filtered = tjenester.filter(t => {
    const matchFilter = filter === 'Alle' || t.kategori === filter
    const matchSøk = !søk || t.tittel.toLowerCase().includes(søk.toLowerCase()) || t.beskrivelse.toLowerCase().includes(søk.toLowerCase())
    return matchFilter && matchSøk
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--white-warm, #fdfcfa)' }}>
      <PublicHeader />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--ocean-deep, #0a2a3c) 0%, var(--ocean, #0f3d54) 60%, var(--fjord, #1a7a9e) 100%)' }}>
        <div className="container-custom py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Tjenester
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(212,228,237,0.6)' }}>
            Studierom, utstyr, veiledning og andre tilbud ved Bergen Offentlige Bibliotek
          </p>
        </div>
      </div>

      <main className="container-custom py-8 pb-16">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-muted)' }}>{icons.search}</div>
            <input type="text" placeholder="Søk i tjenester..." value={søk} onChange={e => setSøk(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--ink)' }} />
          </div>
          <div className="flex gap-1 p-1 rounded-xl flex-shrink-0" style={{ background: 'rgba(0,0,0,0.03)' }}>
            {kategorier.map(k => (
              <button key={k} onClick={() => setFilter(k)}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: filter === k ? '#fff' : 'transparent',
                  color: filter === k ? 'var(--ocean)' : 'var(--ink-muted)',
                  boxShadow: filter === k ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}>
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="w-12 h-12 rounded-xl mb-4" style={{ background: 'rgba(0,0,0,0.04)' }} />
                <div className="h-5 rounded mb-2" style={{ background: 'rgba(0,0,0,0.04)', width: '60%' }} />
                <div className="h-3 rounded" style={{ background: 'rgba(0,0,0,0.03)', width: '90%' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--ink-muted)' }}>
              {icons.search}
            </div>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              {søk ? `Ingen treff på «${søk}»` : 'Ingen tjenester i denne kategorien'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(tj => {
              const meta = KATEGORI_META[tj.kategori] || KATEGORI_META['Annet']
              return (
                <div key={tj.id} className="rounded-2xl p-6 transition-all hover:scale-[1.01] group"
                  style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>

                  {/* Image or icon */}
                  {tj.bildeUrl ? (
                    <img src={tj.bildeUrl} alt={tj.tittel} className="w-full h-36 rounded-xl object-cover mb-4" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                      style={{ background: `color-mix(in srgb, ${meta.color} 8%, transparent)`, color: meta.color }}>
                      {meta.icon}
                    </div>
                  )}

                  {/* Category tag */}
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                    style={{ background: `color-mix(in srgb, ${meta.color} 6%, transparent)`, color: meta.color }}>
                    {tj.kategori}
                  </span>

                  <h3 className="text-base font-bold mt-2 group-hover:text-[var(--ocean)] transition-colors"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                    {tj.tittel}
                  </h3>

                  <p className="text-xs mt-1.5 line-clamp-3" style={{ color: 'var(--ink-muted)' }}>
                    {tj.beskrivelse}
                  </p>

                  {tj.kontaktInfo && (
                    <div className="flex items-center gap-1.5 mt-3 text-[11px]" style={{ color: 'var(--ink-muted)' }}>
                      {icons.pin} {tj.kontaktInfo}
                    </div>
                  )}

                  {tj.lenke && (
                    <a href={tj.lenke} className="inline-flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: 'var(--ocean)' }}>
                      Mer informasjon {icons.link}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
