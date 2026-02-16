'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import BildeVelger from '@/components/BildeVelger'

// ═══════════════════════════════════════════════════════
// BILDEEDITOR — fungerende slidere + beskjæring
// ═══════════════════════════════════════════════════════

interface FilterValues {
  brightness: number
  contrast: number
  saturate: number
  blur: number
  grayscale: number
  sepia: number
}

const DEFAULT_FILTERS: FilterValues = { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0 }

/* ───── SVG Icons ───── */
const ic = {
  sun: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  contrast: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z"/></svg>,
  palette: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  droplet: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>,
  square: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.3"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
  circle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/><circle cx="12" cy="12" r="10"/></svg>,
  image: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>,
  imageLg: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>,
  save: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  loader: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  scissors: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  undo: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
}

const FILTER_CONFIG = [
  { key: 'brightness' as const, label: 'Lysstyrke', ikon: ic.sun, min: 0, max: 200, unit: '%' },
  { key: 'contrast' as const, label: 'Kontrast', ikon: ic.contrast, min: 0, max: 200, unit: '%' },
  { key: 'saturate' as const, label: 'Metning', ikon: ic.palette, min: 0, max: 200, unit: '%' },
  { key: 'blur' as const, label: 'Uskarphet', ikon: ic.droplet, min: 0, max: 20, unit: 'px' },
  { key: 'grayscale' as const, label: 'Gråtone', ikon: ic.square, min: 0, max: 100, unit: '%' },
  { key: 'sepia' as const, label: 'Sepia', ikon: ic.circle, min: 0, max: 100, unit: '%' },
]

const FORHÅNDSINNSTILLINGER = [
  { navn: 'Original', filters: { ...DEFAULT_FILTERS } },
  { navn: 'Lys', filters: { ...DEFAULT_FILTERS, brightness: 130, contrast: 110 } },
  { navn: 'Mørk', filters: { ...DEFAULT_FILTERS, brightness: 70, contrast: 120 } },
  { navn: 'Svart-hvitt', filters: { ...DEFAULT_FILTERS, grayscale: 100 } },
  { navn: 'Vintage', filters: { ...DEFAULT_FILTERS, sepia: 60, saturate: 80, contrast: 110 } },
  { navn: 'Vibrant', filters: { ...DEFAULT_FILTERS, saturate: 160, contrast: 115, brightness: 105 } },
  { navn: 'Myk', filters: { ...DEFAULT_FILTERS, blur: 1, brightness: 105, contrast: 90 } },
]

function buildFilterString(f: FilterValues): string {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%)`
}

export default function BildeEditorPage() {
  const [bildeUrl, setBildeUrl] = useState('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200')
  const [showBildeVelger, setShowBildeVelger] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({ ...DEFAULT_FILTERS })
  const [tab, setTab] = useState<'filter' | 'beskjær'>('filter')

  // Beskjæring
  const [isCropping, setIsCropping] = useState(false)
  const [cropStart, setCropStart] = useState<{x:number,y:number}|null>(null)
  const [cropEnd, setCropEnd] = useState<{x:number,y:number}|null>(null)
  const [cropRect, setCropRect] = useState<{x:number,y:number,w:number,h:number}|null>(null)
  const imgContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [exporting, setExporting] = useState(false)

  const toast = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3500) }

  const handleFilterChange = (key: keyof FilterValues, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => setFilters({ ...DEFAULT_FILTERS })

  const applyPreset = (preset: typeof FORHÅNDSINNSTILLINGER[0]) => {
    setFilters({ ...preset.filters })
  }

  // ─── Beskjæring med mus ───────────────────────────

  const getRelativePos = (e: React.MouseEvent): { x: number; y: number } => {
    const rect = imgContainerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tab !== 'beskjær') return
    e.preventDefault()
    const pos = getRelativePos(e)
    setCropStart(pos)
    setCropEnd(pos)
    setCropRect(null)
    setIsCropping(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCropping || !cropStart) return
    e.preventDefault()
    const pos = getRelativePos(e)
    setCropEnd(pos)
  }

  const handleMouseUp = () => {
    if (!isCropping || !cropStart || !cropEnd) return
    setIsCropping(false)
    const x = Math.min(cropStart.x, cropEnd.x)
    const y = Math.min(cropStart.y, cropEnd.y)
    const w = Math.abs(cropEnd.x - cropStart.x)
    const h = Math.abs(cropEnd.y - cropStart.y)
    if (w > 0.02 && h > 0.02) {
      setCropRect({ x, y, w, h })
    } else {
      setCropRect(null)
    }
  }

  const applyCrop = () => {
    if (!cropRect || !bildeUrl) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const sx = Math.round(cropRect.x * img.naturalWidth)
      const sy = Math.round(cropRect.y * img.naturalHeight)
      const sw = Math.round(cropRect.w * img.naturalWidth)
      const sh = Math.round(cropRect.h * img.naturalHeight)
      canvas.width = sw
      canvas.height = sh
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
      setBildeUrl(dataUrl)
      setCropRect(null)
      toast('Bilde beskåret!')
    }
    img.onerror = () => toast('Kunne ikke laste bildet for beskjæring')
    img.src = bildeUrl
  }

  const cancelCrop = () => {
    setCropRect(null); setCropStart(null); setCropEnd(null)
  }

  // ─── Eksport ──────────────────────────────────────

  const handleExport = () => {
    setExporting(true)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) { setExporting(false); return }
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) { setExporting(false); return }
      ctx.filter = buildFilterString(filters)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) { setExporting(false); return }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'redigert-bilde.jpg'; a.click()
        URL.revokeObjectURL(url)
        setExporting(false)
        toast('Bilde eksportert!')
      }, 'image/jpeg', 0.92)
    }
    img.onerror = () => { setExporting(false); toast('Feil ved eksport') }
    img.src = bildeUrl
  }

  // Beregn crop-overlay posisjon
  const overlayStyle = (() => {
    if (!cropStart || !cropEnd) return null
    const active = isCropping ? cropEnd : (cropRect ? { x: cropRect.x + cropRect.w, y: cropRect.y + cropRect.h } : cropEnd)
    const start = isCropping ? cropStart : (cropRect ? { x: cropRect.x, y: cropRect.y } : cropStart)
    const left = Math.min(start.x, active.x) * 100
    const top = Math.min(start.y, active.y) * 100
    const width = Math.abs(active.x - start.x) * 100
    const height = Math.abs(active.y - start.y) * 100
    return { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }
  })()

  const cropOverlayForDim = cropRect ? {
    left: `${cropRect.x * 100}%`, top: `${cropRect.y * 100}%`,
    width: `${cropRect.w * 100}%`, height: `${cropRect.h * 100}%`,
  } : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bilderedigering</h1>
          <p className="mt-2 text-gray-600">Juster filtre og beskjær bilder for bruk på nettsiden</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowBildeVelger(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 font-medium text-sm">
            {ic.image} Velg bilde
          </button>
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium disabled:opacity-50">
            {exporting ? <>{ic.loader} Eksporterer...</> : <>{ic.save} Eksporter</>}
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {showBildeVelger && (
        <BildeVelger gjeldendeBildeUrl={bildeUrl}
          onVelg={(url) => { setBildeUrl(url); setShowBildeVelger(false); resetFilters(); cancelCrop() }}
          onLukk={() => setShowBildeVelger(false)} />
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Bilde-preview */}
        <div className="col-span-2">
          <div ref={imgContainerRef}
            className={`relative bg-gray-100 rounded-xl overflow-hidden ${tab === 'beskjær' ? 'cursor-crosshair' : ''}`}
            style={{ aspectRatio: '16/10' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { if (isCropping) handleMouseUp() }}>
            {bildeUrl ? (
              <img src={bildeUrl} alt="Redigering"
                className="w-full h-full object-contain select-none"
                style={{ filter: buildFilterString(filters) }}
                draggable={false} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">{ic.imageLg}<p className="mt-3">Velg et bilde å redigere</p></div>
              </div>
            )}

            {/* Crop overlay */}
            {tab === 'beskjær' && (isCropping || cropRect) && (
              <>
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                {(cropOverlayForDim || overlayStyle) && (
                  <div className="absolute border-2 border-white pointer-events-none"
                    style={{
                      ...(cropRect ? cropOverlayForDim! : overlayStyle!),
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                      background: 'transparent',
                    }}>
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
                )}
              </>
            )}
          </div>

          {/* Crop-knapper */}
          {tab === 'beskjær' && cropRect && (
            <div className="flex items-center space-x-3 mt-3">
              <button onClick={applyCrop}
                className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                {ic.scissors} Beskjær
              </button>
              <button onClick={cancelCrop}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                Avbryt
              </button>
              <span className="text-sm text-gray-500">
                Utvalg: {Math.round(cropRect.w * 100)}% &times; {Math.round(cropRect.h * 100)}%
              </span>
            </div>
          )}
          {tab === 'beskjær' && !cropRect && (
            <p className="text-sm text-gray-500 mt-3">Dra over bildet for å velge beskjæringsområde</p>
          )}
        </div>

        {/* Kontrollpanel */}
        <div>
          {/* Tab-valg */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button onClick={() => { setTab('filter'); cancelCrop() }}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === 'filter' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}>
              {ic.palette} Filtre
            </button>
            <button onClick={() => setTab('beskjær')}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === 'beskjær' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}>
              {ic.scissors} Beskjær
            </button>
          </div>

          {tab === 'filter' && (
            <div className="space-y-5">
              {/* Forhåndsinnstillinger */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forhåndsinnstillinger</label>
                <div className="grid grid-cols-4 gap-2">
                  {FORHÅNDSINNSTILLINGER.map(p => (
                    <button key={p.navn} onClick={() => applyPreset(p)}
                      className="p-2 border border-gray-200 rounded-lg hover:border-[#16425b] transition-colors text-center">
                      <div className="w-full h-8 rounded bg-gray-200 mb-1 overflow-hidden">
                        {bildeUrl && <img src={bildeUrl} alt="" className="w-full h-full object-cover"
                          style={{ filter: buildFilterString(p.filters) }} />}
                      </div>
                      <span className="text-xs">{p.navn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slidere */}
              <div className="space-y-4">
                {FILTER_CONFIG.map(cfg => (
                  <div key={cfg.key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-700">{cfg.ikon} {cfg.label}</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-500 w-14 text-right">
                          {filters[cfg.key]}{cfg.unit}
                        </span>
                        {filters[cfg.key] !== DEFAULT_FILTERS[cfg.key] && (
                          <button onClick={() => handleFilterChange(cfg.key, DEFAULT_FILTERS[cfg.key])}
                            className="text-gray-400 hover:text-gray-600">{ic.undo}</button>
                        )}
                      </div>
                    </div>
                    <input type="range" min={cfg.min} max={cfg.max} step="1"
                      value={filters[cfg.key]}
                      onChange={e => handleFilterChange(cfg.key, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#16425b]" />
                    <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                      <span>{cfg.min}{cfg.unit}</span>
                      <span>{cfg.max}{cfg.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={resetFilters}
                className="flex items-center justify-center gap-1.5 w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">
                {ic.undo} Tilbakestill alle filtre
              </button>
            </div>
          )}

          {tab === 'beskjær' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium">Slik beskjærer du</p>
                <ol className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>1. Klikk og dra over bildet</li>
                  <li>2. Juster utvalget</li>
                  <li>3. Klikk &laquo;Beskjær&raquo; for å bekrefte</li>
                </ol>
              </div>

              {/* Bilde-URL input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bilde-URL</label>
                <input type="text" value={bildeUrl} onChange={e => { setBildeUrl(e.target.value); cancelCrop() }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">{toastMsg}</div>
      )}
    </div>
  )
}
