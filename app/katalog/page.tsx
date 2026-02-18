'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import VarselBanner from '@/components/VarselBanner'
import ReserverModal from '@/components/ReserverModal'
import PublicHeader from '@/components/PublicHeader'

const GENRES = ['Alle', 'Roman', 'Sakprosa', 'Klassiker', 'Poesi']

interface Tilgjengelighet {
  filial: string
  status: string
  antall: number
}

interface Eksemplar {
  filial: string
  språk: string
  format: string
  status: 'Tilgjengelig' | 'Utlånt'
  antall: number
}

interface Book {
  id: string
  tittel: string
  forfatter: string
  sjanger: string
  bildeUrl: string | null
  isbn: string | null
  beskrivelse: string | null
  utgitt: string | null
  språk: string[]
  formater: string[]
  tilgjengelighet: Tilgjengelighet[]
  eksemplarer?: Eksemplar[]
}

export default function KatalogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Alle')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [bøker, setBøker] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showReserverModal, setShowReserverModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailBook, setDetailBook] = useState<Book | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  // ── Språk/format filter state for detail modal ──
  const [detailSpråk, setDetailSpråk] = useState('')
  const [detailFormat, setDetailFormat] = useState<string | null>(null)

  useEffect(() => { fetchBooks() }, [])
  useEffect(() => {
    const timer = setTimeout(() => { fetchBooks() }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedGenre])

  const fetchBooks = async () => {
    setIsSearching(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedGenre !== 'Alle') params.set('sjanger', selectedGenre)
      const response = await fetch(`/api/katalog?${params}`)
      if (!response.ok) throw new Error('Failed')
      const data = await response.json()
      setBøker(Array.isArray(data) ? data : [])
    } catch { setBøker([]) }
    finally { setIsLoading(false); setIsSearching(false) }
  }

  const getTotalTilgjengelig = (book: Book) => book.tilgjengelighet?.reduce((sum, t) => sum + t.antall, 0) || 0
  const harDigitalFormat = (book: Book) => book.formater?.some(f => f === 'E-bok' || f === 'Lydbok')

  /* ── FIX: Both list "Bestill" and detail "Bestill" now go through detail modal first ── */
  const handleShowDetail = (book: Book) => {
    setDetailBook(book)
    setDetailSpråk(book.språk?.[0] || '')
    setDetailFormat(null)
    setShowDetailModal(true)
  }

  /* ── Opens ReserverModal with language/format pre-selected from detail ── */
  const handleReserverFromDetail = () => {
    if (!detailBook) return
    setSelectedBook(detailBook)
    setShowDetailModal(false)
    setShowReserverModal(true)
  }

  const handleReservasjonSuccess = () => {
    setSuccessMessage('Reservasjon opprettet! Se den på Min side.')
    setTimeout(() => setSuccessMessage(''), 5000)
    fetchBooks()
  }

  const filteredBooks = bøker.filter(book => !(showAvailableOnly && getTotalTilgjengelig(book) === 0))

  // ── Computed: available formats for selected language ──
  const formatsForSpråk = useMemo(() => {
    if (!detailBook?.eksemplarer) return detailBook?.formater || []
    const set = new Set<string>()
    detailBook.eksemplarer
      .filter(e => e.språk === detailSpråk)
      .forEach(e => set.add(e.format))
    return Array.from(set)
  }, [detailBook, detailSpråk])

  // ── Computed: filtered eksemplarer ──
  const filteredEksemplarer = useMemo(() => {
    if (!detailBook?.eksemplarer) return []
    return detailBook.eksemplarer.filter(e => {
      if (e.språk !== detailSpråk) return false
      if (detailFormat && e.format !== detailFormat) return false
      return true
    })
  }, [detailBook, detailSpråk, detailFormat])

  // Reset format when language changes and format isn't available
  useEffect(() => {
    if (detailFormat && !formatsForSpråk.includes(detailFormat)) {
      setDetailFormat(null)
    }
  }, [formatsForSpråk, detailFormat])

  const formatIkon: Record<string, React.ReactNode> = {
    'E-bok': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8m-8 4h8m-8 4h5"/></svg>,
    'Lydbok': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zm-18 0a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
    'Bok': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
    'Papirbok': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  }

  const formatIkonLg: Record<string, React.ReactNode> = {
    'E-bok': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8m-8 4h8m-8 4h5"/></svg>,
    'Lydbok': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zm-18 0a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
    'Papirbok': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--white-warm, #fdfcfa)' }}>
      <PublicHeader />

      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg, var(--ocean-deep, #0a2a3c) 0%, var(--ocean, #0f3d54) 100%)' }}>
        <div className="container-custom py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Katalog
          </h1>
          <p className="text-sm" style={{ color: 'rgba(212,228,237,0.6)' }}>Søk i hele samlingen til Bergen Bibliotek</p>

          {/* Search */}
          <div className="mt-6 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-xl text-base focus:outline-none focus:ring-2 transition-shadow"
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                color: 'var(--ink)',
              }}
              placeholder="Søk etter tittel, forfatter eller ISBN..."
            />
          </div>
        </div>
      </div>

      <div className="container-custom py-4"><VarselBanner /></div>

      {successMessage && (
        <div className="container-custom">
          <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: 'rgba(45,107,78,0.08)', border: '1px solid rgba(45,107,78,0.15)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
            <span className="text-sm font-medium" style={{ color: 'var(--forest)' }}>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="ml-auto text-gray-400 hover:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      )}

      <main className="container-custom py-6 pb-16">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-medium uppercase tracking-wider mr-1" style={{ color: 'var(--ink-muted)' }}>Sjanger:</span>
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background: selectedGenre === genre ? 'var(--ocean)' : 'white',
                color: selectedGenre === genre ? '#fff' : 'var(--ink-soft)',
                border: selectedGenre === genre ? 'none' : '1px solid rgba(0,0,0,0.08)',
                boxShadow: selectedGenre === genre ? '0 2px 8px rgba(15,61,84,0.25)' : 'none',
              }}
            >
              {genre}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--ink-muted)' }}>
            <input type="checkbox" checked={showAvailableOnly} onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded" style={{ accentColor: 'var(--ocean)' }} />
            Kun ledige
          </label>
        </div>

        {/* Result count */}
        <p className="text-xs mb-4" style={{ color: 'var(--ink-muted)' }}>
          {isSearching ? 'Søker...' : `${filteredBooks.length} treff`}
        </p>

        {/* Book list */}
        {isLoading ? (
          <div className="text-center py-16" style={{ color: 'var(--ink-muted)' }}>Laster katalog...</div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto mb-4 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <p style={{ color: 'var(--ink-muted)' }}>Ingen treff</p>
            <button onClick={() => { setSearchQuery(''); setSelectedGenre('Alle'); setShowAvailableOnly(false) }}
              className="mt-3 text-sm font-medium" style={{ color: 'var(--ocean)' }}>Nullstill søk</button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBooks.map(book => {
              const tilgjengelig = getTotalTilgjengelig(book)
              const harDigital = harDigitalFormat(book)
              return (
                <div key={book.id}
                  className="rounded-2xl overflow-hidden cursor-pointer card-hover"
                  style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}
                  onClick={() => handleShowDetail(book)}
                >
                  <div className="flex">
                    {/* Cover */}
                    <div className="w-24 sm:w-32 flex-shrink-0 overflow-hidden">
                      {book.bildeUrl ? (
                        <img src={book.bildeUrl} alt={book.tittel} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--ocean) 0%, var(--fjord, #1a7a9e) 100%)' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(212,228,237,0.5)" strokeWidth="1.2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{book.tittel}</h3>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>{book.forfatter}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="badge badge-ocean">{book.sjanger}</span>
                          {book.utgitt && <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{book.utgitt}</span>}
                          {book.formater?.map(f => (
                            <span key={f} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                background: f === 'E-bok' ? 'rgba(15,61,84,0.06)' : f === 'Lydbok' ? 'rgba(91,74,138,0.06)' : 'rgba(0,0,0,0.04)',
                                color: f === 'E-bok' ? 'var(--ocean)' : f === 'Lydbok' ? '#5b4a8a' : 'var(--ink-muted)',
                              }}>
                              {formatIkon[f] || formatIkon['Bok']} {f}
                            </span>
                          ))}
                          {book.språk && book.språk.length > 1 && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: 'rgba(15,61,84,0.04)', color: 'var(--ink-muted)' }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                              {book.språk.length} språk
                            </span>
                          )}
                        </div>
                        {book.beskrivelse && (
                          <p className="text-sm mt-2 line-clamp-1 hidden sm:block" style={{ color: 'var(--ink-muted)' }}>{book.beskrivelse}</p>
                        )}
                      </div>

                      {/* Status + buttons — FIX: Bestill opens detail modal (same as clicking card) */}
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-2 flex-shrink-0">
                        <span className="text-xs font-medium px-3 py-1 rounded-full"
                          style={{
                            background: tilgjengelig > 0 ? 'rgba(45,107,78,0.08)' : 'rgba(220,38,38,0.06)',
                            color: tilgjengelig > 0 ? 'var(--forest)' : 'var(--danger, #dc2626)',
                          }}>
                          {tilgjengelig > 0 ? `${tilgjengelig} ledig` : 'Utlånt'}
                        </span>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {/* FIX: Opens detail modal so user can choose language/format first */}
                          <button onClick={() => handleShowDetail(book)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                            style={{
                              background: tilgjengelig > 0 ? 'var(--ocean)' : 'var(--mist, #f0f4f7)',
                              color: tilgjengelig > 0 ? '#fff' : 'var(--ink-soft)',
                            }}>
                            {tilgjengelig > 0 ? 'Bestill' : 'Sett i kø'}
                          </button>
                          {harDigital && tilgjengelig > 0 && (
                            <Link href="/digitalt" className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.02]"
                              style={{ background: 'var(--fjord, #1a7a9e)' }}>Lån digitalt</Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ═══════ DETAIL MODAL WITH LANGUAGE/FORMAT FILTERING ═══════ */}
      {showDetailModal && detailBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(10,42,60,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowDetailModal(false)}>
          <div className="rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            style={{ background: '#fff', boxShadow: '0 24px 80px rgba(10,42,60,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{detailBook.tittel}</h2>
              <button onClick={() => setShowDetailModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 sm:p-8">
              {/* Book info */}
              <div className="flex gap-6 mb-6">
                <div className="w-32 h-44 flex-shrink-0 rounded-xl overflow-hidden">
                  {detailBook.bildeUrl ? (
                    <img src={detailBook.bildeUrl} alt={detailBook.tittel} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--ocean), var(--fjord))' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(212,228,237,0.5)" strokeWidth="1"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{detailBook.tittel}</h3>
                  <p className="text-base mb-3" style={{ color: 'var(--ink-muted)' }}>{detailBook.forfatter}</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
                    <div><span style={{ color: 'var(--ink-muted)' }}>Sjanger:</span> <span className="font-medium" style={{ color: 'var(--ink)' }}>{detailBook.sjanger}</span></div>
                    {detailBook.utgitt && <div><span style={{ color: 'var(--ink-muted)' }}>Utgitt:</span> <span className="font-medium" style={{ color: 'var(--ink)' }}>{detailBook.utgitt}</span></div>}
                    {detailBook.isbn && <div><span style={{ color: 'var(--ink-muted)' }}>ISBN:</span> <span className="font-mono text-sm" style={{ color: 'var(--ink)' }}>{detailBook.isbn}</span></div>}
                    <div><span style={{ color: 'var(--ink-muted)' }}>Språk:</span> <span className="font-medium" style={{ color: 'var(--ink)' }}>{detailBook.språk?.join(', ')}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {detailBook.formater?.map(f => (
                      <span key={f} className="badge" style={{
                        background: f === 'E-bok' ? 'rgba(15,61,84,0.08)' : f === 'Lydbok' ? 'rgba(91,74,138,0.08)' : 'rgba(0,0,0,0.04)',
                        color: f === 'E-bok' ? 'var(--ocean)' : f === 'Lydbok' ? '#5b4a8a' : 'var(--ink-muted)',
                      }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              {detailBook.beskrivelse && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>Om verket</h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{detailBook.beskrivelse}</p>
                </div>
              )}

              {/* ═══════ TILGJENGELIGHET MED SPRÅK/FORMAT-FILTER ═══════ */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-muted)' }}>Tilgjengelighet</h4>

                {/* ── Språkvelger ── */}
                {detailBook.språk && detailBook.språk.length > 1 && (
                  <div className="mb-3">
                    <label className="block text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>Språk</label>
                    <div className="flex flex-wrap gap-2">
                      {detailBook.språk.map(s => (
                        <button
                          key={s}
                          onClick={() => { setDetailSpråk(s); setDetailFormat(null) }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all"
                          style={{
                            background: detailSpråk === s ? 'var(--ocean)' : 'white',
                            color: detailSpråk === s ? '#fff' : 'var(--ink-soft)',
                            border: detailSpråk === s ? '1.5px solid var(--ocean)' : '1.5px solid rgba(0,0,0,0.1)',
                            boxShadow: detailSpråk === s ? '0 2px 8px rgba(15,61,84,0.2)' : 'none',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Formatvelger ── */}
                {formatsForSpråk.length > 0 && (
                  <div className="mb-3">
                    <label className="block text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>Format</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setDetailFormat(null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: detailFormat === null ? 'var(--ocean-deep, #0a2a3c)' : 'transparent',
                          color: detailFormat === null ? '#fff' : 'var(--ink-soft)',
                          border: detailFormat === null ? '1.5px solid var(--ocean-deep, #0a2a3c)' : '1.5px solid rgba(0,0,0,0.1)',
                        }}
                      >
                        Alle formater
                      </button>
                      {formatsForSpråk.map(f => {
                        const fCount = detailBook.eksemplarer?.filter(e => e.språk === detailSpråk && e.format === f).reduce((s, e) => s + e.antall, 0) || 0
                        return (
                          <button
                            key={f}
                            onClick={() => setDetailFormat(detailFormat === f ? null : f)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              background: detailFormat === f
                                ? f === 'E-bok' ? 'var(--ocean)' : f === 'Lydbok' ? '#5b4a8a' : 'var(--ink)'
                                : 'transparent',
                              color: detailFormat === f ? '#fff' : f === 'E-bok' ? 'var(--ocean)' : f === 'Lydbok' ? '#5b4a8a' : 'var(--ink-soft)',
                              border: detailFormat === f
                                ? '1.5px solid transparent'
                                : `1.5px solid ${f === 'E-bok' ? 'rgba(15,61,84,0.2)' : f === 'Lydbok' ? 'rgba(91,74,138,0.2)' : 'rgba(0,0,0,0.1)'}`,
                            }}
                          >
                            {formatIkonLg[f]} {f} ({fCount})
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── Eksemplarliste ── */}
                {detailBook.eksemplarer && detailBook.eksemplarer.length > 0 ? (
                  <div className="space-y-2 mt-3">
                    {filteredEksemplarer.length > 0 ? filteredEksemplarer.map((e, i) => (
                      <div key={`${e.filial}-${e.format}-${e.språk}-${i}`} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--mist)' }}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {e.filial.startsWith('Digitalt') ? (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(15,61,84,0.08)' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ocean)" strokeWidth="1.8">
                                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
                              </svg>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(0,0,0,0.04)' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-sm font-medium block truncate" style={{ color: 'var(--ink)' }}>{e.filial}</span>
                            <span className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--ink-muted)' }}>
                              {formatIkon[e.format] || formatIkon['Papirbok']} {e.format}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-medium px-3 py-1 rounded-full"
                            style={{
                              background: e.status === 'Tilgjengelig' ? 'rgba(45,107,78,0.08)' : 'rgba(220,38,38,0.06)',
                              color: e.status === 'Tilgjengelig' ? 'var(--forest)' : 'var(--danger)',
                            }}>
                            {e.status === 'Tilgjengelig' ? (e.filial.startsWith('Digitalt') ? 'Lån nå' : `${e.antall} ledig`) : 'Utlånt'}
                          </span>
                          {e.filial.startsWith('Digitalt') && e.status === 'Tilgjengelig' && (
                            <Link href="/digitalt" className="text-xs font-medium px-3 py-1 rounded-full text-white"
                              style={{ background: 'var(--fjord)' }}
                              onClick={ev => ev.stopPropagation()}>
                              Åpne
                            </Link>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6 rounded-xl" style={{ background: 'var(--mist)' }}>
                        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>Ingen eksemplarer for dette valget</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detailBook.tilgjengelighet?.map(t => (
                      <div key={t.filial} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--mist)' }}>
                        <div className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{t.filial}</span>
                        </div>
                        <span className="text-xs font-medium px-3 py-1 rounded-full"
                          style={{
                            background: t.status === 'Tilgjengelig' ? 'rgba(45,107,78,0.08)' : 'rgba(220,38,38,0.06)',
                            color: t.status === 'Tilgjengelig' ? 'var(--forest)' : 'var(--danger)',
                          }}>
                          {t.status === 'Tilgjengelig' ? `${t.antall} tilgjengelig` : 'Utlånt'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons — FIX: passes language/format selection to ReserverModal */}
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <button onClick={handleReserverFromDetail}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, var(--ocean), var(--fjord))' }}>
                  {getTotalTilgjengelig(detailBook) > 0 ? 'Bestill' : 'Sett i kø'}
                </button>
                {harDigitalFormat(detailBook) && (
                  <Link href="/digitalt" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'var(--fjord)' }}>Lån digitalt</Link>
                )}
                <button onClick={() => setShowDetailModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--mist)', color: 'var(--ink-soft)' }}>Lukk</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIX: ReserverModal now receives language/format + full book metadata */}
      {selectedBook && <ReserverModal isOpen={showReserverModal} onClose={() => setShowReserverModal(false)}
        bok={{
          id: selectedBook.id,
          tittel: selectedBook.tittel,
          forfatter: selectedBook.forfatter,
          isbn: selectedBook.isbn || '',
          coverUrl: selectedBook.bildeUrl || undefined,
          språk: selectedBook.språk,
          formater: selectedBook.formater,
        }}
        valgtSpråk={detailSpråk}
        valgtFormat={detailFormat}
        onSuccess={handleReservasjonSuccess} />}
    </div>
  )
}
