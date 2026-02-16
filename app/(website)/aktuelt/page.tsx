'use client'

import { useState, useEffect } from 'react'
import PublicHeader from '@/components/PublicHeader'

interface Artikkel {
  id: string; tittel: string; ingress: string; innhold: string; bildeUrl: string | null
  kategori: string; forfatter: string; publisert: boolean; opprettet: string; oppdatert: string
}

const KAT_FARGE: Record<string, { bg: string; text: string }> = {
  'Nyheter': { bg: 'rgba(15,61,84,0.08)', text: 'var(--ocean)' },
  'Kampanjer': { bg: 'rgba(91,74,138,0.08)', text: '#5b4a8a' },
  'Digitalt': { bg: 'rgba(26,122,158,0.08)', text: 'var(--fjord)' },
  'Arrangementer': { bg: 'rgba(199,91,63,0.08)', text: 'var(--terracotta)' },
  'Tips': { bg: 'rgba(45,107,78,0.08)', text: 'var(--forest)' },
  'Om biblioteket': { bg: 'rgba(0,0,0,0.04)', text: 'var(--ink-muted)' },
}
const DEFAULT_FARGE = { bg: 'rgba(0,0,0,0.04)', text: 'var(--ink-muted)' }

export default function ArtiklerNettside() {
  const [artikler, setArtikler] = useState<Artikkel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [valgt, setValgt] = useState<Artikkel | null>(null)
  const [filterKat, setFilterKat] = useState('Alle')

  useEffect(() => {
    fetch('/api/artikler?publisert=true').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setArtikler(data.sort((a: Artikkel, b: Artikkel) => new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime()))
    }).catch(() => {}).finally(() => setIsLoading(false))
  }, [])

  const filtrerte = filterKat === 'Alle' ? artikler : artikler.filter(a => a.kategori === filterKat)
  const kategorier = ['Alle', ...Array.from(new Set(artikler.map(a => a.kategori)))]
  const fmtDato = (iso: string) => new Date(iso).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
  const katStyle = (k: string) => KAT_FARGE[k] || DEFAULT_FARGE

  return (
    <div className="min-h-screen" style={{ background: 'var(--white-warm, #fdfcfa)' }}>
      <PublicHeader />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean) 100%)' }}>
        <div className="container-custom py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Aktuelt
          </h1>
          <p className="text-sm" style={{ color: 'rgba(212,228,237,0.6)' }}>Nyheter, tips og artikler fra biblioteket</p>
        </div>
      </div>

      <main className="container-custom py-8 pb-16">
        {/* Full article view */}
        {valgt ? (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <button onClick={() => setValgt(null)}
              className="flex items-center gap-2 text-sm font-medium mb-8 transition-colors"
              style={{ color: 'var(--ocean)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              Tilbake til artikler
            </button>

            <article>
              {valgt.bildeUrl && (
                <div className="rounded-2xl overflow-hidden mb-8">
                  <img src={valgt.bildeUrl} alt={valgt.tittel} className="w-full h-72 md:h-80 object-cover" />
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <span className="badge" style={{ background: katStyle(valgt.kategori).bg, color: katStyle(valgt.kategori).text }}>{valgt.kategori}</span>
                <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>{fmtDato(valgt.opprettet)}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{valgt.tittel}</h1>

              {valgt.ingress && (
                <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--ink-soft)', fontWeight: 300 }}>{valgt.ingress}</p>
              )}

              <div className="space-y-5">
                {valgt.innhold.split('\n').map((avsnitt, i) =>
                  avsnitt.trim() ? <p key={i} className="text-sm leading-[1.8]" style={{ color: 'var(--ink-soft)' }}>{avsnitt}</p> : null
                )}
              </div>

              <div className="mt-10 pt-6 flex items-center gap-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'var(--ocean)' }}>{valgt.forfatter.charAt(0)}</div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{valgt.forfatter}</div>
                  <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>Publisert {fmtDato(valgt.opprettet)}</div>
                </div>
              </div>
            </article>

            {/* Related */}
            {artikler.filter(a => a.id !== valgt.id).length > 0 && (
              <div className="mt-16">
                <div className="section-divider mb-4" />
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Flere artikler</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {artikler.filter(a => a.id !== valgt.id).slice(0, 3).map(art => (
                    <button key={art.id} onClick={() => { setValgt(art); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      className="text-left group rounded-2xl overflow-hidden card-lift"
                      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
                      {art.bildeUrl ? (
                        <div className="h-40 overflow-hidden">
                          <img src={art.bildeUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                      ) : (
                        <div className="h-40 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--sand), var(--sand-warm))' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sand-deep)" strokeWidth="1"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
                        </div>
                      )}
                      <div className="p-4">
                        <span className="badge mb-2" style={{ background: katStyle(art.kategori).bg, color: katStyle(art.kategori).text, fontSize: '10px' }}>{art.kategori}</span>
                        <h3 className="font-bold text-sm leading-snug group-hover:text-[#0f3d54] transition-colors"
                          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{art.tittel}</h3>
                        <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>{fmtDato(art.opprettet)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* List view */
          <div className="max-w-6xl mx-auto">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {kategorier.map(k => (
                <button key={k} onClick={() => setFilterKat(k)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    background: filterKat === k ? 'var(--ocean)' : 'white',
                    color: filterKat === k ? '#fff' : 'var(--ink-soft)',
                    border: filterKat === k ? 'none' : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: filterKat === k ? '0 2px 8px rgba(15,61,84,0.25)' : 'none',
                  }}>
                  {k} {k !== 'Alle' && <span className="ml-1 opacity-60">({artikler.filter(a => a.kategori === k).length})</span>}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center py-16" style={{ color: 'var(--ink-muted)' }}>Laster artikler...</div>
            ) : filtrerte.length === 0 ? (
              <div className="text-center py-16">
                <svg className="mx-auto mb-4 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
                <p style={{ color: 'var(--ink-muted)' }}>Ingen artikler {filterKat !== 'Alle' ? `i «${filterKat}»` : 'enda'}</p>
              </div>
            ) : (
              <>
                {/* Hero article */}
                {filtrerte.length > 0 && (() => {
                  const hero = filtrerte[0]
                  return (
                    <button onClick={() => setValgt(hero)} className="w-full text-left mb-10 group">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {hero.bildeUrl ? (
                          <div className="rounded-2xl overflow-hidden">
                            <img src={hero.bildeUrl} alt="" className="w-full h-64 md:h-72 object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>
                        ) : (
                          <div className="rounded-2xl h-64 md:h-72 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, var(--sand), var(--sand-warm))' }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--sand-deep)" strokeWidth="0.8"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
                          </div>
                        )}
                        <div>
                          <span className="badge mb-3" style={{ background: katStyle(hero.kategori).bg, color: katStyle(hero.kategori).text }}>{hero.kategori}</span>
                          <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3 group-hover:text-[#0f3d54] transition-colors"
                            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{hero.tittel}</h2>
                          {hero.ingress && <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--ink-soft)' }}>{hero.ingress}</p>}
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--ink-muted)' }}>
                            <span>{hero.forfatter}</span><span>·</span><span>{fmtDato(hero.opprettet)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })()}

                {/* Rest */}
                {filtrerte.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtrerte.slice(1).map(art => (
                      <button key={art.id} onClick={() => { setValgt(art); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className="text-left group rounded-2xl overflow-hidden card-lift"
                        style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
                        {art.bildeUrl ? (
                          <div className="h-44 overflow-hidden">
                            <img src={art.bildeUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          </div>
                        ) : (
                          <div className="h-44 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--sand), var(--sand-warm))' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sand-deep)" strokeWidth="1"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
                          </div>
                        )}
                        <div className="p-4">
                          <span className="badge mb-2" style={{ background: katStyle(art.kategori).bg, color: katStyle(art.kategori).text, fontSize: '10px' }}>{art.kategori}</span>
                          <h3 className="font-bold text-sm leading-snug mb-1 group-hover:text-[#0f3d54] transition-colors"
                            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{art.tittel}</h3>
                          {art.ingress && <p className="text-xs line-clamp-2" style={{ color: 'var(--ink-muted)' }}>{art.ingress}</p>}
                          <div className="flex items-center gap-2 mt-2 text-[10px]" style={{ color: 'var(--ink-muted)' }}>
                            <span>{art.forfatter}</span><span>·</span><span>{fmtDato(art.opprettet)}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
