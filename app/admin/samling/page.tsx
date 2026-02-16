'use client'

import { useState, useEffect } from 'react'
import BildeVelger from '@/components/BildeVelger'

/* ───── Admin tokens ───── */
const admin = {
  primary: '#6366f1',
  primarySoft: 'rgba(99,102,241,0.08)',
  accent: '#8b5cf6',
  success: '#10b981',
  successSoft: 'rgba(16,185,129,0.08)',
  warning: '#f59e0b',
  warningSoft: 'rgba(245,158,11,0.08)',
  danger: '#ef4444',
  ink: '#1e293b',
  inkSoft: '#475569',
  inkMuted: '#94a3b8',
  border: 'rgba(0,0,0,0.06)',
  card: '#ffffff',
}

/* ───── SVG Icons ───── */
const icons = {
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  image: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  imagePlus: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><path d="M19 2v6M16 5h6"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  starOutline: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>,
  book: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  x: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  link: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  filter: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
}

interface Tittel {
  id: string; tittel: string; forfatter: string; sjanger: string; bildeUrl: string | null
  isbn: string | null; beskrivelse: string | null; utgitt: string | null
  språk?: string[]; formater?: string[]
}

export default function SamlingPage() {
  const [titler, setTitler] = useState<Tittel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [søk, setSøk] = useState('')
  const [sjangerFilter, setSjangerFilter] = useState('Alle')
  const [fremhevede, setFremhevede] = useState<string[]>([])
  const [showBildeVelger, setShowBildeVelger] = useState(false)
  const [bildeVelgerBokId, setBildeVelgerBokId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [savingImageFor, setSavingImageFor] = useState<string | null>(null)

  useEffect(() => { fetchKatalog() }, [])

  const fetchKatalog = async () => {
    try {
      const res = await fetch('/api/katalog')
      const data = await res.json()
      if (Array.isArray(data)) setTitler(data)
    } catch (e) { console.error(e) } finally { setIsLoading(false) }
  }

  const toast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000) }

  const toggleFremhev = (id: string) => {
    if (fremhevede.includes(id)) {
      setFremhevede(prev => prev.filter(i => i !== id))
      toast('Fjernet fra forsiden')
    } else {
      setFremhevede(prev => [...prev, id])
      toast('Fremhevet på forsiden!')
    }
  }

  const openBildeVelger = (bokId: string) => {
    setBildeVelgerBokId(bokId)
    setShowBildeVelger(true)
  }

  const handleVelgBilde = async (url: string) => {
    if (!bildeVelgerBokId) return
    setSavingImageFor(bildeVelgerBokId)
    setShowBildeVelger(false)

    try {
      const res = await fetch('/api/katalog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bildeVelgerBokId, bildeUrl: url }),
      })
      if (res.ok) {
        // Oppdater lokalt
        setTitler(prev => prev.map(t => t.id === bildeVelgerBokId ? { ...t, bildeUrl: url } : t))
        toast('Bilde lagret — vises nå i katalog, anbefalinger og arrangementer')
      } else {
        toast('Kunne ikke lagre bilde')
      }
    } catch (e) {
      toast('Feil ved lagring')
    } finally {
      setSavingImageFor(null)
      setBildeVelgerBokId(null)
    }
  }

  const handleFjernBilde = async (bokId: string) => {
    setSavingImageFor(bokId)
    try {
      const res = await fetch('/api/katalog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bokId, bildeUrl: null }),
      })
      if (res.ok) {
        setTitler(prev => prev.map(t => t.id === bokId ? { ...t, bildeUrl: null } : t))
        toast('Bilde fjernet')
      }
    } catch (e) { toast('Feil') } finally { setSavingImageFor(null) }
  }

  const sjangre = ['Alle', ...new Set(titler.map(t => t.sjanger))]
  const filtered = titler.filter(t => {
    const matchSøk = !søk || t.tittel.toLowerCase().includes(søk.toLowerCase()) || t.forfatter.toLowerCase().includes(søk.toLowerCase())
    const matchSjanger = sjangerFilter === 'Alle' || t.sjanger === sjangerFilter
    return matchSøk && matchSjanger
  })

  const medBilde = titler.filter(t => t.bildeUrl).length
  const utenBilde = titler.filter(t => !t.bildeUrl).length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: admin.ink }}>Samling</h1>
          <p className="text-sm mt-1" style={{ color: admin.inkMuted }}>Administrer bilder og fremhev titler fra katalogen.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs" style={{ color: admin.inkMuted }}>
            <span className="flex items-center gap-1">
              <span style={{ color: admin.success }}>{icons.check}</span>
              {medBilde} med bilde
            </span>
            <span className="flex items-center gap-1">
              <span style={{ color: admin.warning }}>{icons.image}</span>
              {utenBilde} uten bilde
            </span>
          </div>
          {fremhevede.length > 0 && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ background: admin.warningSoft, color: '#92400e' }}>
              {fremhevede.length} fremhevet
            </span>
          )}
        </div>
      </div>

      {/* Fremhevede */}
      {fremhevede.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: admin.warningSoft, border: '1px solid rgba(245,158,11,0.12)' }}>
          <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#92400e' }}>Fremhevet på forsiden</div>
          <div className="flex flex-wrap gap-2">
            {titler.filter(t => fremhevede.includes(t.id)).map(t => (
              <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: '#fff', border: '1px solid rgba(245,158,11,0.2)', color: admin.ink }}>
                {t.bildeUrl && <img src={t.bildeUrl} alt="" className="w-5 h-5 rounded object-cover" />}
                {t.tittel}
                <button onClick={() => toggleFremhev(t.id)} className="hover:text-red-500 transition-colors" style={{ color: admin.inkMuted }}>{icons.x}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: admin.inkMuted }}>{icons.search}</div>
          <input type="text" value={søk} onChange={e => setSøk(e.target.value)} placeholder="Søk tittel eller forfatter..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            style={{ background: admin.card, border: `1px solid ${admin.border}`, color: admin.ink }} />
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.03)' }}>
          {sjangre.map(s => (
            <button key={s} onClick={() => setSjangerFilter(s)}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: sjangerFilter === s ? admin.card : 'transparent',
                color: sjangerFilter === s ? admin.primary : admin.inkMuted,
                boxShadow: sjangerFilter === s ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-sm" style={{ color: admin.inkMuted }}>Laster samling...</div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: admin.card, border: `1px solid ${admin.border}` }}>
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_140px_100px_100px_80px] gap-4 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: 'rgba(0,0,0,0.02)', color: admin.inkMuted, borderBottom: `1px solid ${admin.border}` }}>
            <div className="w-16">Bilde</div>
            <div>Tittel / Forfatter</div>
            <div>Sjanger / Format</div>
            <div>ISBN</div>
            <div>Utgitt</div>
            <div className="text-right">Handlinger</div>
          </div>

          {/* Rows */}
          <div>
            {filtered.map((t, idx) => (
              <div key={t.id}
                className="grid grid-cols-[auto_1fr_140px_100px_100px_80px] gap-4 px-5 py-3 items-center transition-colors hover:bg-gray-50/50 group"
                style={{ borderBottom: idx < filtered.length - 1 ? `1px solid ${admin.border}` : 'none' }}>

                {/* Cover thumbnail */}
                <div className="w-16">
                  {savingImageFor === t.id ? (
                    <div className="w-12 h-16 rounded-lg flex items-center justify-center animate-pulse"
                      style={{ background: 'rgba(99,102,241,0.06)' }}>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={admin.primary} strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    </div>
                  ) : t.bildeUrl ? (
                    <div className="relative group/img">
                      <img src={t.bildeUrl} alt={t.tittel} className="w-12 h-16 rounded-lg object-cover" />
                      <div className="absolute inset-0 rounded-lg flex items-center justify-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity"
                        style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <button onClick={() => openBildeVelger(t.id)} className="w-6 h-6 rounded flex items-center justify-center text-white bg-white/20 hover:bg-white/30">
                          {icons.image}
                        </button>
                        <button onClick={() => handleFjernBilde(t.id)} className="w-6 h-6 rounded flex items-center justify-center text-white bg-white/20 hover:bg-red-500/80">
                          {icons.trash}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => openBildeVelger(t.id)}
                      className="w-12 h-16 rounded-lg flex flex-col items-center justify-center gap-1 transition-all hover:scale-105"
                      style={{ background: 'rgba(99,102,241,0.04)', border: '1.5px dashed rgba(99,102,241,0.2)', color: admin.primary }}>
                      {icons.imagePlus}
                    </button>
                  )}
                </div>

                {/* Title + Author */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold truncate" style={{ color: admin.ink }}>{t.tittel}</h4>
                    {t.bildeUrl && (
                      <span className="flex-shrink-0" title="Har bilde">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill={admin.success} stroke={admin.success} strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: admin.inkMuted }}>{t.forfatter}</p>
                </div>

                {/* Genre + formats */}
                <div>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{ background: admin.primarySoft, color: admin.primary }}>{t.sjanger}</span>
                  {t.formater && (
                    <p className="text-[10px] mt-1 truncate" style={{ color: admin.inkMuted }}>
                      {t.formater.join(', ')}
                    </p>
                  )}
                </div>

                {/* ISBN */}
                <div className="text-[11px] font-mono" style={{ color: admin.inkMuted }}>{t.isbn || '—'}</div>

                {/* Year */}
                <div className="text-xs" style={{ color: admin.inkMuted }}>{t.utgitt || '—'}</div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => toggleFremhev(t.id)} title={fremhevede.includes(t.id) ? 'Fjern fremheving' : 'Fremhev'}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      background: fremhevede.includes(t.id) ? admin.warningSoft : 'transparent',
                      color: fremhevede.includes(t.id) ? admin.warning : admin.inkMuted,
                    }}>
                    {fremhevede.includes(t.id) ? icons.star : icons.starOutline}
                  </button>
                  <button onClick={() => openBildeVelger(t.id)} title="Velg bilde"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-indigo-50"
                    style={{ color: admin.inkMuted }}>
                    {icons.image}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm" style={{ color: admin.inkMuted }}>
              Ingen treff på «{søk}»
            </div>
          )}
        </div>
      )}

      {/* Info box */}
      <div className="rounded-xl p-4 flex items-start gap-3"
        style={{ background: admin.primarySoft, border: '1px solid rgba(99,102,241,0.1)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(99,102,241,0.1)', color: admin.primary }}>{icons.link}</div>
        <div>
          <h4 className="text-xs font-bold" style={{ color: admin.ink }}>Sentralt bildebibliotek</h4>
          <p className="text-[11px] mt-0.5" style={{ color: admin.inkSoft }}>
            Bilder du legger til her vises automatisk i katalogen, anbefalinger, arrangementer og på forsiden.
            Du kan overstyre bildet per anbefaling eller arrangement ved å velge et annet bilde direkte der.
          </p>
        </div>
      </div>

      {/* BildeVelger modal */}
      {showBildeVelger && (
        <BildeVelger
          onVelg={handleVelgBilde}
          onLukk={() => { setShowBildeVelger(false); setBildeVelgerBokId(null) }}
          gjeldendeBildeUrl={titler.find(t => t.id === bildeVelgerBokId)?.bildeUrl || undefined}
        />
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg animate-fade-in"
          style={{ background: admin.ink }}>
          <span style={{ color: admin.success }}>{icons.check}</span>
          {toastMsg}
        </div>
      )}
    </div>
  )
}
