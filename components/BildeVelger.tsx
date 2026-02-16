'use client'

import { useState, useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════
   BildeVelger — Integrert arbeidsflyt
   Steg 1: Velg bilde (fra bibliotek eller URL)
   Steg 2: Rediger (valgfritt — juster filtre + beskjær)
   Steg 3: Lagre redigert bilde i biblioteket med navn
   ═══════════════════════════════════════════════════════ */

interface Bilde {
  id: string
  url: string
  tittel: string
  kilde: 'katalog' | 'anbefaling' | 'arrangement' | 'opplastet'
  kildeNavn?: string
  tags: string[]
}

interface BildeVelgerProps {
  onVelg: (url: string) => void
  onLukk: () => void
  gjeldendeBildeUrl?: string
}

/* ───── SVG Icons ───── */
const ic = {
  image: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  book: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  calendar: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  check: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>,
  sun: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  contrast: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z"/></svg>,
  palette: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  scissors: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  undo: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
  save: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  arrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>,
  arrowRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>,
  skipForward: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>,
}

const KILDE_LABELS: Record<string, { label: string; icon: React.ReactNode; farge: string }> = {
  alle: { label: 'Alle', icon: ic.image, farge: 'bg-gray-100 text-gray-800' },
  katalog: { label: 'Katalog', icon: ic.book, farge: 'bg-blue-100 text-blue-800' },
  anbefaling: { label: 'Anbefalinger', icon: ic.star, farge: 'bg-purple-100 text-purple-800' },
  arrangement: { label: 'Arrangementer', icon: ic.calendar, farge: 'bg-green-100 text-green-800' },
  opplastet: { label: 'Opplastede', icon: ic.upload, farge: 'bg-orange-100 text-orange-800' },
}

/* ───── Filter presets ───── */
interface Filters { brightness: number; contrast: number; saturate: number }
const DEFAULT_FILTERS: Filters = { brightness: 100, contrast: 100, saturate: 100 }
const PRESETS = [
  { navn: 'Original', filters: { ...DEFAULT_FILTERS } },
  { navn: 'Lys', filters: { brightness: 125, contrast: 110, saturate: 100 } },
  { navn: 'Mørk', filters: { brightness: 75, contrast: 115, saturate: 100 } },
  { navn: 'S/H', filters: { brightness: 100, contrast: 110, saturate: 0 } },
  { navn: 'Vintage', filters: { brightness: 105, contrast: 95, saturate: 70 } },
  { navn: 'Vibrant', filters: { brightness: 105, contrast: 115, saturate: 150 } },
]

function buildFilterCSS(f: Filters) {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%)`
}

type Steg = 'velg' | 'rediger' | 'lagre'

export default function BildeVelger({ onVelg, onLukk, gjeldendeBildeUrl }: BildeVelgerProps) {
  /* ───── Steg-state ───── */
  const [steg, setSteg] = useState<Steg>('velg')
  const [valgtBildeUrl, setValgtBildeUrl] = useState('')
  const [valgtBildeTittel, setValgtBildeTittel] = useState('')
  const [erFraBibliotek, setErFraBibliotek] = useState(false)

  /* ───── Steg 1: Velg ───── */
  const [bilder, setBilder] = useState<Bilde[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [valgtKilde, setValgtKilde] = useState('alle')
  const [søk, setSøk] = useState('')
  const [egendefinertUrl, setEgendefinertUrl] = useState('')
  const [visLeggTil, setVisLeggTil] = useState(false)
  const [nyTittel, setNyTittel] = useState('')
  const [nyUrl, setNyUrl] = useState('')

  /* ───── Steg 2: Rediger ───── */
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS })
  const [cropMode, setCropMode] = useState(false)
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null)
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null)
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [appliedCrop, setAppliedCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [harEndringer, setHarEndringer] = useState(false)
  const imgContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* ───── Steg 3: Lagre ───── */
  const [lagreNavn, setLagreNavn] = useState('')
  const [redigertDataUrl, setRedigertDataUrl] = useState('')
  const [isLagring, setIsLagring] = useState(false)

  /* ═══════ STEG 1 — Velg bilde ═══════ */

  useEffect(() => { fetchBilder() }, [valgtKilde])

  const fetchBilder = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (valgtKilde !== 'alle') params.set('kilde', valgtKilde)
      const res = await fetch(`/api/bilder?${params}`)
      const data = await res.json()
      if (Array.isArray(data)) setBilder(data)
    } catch (e) { console.error('Fetch bilder error:', e) }
    finally { setIsLoading(false) }
  }

  const handleLeggTilBilde = async () => {
    if (!nyUrl) return
    try {
      const res = await fetch('/api/bilder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: nyUrl, tittel: nyTittel || 'Uten tittel', tags: [] }),
      })
      if (res.ok) { setNyUrl(''); setNyTittel(''); setVisLeggTil(false); fetchBilder() }
    } catch (e) { console.error(e) }
  }

  const filtrerteBilder = søk
    ? bilder.filter(b =>
        b.tittel.toLowerCase().includes(søk.toLowerCase()) ||
        b.tags.some(t => t.includes(søk.toLowerCase())) ||
        b.kildeNavn?.toLowerCase().includes(søk.toLowerCase()))
    : bilder

  /** Velg et bilde og gå til redigering */
  const velgBilde = (url: string, tittel: string, fraBibliotek: boolean) => {
    setValgtBildeUrl(url)
    setValgtBildeTittel(tittel)
    setErFraBibliotek(fraBibliotek)
    setFilters({ ...DEFAULT_FILTERS })
    setCropRect(null); setCropStart(null); setCropEnd(null); setCropMode(false)
    setAppliedCrop(null)
    setHarEndringer(false)
    setSteg('rediger')
  }

  /* ═══════ STEG 2 — Rediger bilde ═══════ */

  const filtersChanged = filters.brightness !== 100 || filters.contrast !== 100 || filters.saturate !== 100

  const handleFilterChange = (key: keyof Filters, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setHarEndringer(true)
  }

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS })
    setCropRect(null); setCropStart(null); setCropEnd(null); setCropMode(false)
    setAppliedCrop(null)
    setHarEndringer(false)
  }

  /* ── Crop handlers ── */
  const getRelativePos = (e: React.MouseEvent): { x: number; y: number } => {
    const rect = imgContainerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropMode) return
    e.preventDefault()
    const pos = getRelativePos(e)
    setCropStart(pos); setCropEnd(pos); setCropRect(null); setIsCropping(true)
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCropping || !cropStart) return
    e.preventDefault()
    setCropEnd(getRelativePos(e))
  }
  const handleMouseUp = () => {
    if (!isCropping || !cropStart || !cropEnd) return
    setIsCropping(false)
    const x = Math.min(cropStart.x, cropEnd.x)
    const y = Math.min(cropStart.y, cropEnd.y)
    const w = Math.abs(cropEnd.x - cropStart.x)
    const h = Math.abs(cropEnd.y - cropStart.y)
    if (w > 0.02 && h > 0.02) setCropRect({ x, y, w, h })
    else setCropRect(null)
  }

  const applyCrop = () => {
    console.log('[BildeVelger] applyCrop kalt, cropRect:', cropRect)
    if (!cropRect) { console.warn('[BildeVelger] cropRect er null, avbryter'); return }
    setAppliedCrop({ ...cropRect })
    setCropRect(null); setCropStart(null); setCropEnd(null); setCropMode(false)
    setHarEndringer(true)
    console.log('[BildeVelger] appliedCrop satt, harEndringer=true')
  }

  /** Eksporter bildet med crop + filtre til data-URL og gå til lagre-steg */
  const exportAndSave = () => {
    // Bruk proxy for å unngå CORS
    const proxyUrl = `/api/bilder/proxy?url=${encodeURIComponent(valgtBildeUrl)}`
    console.log('[BildeVelger] exportAndSave startet, proxyUrl:', proxyUrl.substring(0, 100))
    console.log('[BildeVelger] appliedCrop:', appliedCrop, 'filters:', filters)

    const img = new Image()
    img.onload = () => {
      console.log('[BildeVelger] Bilde lastet via proxy, size:', img.naturalWidth, 'x', img.naturalHeight)
      const canvas = canvasRef.current
      if (!canvas) { console.error('[BildeVelger] canvas ref er null!'); return }
      const ctx = canvas.getContext('2d')
      if (!ctx) { console.error('[BildeVelger] ctx er null!'); return }
      try {
        if (appliedCrop) {
          const sx = Math.round(appliedCrop.x * img.naturalWidth)
          const sy = Math.round(appliedCrop.y * img.naturalHeight)
          const sw = Math.round(appliedCrop.w * img.naturalWidth)
          const sh = Math.round(appliedCrop.h * img.naturalHeight)
          console.log('[BildeVelger] Crop coords:', { sx, sy, sw, sh })
          canvas.width = sw; canvas.height = sh
          ctx.filter = buildFilterCSS(filters)
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
        } else {
          canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
          ctx.filter = buildFilterCSS(filters)
          ctx.drawImage(img, 0, 0)
        }
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
        console.log('[BildeVelger] toDataURL OK, lengde:', dataUrl.length)
        setRedigertDataUrl(dataUrl)
      } catch (e) {
        console.error('[BildeVelger] Canvas export FEILET:', e)
        setRedigertDataUrl(valgtBildeUrl)
      }
      setLagreNavn(erFraBibliotek ? `${valgtBildeTittel} (redigert)` : valgtBildeTittel || 'Redigert bilde')
      setSteg('lagre')
    }
    img.onerror = (e) => {
      console.error('[BildeVelger] img.onerror via proxy:', e)
      setRedigertDataUrl(valgtBildeUrl)
      setLagreNavn(erFraBibliotek ? `${valgtBildeTittel} (redigert)` : valgtBildeTittel || 'Redigert bilde')
      setSteg('lagre')
    }
    img.src = proxyUrl
  }

  /** Bruk bildet uten endringer */
  const brukUtenEndringer = () => {
    console.log('[BildeVelger] brukUtenEndringer, URL:', valgtBildeUrl.substring(0, 80))
    onVelg(valgtBildeUrl)
  }

  /* ── Crop overlay ── */
  const cropOverlay = (() => {
    const start = isCropping ? cropStart : (cropRect ? { x: cropRect.x, y: cropRect.y } : null)
    const end = isCropping ? cropEnd : (cropRect ? { x: cropRect.x + cropRect.w, y: cropRect.y + cropRect.h } : null)
    if (!start || !end) return null
    return {
      left: `${Math.min(start.x, end.x) * 100}%`,
      top: `${Math.min(start.y, end.y) * 100}%`,
      width: `${Math.abs(end.x - start.x) * 100}%`,
      height: `${Math.abs(end.y - start.y) * 100}%`,
    }
  })()

  /* ═══════ STEG 3 — Lagre i biblioteket ═══════ */

  const handleLagre = async () => {
    if (!lagreNavn.trim()) return
    setIsLagring(true)
    console.log('[BildeVelger] handleLagre startet')
    console.log('[BildeVelger] lagreNavn:', lagreNavn)
    console.log('[BildeVelger] redigertDataUrl lengde:', redigertDataUrl.length, 'starter med:', redigertDataUrl.substring(0, 50))
    try {
      const res = await fetch('/api/bilder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: redigertDataUrl,
          tittel: lagreNavn.trim(),
          tags: ['redigert'],
        }),
      })
      const responseData = await res.json()
      console.log('[BildeVelger] API respons status:', res.status, 'data:', responseData)
      console.log('[BildeVelger] Kaller onVelg med URL lengde:', redigertDataUrl.length)
      onVelg(redigertDataUrl)
    } catch (e) {
      console.error('[BildeVelger] Lagre feilet:', e)
      onVelg(redigertDataUrl)
    } finally {
      setIsLagring(false)
    }
  }

  /* ═══════ RENDER ═══════ */

  const stegTitler: Record<Steg, { tittel: string; beskrivelse: string }> = {
    velg: { tittel: 'Velg bilde', beskrivelse: 'Fra biblioteket eller lim inn URL' },
    rediger: { tittel: 'Rediger bilde', beskrivelse: 'Juster filtre og beskjær — eller bruk bildet som det er' },
    lagre: { tittel: 'Lagre i biblioteket', beskrivelse: 'Gi bildet et navn og lagre' },
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onLukk}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {steg !== 'velg' && (
              <button onClick={() => {
                if (steg === 'lagre') setSteg('rediger')
                else { setSteg('velg'); resetFilters() }
              }}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                {ic.arrowLeft}
              </button>
            )}
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">{ic.image}</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{stegTitler[steg].tittel}</h2>
              <p className="text-sm text-gray-500">{stegTitler[steg].beskrivelse}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Steg-indikator */}
            <div className="hidden sm:flex items-center gap-1">
              {(['velg', 'rediger', 'lagre'] as Steg[]).map((s, i) => {
                const stegNr = ['velg', 'rediger', 'lagre'].indexOf(steg)
                const sNr = i
                const done = sNr < stegNr
                const active = s === steg
                return (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      active ? 'bg-indigo-600 text-white' : done ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-400'
                    }`}>{i + 1}</div>
                    {i < 2 && <div className={`w-6 h-px ${done || active ? 'bg-indigo-300' : 'bg-gray-200'}`} />}
                  </div>
                )
              })}
            </div>
            <button onClick={onLukk} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
        </div>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* ═══════ STEG 1: VELG ═══════ */}
        {steg === 'velg' && (
          <>
            {/* Søk + filtre */}
            <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-1 relative">
                  <input type="text" value={søk} onChange={e => setSøk(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    placeholder="Søk i bilder..." />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{ic.search}</span>
                </div>
                <button onClick={() => setVisLeggTil(!visLeggTil)}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  + Legg til
                </button>
              </div>
              <div className="flex space-x-2 flex-wrap gap-y-1">
                {Object.entries(KILDE_LABELS).map(([key, { label, icon, farge }]) => (
                  <button key={key} onClick={() => setValgtKilde(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      valgtKilde === key ? 'bg-indigo-600 text-white' : farge + ' hover:opacity-80'
                    }`}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legg til nytt bilde */}
            {visLeggTil && (
              <div className="px-6 py-4 border-b border-gray-100 bg-blue-50 flex-shrink-0">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bilde-URL</label>
                    <input type="text" value={nyUrl} onChange={e => setNyUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://..." />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tittel</label>
                    <input type="text" value={nyTittel} onChange={e => setNyTittel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Beskriv bildet" />
                  </div>
                  <button onClick={handleLeggTilBilde}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Lagre</button>
                </div>
              </div>
            )}

            {/* Egen URL input */}
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500 whitespace-nowrap">Eller lim inn URL direkte:</span>
                <input type="text" value={egendefinertUrl} onChange={e => setEgendefinertUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="https://example.com/bilde.jpg" />
                {egendefinertUrl && (
                  <button onClick={() => velgBilde(egendefinertUrl, '', false)}
                    className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    Velg {ic.arrowRight}
                  </button>
                )}
              </div>
            </div>

            {/* Bilderutenett */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="text-center py-12 text-gray-500">Laster bilder...</div>
              ) : filtrerteBilder.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">{ic.image}</div>
                  <p>Ingen bilder funnet</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {filtrerteBilder.map(bilde => {
                    const erValgt = gjeldendeBildeUrl === bilde.url
                    return (
                      <button key={bilde.id} onClick={() => velgBilde(bilde.url, bilde.tittel, true)}
                        className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg ${
                          erValgt ? 'border-indigo-600 ring-2 ring-indigo-600/30' : 'border-transparent hover:border-gray-300'
                        }`}>
                        <img src={bilde.url} alt={bilde.tittel}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 75"><rect fill="%23f3f4f6" width="100" height="75"/><text x="50" y="40" text-anchor="middle" fill="%239ca3af" font-size="10">Feil</text></svg>' }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-medium truncate">{bilde.tittel}</p>
                          <span className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 text-[10px] rounded ${KILDE_LABELS[bilde.kilde]?.farge || 'bg-gray-100'}`}>
                            {KILDE_LABELS[bilde.kilde]?.icon} {KILDE_LABELS[bilde.kilde]?.label}
                          </span>
                        </div>
                        {erValgt && (
                          <div className="absolute top-2 right-2 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">{ic.check}</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════ STEG 2: REDIGER ═══════ */}
        {steg === 'rediger' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden">
              {/* Bildeforhåndsvisning */}
              <div className="col-span-2 p-5 flex flex-col overflow-hidden">
                <div ref={imgContainerRef}
                  className={`relative bg-gray-100 rounded-xl overflow-hidden flex-1 min-h-0 ${cropMode ? 'cursor-crosshair' : ''}`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => { if (isCropping) handleMouseUp() }}>
                  <img src={valgtBildeUrl} alt="Redigering"
                    className="w-full h-full object-contain select-none"
                    style={{
                      filter: buildFilterCSS(filters),
                      ...(appliedCrop && !cropMode ? {
                        clipPath: `inset(${appliedCrop.y * 100}% ${(1 - appliedCrop.x - appliedCrop.w) * 100}% ${(1 - appliedCrop.y - appliedCrop.h) * 100}% ${appliedCrop.x * 100}%)`,
                      } : {}),
                    }}
                    draggable={false} />

                  {/* Crop overlay */}
                  {cropMode && (isCropping || cropRect) && cropOverlay && (
                    <>
                      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                      <div className="absolute border-2 border-white pointer-events-none"
                        style={{ ...cropOverlay, boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)', background: 'transparent' }}>
                        {cropRect && !isCropping && (
                          <>
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-gray-400 rounded-sm" />
                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-gray-400 rounded-sm" />
                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-gray-400 rounded-sm" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-gray-400 rounded-sm" />
                            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {/* Crop-handlinger — overlay inne i bildet */}
                  {cropMode && cropRect && !isCropping && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2.5 z-10"
                      onMouseDown={e => e.stopPropagation()}>
                      <button onClick={applyCrop}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                        {ic.scissors} Beskjær
                      </button>
                      <button onClick={() => { setCropRect(null); setCropStart(null); setCropEnd(null) }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">Avbryt</button>
                      <span className="text-xs text-gray-500">{Math.round(cropRect.w * 100)}% &times; {Math.round(cropRect.h * 100)}%</span>
                    </div>
                  )}
                  {cropMode && !cropRect && !isCropping && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow px-4 py-2 z-10">
                      <p className="text-sm text-gray-600">Dra over bildet for å velge beskjæringsområde</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Kontrollpanel */}
              <div className="border-l border-gray-200 p-5 overflow-y-auto bg-gray-50/50">
                {/* Verktøy */}
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Verktøy</h4>
                  <button onClick={() => setCropMode(!cropMode)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-2 ${
                      cropMode ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}>
                    {ic.scissors} Beskjær
                  </button>
                  {appliedCrop && (
                    <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-700">{ic.check}</span>
                      <span className="text-xs text-green-700 flex-1">Beskjæring brukt</span>
                      <button onClick={() => { setAppliedCrop(null); setHarEndringer(filters.brightness !== 100 || filters.contrast !== 100 || filters.saturate !== 100) }}
                        className="text-xs text-green-600 hover:text-green-800 font-medium">Fjern</button>
                    </div>
                  )}
                  <button onClick={resetFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100">
                    {ic.undo} Tilbakestill
                  </button>
                </div>

                {/* Forhåndsinnstillinger */}
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Forhåndsinnstillinger</h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PRESETS.map(p => (
                      <button key={p.navn} onClick={() => { setFilters({ ...p.filters }); setHarEndringer(true) }}
                        className="p-1.5 border border-gray-200 rounded-lg hover:border-indigo-400 transition-colors text-center bg-white">
                        <div className="w-full h-6 rounded bg-gray-200 mb-1 overflow-hidden">
                          {valgtBildeUrl && <img src={valgtBildeUrl} alt="" className="w-full h-full object-cover"
                            style={{ filter: buildFilterCSS(p.filters) }} />}
                        </div>
                        <span className="text-[10px] text-gray-600">{p.navn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Justeringer */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Justeringer</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'brightness' as const, label: 'Lysstyrke', icon: ic.sun },
                      { key: 'contrast' as const, label: 'Kontrast', icon: ic.contrast },
                      { key: 'saturate' as const, label: 'Metning', icon: ic.palette },
                    ].map(s => (
                      <div key={s.key}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="flex items-center gap-1 text-sm text-gray-600">{s.icon} {s.label}</label>
                          <span className="text-xs font-mono text-gray-500">{filters[s.key]}%</span>
                        </div>
                        <input type="range" min={0} max={200} value={filters[s.key]}
                          onChange={e => handleFilterChange(s.key, parseInt(e.target.value))}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Handlingsknapper (fast bunn) */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-200 bg-white flex-shrink-0">
              <button onClick={brukUtenEndringer}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                {ic.skipForward} Bruk uten endringer
              </button>
              <button onClick={exportAndSave}
                disabled={!harEndringer && !filtersChanged}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {ic.save} Lagre redigert bilde {ic.arrowRight}
              </button>
            </div>
          </div>
        )}

        {/* ═══════ STEG 3: LAGRE ═══════ */}
        {steg === 'lagre' && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-lg mx-auto">
              {/* Forhåndsvisning */}
              <div className="bg-gray-100 rounded-xl overflow-hidden mb-6">
                <img src={redigertDataUrl || valgtBildeUrl} alt="Redigert"
                  className="w-full max-h-[300px] object-contain" />
              </div>

              {/* Lagre-skjema */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Lagre i bildebiblioteket</h4>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bildenavn *</label>
                  <input type="text" value={lagreNavn} onChange={e => setLagreNavn(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    placeholder="Gi bildet et beskrivende navn..."
                    autoFocus />
                </div>

                {erFraBibliotek && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    Originalen beholdes i biblioteket. Det redigerte bildet lagres som en ny versjon.
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <button onClick={handleLagre}
                    disabled={!lagreNavn.trim() || isLagring}
                    className="flex-1 flex items-center justify-center gap-1.5 px-5 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {ic.save} {isLagring ? 'Lagrer...' : 'Lagre og bruk bildet'}
                  </button>
                  <button onClick={() => setSteg('rediger')}
                    className="px-5 py-3 text-gray-600 hover:text-gray-900 text-sm">
                    Tilbake
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
