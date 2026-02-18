'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PåmeldingModal from '@/components/PåmeldingModal'
import PublicHeader from '@/components/PublicHeader'

const CATEGORIES = ['Alle', 'Foredrag', 'Forfatterbesøk', 'Verksted', 'Barneaktivitet', 'Ungdomsarrangement', 'Boklubb', 'Konsert', 'Kurs', 'Debatt']

interface Arrangement {
  id: string; tittel: string; beskrivelse: string; dato: string; klokkeslett: string
  sted: string; kategori: string; bildeUrl: string | null
  kapasitet?: number; påmeldte?: number; maxDeltakere?: number; antallPaameldt?: number; publisert: boolean
}

function getKapasitet(e: Arrangement): number { return e.kapasitet ?? e.maxDeltakere ?? 50 }
function getPåmeldte(e: Arrangement): number { return e.påmeldte ?? e.antallPaameldt ?? 0 }

const KAT_IKON: Record<string, React.ReactNode> = {
  'Forfatterbesøk': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  'Barneaktivitet': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>,
  'Verksted': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9"/></svg>,
  'Boklubb': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  'Konsert': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  'Kurs': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5"/></svg>,
  'Foredrag': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  'Debatt': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  'Ungdomsarrangement': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
}
const DEFAULT_IKON = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>

export default function ArrangementerPage() {
  const [selectedCategory, setSelectedCategory] = useState('Alle')
  const [arrangementer, setArrangementer] = useState<Arrangement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedArrangement, setSelectedArrangement] = useState<Arrangement | null>(null)
  const [showPåmeldingModal, setShowPåmeldingModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => { fetchArrangementer() }, [])

  const fetchArrangementer = async () => {
    try {
      const res = await fetch('/api/arrangementer')
      const data = await res.json()
      if (Array.isArray(data)) setArrangementer(data)
    } catch { setArrangementer([]) }
    finally { setIsLoading(false) }
  }

  const handleMeldPå = (arr: Arrangement) => { setSelectedArrangement(arr); setShowPåmeldingModal(true) }
  const handlePåmeldingSuccess = () => {
    setSuccessMessage('Du er nå påmeldt! Se påmeldinger på Min side.')
    setTimeout(() => setSuccessMessage(''), 5000)
    fetchArrangementer()
  }

  const filtered = arrangementer.filter(e => e.publisert && (selectedCategory === 'Alle' || e.kategori === selectedCategory))

  return (
    <div className="min-h-screen" style={{ background: 'var(--white-warm, #fdfcfa)' }}>
      <PublicHeader />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--ocean-deep, #0a2a3c) 0%, var(--ocean, #0f3d54) 100%)' }}>
        <div className="container-custom py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Arrangementer
          </h1>
          <p className="text-sm" style={{ color: 'rgba(212,228,237,0.6)' }}>Foredrag, verksteder, konserter og mer</p>
        </div>
      </div>

      <main className="container-custom py-8 pb-16">
        {/* Success toast */}
        {successMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl text-white toast-enter"
            style={{ background: 'var(--forest)', boxShadow: '0 8px 32px rgba(45,107,78,0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
            <span className="text-sm font-medium">{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="ml-2 opacity-70 hover:opacity-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        {/* Category filters */}
        <div className="flex items-center flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background: selectedCategory === cat ? 'var(--ocean)' : 'white',
                color: selectedCategory === cat ? '#fff' : 'var(--ink-soft)',
                border: selectedCategory === cat ? 'none' : '1px solid rgba(0,0,0,0.08)',
                boxShadow: selectedCategory === cat ? '0 2px 8px rgba(15,61,84,0.25)' : 'none',
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Events */}
        {isLoading ? (
          <div className="text-center py-16" style={{ color: 'var(--ink-muted)' }}>Laster arrangementer...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto mb-4 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <p style={{ color: 'var(--ink-muted)' }}>
              {selectedCategory === 'Alle' ? 'Ingen kommende arrangementer.' : `Ingen i «${selectedCategory}».`}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map(event => {
              const kap = getKapasitet(event)
              const paa = getPåmeldte(event)
              const pct = kap > 0 ? Math.round((paa / kap) * 100) : 0
              const erFullt = paa >= kap
              const dag = new Date(event.dato)
              const dagNavn = dag.toLocaleDateString('nb-NO', { weekday: 'short' }).replace('.', '')
              const dagNum = dag.getDate()
              const mnd = dag.toLocaleDateString('nb-NO', { month: 'short' }).replace('.', '')
              const ikon = KAT_IKON[event.kategori] || DEFAULT_IKON

              return (
                <div key={event.id} className="rounded-2xl overflow-hidden card-hover"
                  style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="md:flex">
                    {/* Date column */}
                    <div className="hidden md:flex flex-col items-center justify-center px-6 py-5 flex-shrink-0"
                      style={{ background: 'var(--ocean)', color: '#fff', minWidth: '88px' }}>
                      <span className="text-[10px] uppercase tracking-wider opacity-60">{dagNavn}</span>
                      <span className="text-3xl font-bold leading-none my-1" style={{ fontFamily: 'var(--font-display)' }}>{dagNum}</span>
                      <span className="text-[10px] uppercase tracking-wider opacity-60">{mnd}</span>
                    </div>

                    {/* Image */}
                    {event.bildeUrl && (
                      <div className="md:w-48 md:flex-shrink-0 overflow-hidden">
                        <img src={event.bildeUrl} alt={event.tittel} className="w-full h-48 md:h-full object-cover" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-ocean" style={{ fontSize: '11px' }}>{ikon} {event.kategori}</span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--ink-muted)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          {event.sted}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{event.tittel}</h2>

                      <div className="flex items-center gap-4 text-xs mb-3" style={{ color: 'var(--ink-muted)' }}>
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                          {dag.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          {event.klokkeslett}
                        </span>
                        {/* Mobile date */}
                        <span className="md:hidden badge badge-ocean">{dagNum}. {mnd}</span>
                      </div>

                      <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--ink-soft)' }}>{event.beskrivelse}</p>

                      {/* Capacity bar */}
                      <div className="mb-4 max-w-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{paa} / {kap} plasser</span>
                          <span className="text-xs font-medium" style={{ color: pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--warning, #b07a24)' : 'var(--forest)' }}>{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--mist)' }}>
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--warning)' : 'var(--forest)',
                          }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button onClick={() => handleMeldPå(event)} disabled={erFullt}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: 'linear-gradient(135deg, var(--ocean), var(--fjord))' }}>
                          {erFullt ? 'Fullt' : 'Meld deg på'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {selectedArrangement && (
        <PåmeldingModal isOpen={showPåmeldingModal} onClose={() => setShowPåmeldingModal(false)}
          arrangement={{ ...selectedArrangement, kapasitet: getKapasitet(selectedArrangement), påmeldte: getPåmeldte(selectedArrangement) }}
          onSuccess={handlePåmeldingSuccess} />
      )}
    </div>
  )
}
