'use client'

import { useState, useEffect } from 'react'
import ImageEditor from '@/components/ImageEditor'

interface Slide {
  id: string
  type: 'arrangement' | 'anbefaling' | 'melding' | 'bilde'
  tittel: string
  tekst: string
  bildeUrl: string | null
  varighet: number // sekunder
  aktiv: boolean
  rekkefølge: number
}

export default function InfoskjermPage() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 'slide-1', type: 'melding', tittel: 'Velkommen til Bergen Offentlige Bibliotek',
      tekst: 'Åpningstider: Man–Fre 10–20, Lør 10–16. Gratis Wi-Fi tilgjengelig i alle etasjer.',
      bildeUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200',
      varighet: 10, aktiv: true, rekkefølge: 1,
    },
    {
      id: 'slide-2', type: 'arrangement', tittel: 'Forfattermøte: Agnes Ravatn',
      tekst: '15. mars kl 18:00 — Store sal. Ravatn snakkar om «Dei sju dørene». Gratis inngang!',
      bildeUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200',
      varighet: 8, aktiv: true, rekkefølge: 2,
    },
    {
      id: 'slide-3', type: 'anbefaling', tittel: 'Ukens anbefaling: Fuglane',
      tekst: 'Tarjei Vesaas\' meisterverk om Mattis og Hege. Ein tidlaus norsk klassikar.',
      bildeUrl: null,
      varighet: 8, aktiv: true, rekkefølge: 3,
    },
    {
      id: 'slide-4', type: 'bilde', tittel: 'Sommerlesekampanjen 2026',
      tekst: '',
      bildeUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
      varighet: 6, aktiv: false, rekkefølge: 4,
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [showImageEditor, setShowImageEditor] = useState(false)

  // Form
  const [type, setType] = useState<Slide['type']>('melding')
  const [tittel, setTittel] = useState('')
  const [tekst, setTekst] = useState('')
  const [bildeUrl, setBildeUrl] = useState('')
  const [varighet, setVarighet] = useState('8')

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Importer fra anbefalinger/arrangementer
  const [arrangementer, setArrangementer] = useState<any[]>([])
  const [anbefalinger, setAnbefalinger] = useState<any[]>([])
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  // Fullskjerm-preview auto-rotering
  useEffect(() => {
    if (!showPreview) return
    const aktiveSlides = slides.filter(s => s.aktiv)
    if (aktiveSlides.length === 0) return
    const timer = setInterval(() => {
      setPreviewIndex(prev => (prev + 1) % aktiveSlides.length)
    }, (aktiveSlides[previewIndex]?.varighet || 8) * 1000)
    return () => clearInterval(timer)
  }, [showPreview, previewIndex, slides])

  const fetchContent = async () => {
    try {
      const [arrRes, anbRes] = await Promise.all([
        fetch('/api/arrangementer'), fetch('/api/anbefalinger')
      ])
      const arrData = await arrRes.json()
      const anbData = await anbRes.json()
      if (Array.isArray(arrData)) setArrangementer(arrData)
      if (Array.isArray(anbData)) setAnbefalinger(anbData.filter((a: any) => a.publisert))
    } catch (e) { console.error(e) }
  }

  const toast = (msg: string) => {
    setToastMessage(msg); setShowToast(true); setTimeout(() => setShowToast(false), 4000)
  }

  const resetForm = () => {
    setType('melding'); setTittel(''); setTekst(''); setBildeUrl(''); setVarighet('8'); setEditingId(null)
  }

  const handleSave = () => {
    if (!tittel && type !== 'bilde') { alert('Tittel er påkrevd!'); return }

    if (editingId) {
      setSlides(prev => prev.map(s => s.id === editingId ? {
        ...s, type, tittel, tekst, bildeUrl: bildeUrl || null, varighet: parseInt(varighet) || 8,
      } : s))
      toast('✅ Slide oppdatert!')
    } else {
      const nySlide: Slide = {
        id: `slide-${Date.now()}`, type, tittel, tekst,
        bildeUrl: bildeUrl || null, varighet: parseInt(varighet) || 8,
        aktiv: true, rekkefølge: slides.length + 1,
      }
      setSlides(prev => [...prev, nySlide])
      toast('✅ Ny slide lagt til!')
    }
    resetForm(); setShowForm(false)
  }

  const handleEdit = (slide: Slide) => {
    setEditingId(slide.id); setType(slide.type); setTittel(slide.tittel)
    setTekst(slide.tekst); setBildeUrl(slide.bildeUrl || ''); setVarighet(slide.varighet.toString())
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Slette denne sliden?')) return
    setSlides(prev => prev.filter(s => s.id !== id))
    toast('🗑️ Slide slettet')
  }

  const handleToggle = (id: string) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, aktiv: !s.aktiv } : s))
  }

  const handleImportArrangement = (arr: any) => {
    const nySlide: Slide = {
      id: `slide-${Date.now()}`, type: 'arrangement',
      tittel: arr.tittel,
      tekst: `${new Date(arr.dato).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })} kl ${arr.klokkeslett} — ${arr.sted}`,
      bildeUrl: arr.bildeUrl || null, varighet: 8, aktiv: true, rekkefølge: slides.length + 1,
    }
    setSlides(prev => [...prev, nySlide])
    toast(`✅ «${arr.tittel}» importert som slide`)
  }

  const handleImportAnbefaling = (anb: any) => {
    const nySlide: Slide = {
      id: `slide-${Date.now()}`, type: 'anbefaling',
      tittel: `Anbefalt: ${anb.tittel}`,
      tekst: anb.forfatter ? `${anb.forfatter} — ${anb.beskrivelse?.substring(0, 120)}...` : anb.beskrivelse?.substring(0, 150) || '',
      bildeUrl: anb.bildeUrl || null, varighet: 8, aktiv: true, rekkefølge: slides.length + 1,
    }
    setSlides(prev => [...prev, nySlide])
    toast(`✅ «${anb.tittel}» importert som slide`)
  }

  const moveSlide = (id: string, direction: 'up' | 'down') => {
    setSlides(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (idx === -1) return prev
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const copy = [...prev]
      ;[copy[idx], copy[swapIdx]] = [copy[swapIdx], copy[idx]]
      return copy.map((s, i) => ({ ...s, rekkefølge: i + 1 }))
    })
  }

  const aktiveSlides = slides.filter(s => s.aktiv)
  const typeIkon = (t: Slide['type']) =>
    t === 'arrangement' ? '📅' : t === 'anbefaling' ? '⭐' : t === 'bilde' ? '🖼️' : '📢'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Infoskjerm</h1>
          <p className="mt-2 text-gray-600">Administrer innhold som vises på bibliotekets infoskjermer</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowImport(true)}
            className="px-4 py-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 font-medium">
            📥 Importer innhold
          </button>
          <button onClick={() => { setPreviewIndex(0); setShowPreview(true) }}
            className="px-4 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-medium">
            👁️ Forhåndsvis
          </button>
          <button onClick={() => { resetForm(); setShowForm(!showForm) }}
            className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">
            + Ny slide
          </button>
        </div>
      </div>

      {/* Statistikk */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Totalt slides</div>
          <div className="text-2xl font-bold">{slides.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Aktive</div>
          <div className="text-2xl font-bold text-green-600">{aktiveSlides.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-600">Total rotasjonstid</div>
          <div className="text-2xl font-bold">{aktiveSlides.reduce((sum, s) => sum + s.varighet, 0)}s</div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">{editingId ? '✏️ Rediger slide' : '🖼️ Ny slide'}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={type} onChange={e => setType(e.target.value as Slide['type'])}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="melding">📢 Melding</option>
                  <option value="arrangement">📅 Arrangement</option>
                  <option value="anbefaling">⭐ Anbefaling</option>
                  <option value="bilde">🖼️ Kun bilde</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tittel</label>
                <input type="text" value={tittel} onChange={e => setTittel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Overskrift på sliden" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Varighet (sek)</label>
                <input type="number" value={varighet} onChange={e => setVarighet(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" min="3" max="60" />
              </div>
            </div>

            {type !== 'bilde' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tekst</label>
                <textarea value={tekst} onChange={e => setTekst(e.target.value)} rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Beskrivende tekst..." />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🖼️ Bilde</label>
              <div className="flex items-center space-x-3">
                <input type="text" value={bildeUrl} onChange={e => setBildeUrl(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Bilde-URL (anbefalt: 1920×1080 eller 16:9)" />
                {bildeUrl && (
                  <button onClick={() => setShowImageEditor(true)}
                    className="px-4 py-3 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 font-medium">
                    🖼️ Rediger
                  </button>
                )}
              </div>
              {bildeUrl && (
                <img src={bildeUrl} alt="" className="mt-2 h-32 rounded-lg object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              )}
              <p className="mt-1 text-xs text-gray-500">
                Optimalt format: liggende (16:9), minst 1920×1080px for god kvalitet på storskjerm
              </p>
            </div>

            <div className="flex space-x-3 pt-4 border-t">
              <button onClick={handleSave} className="px-6 py-2.5 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">
                {editingId ? 'Oppdater' : 'Legg til'}
              </button>
              <button onClick={() => { resetForm(); setShowForm(false) }} className="px-6 py-2.5 text-gray-600 hover:text-gray-900">Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {/* ImageEditor */}
      {showImageEditor && bildeUrl && (
        <ImageEditor imageUrl={bildeUrl} onSave={(url) => { setBildeUrl(url); setShowImageEditor(false); toast('Bilde redigert!') }}
          onClose={() => setShowImageEditor(false)} />
      )}

      {/* Slides-liste */}
      <div className="space-y-3">
        {slides.map((slide, idx) => (
          <div key={slide.id} className={`bg-white rounded-xl border p-4 flex items-center space-x-4 transition-opacity ${
            slide.aktiv ? 'border-gray-200' : 'border-gray-100 opacity-50'
          }`}>
            {/* Thumbnail */}
            <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
              {slide.bildeUrl ? (
                <img src={slide.bildeUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#16425b]/10 flex items-center justify-center text-2xl">
                  {typeIkon(slide.type)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{typeIkon(slide.type)}</span>
                <h4 className="font-medium text-gray-900 truncate">{slide.tittel || '(Kun bilde)'}</h4>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  slide.aktiv ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>{slide.aktiv ? 'Aktiv' : 'Inaktiv'}</span>
              </div>
              {slide.tekst && <p className="text-sm text-gray-500 truncate mt-1">{slide.tekst}</p>}
              <p className="text-xs text-gray-400 mt-1">⏱ {slide.varighet}s</p>
            </div>

            {/* Kontroller */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button onClick={() => moveSlide(slide.id, 'up')} disabled={idx === 0}
                className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Flytt opp">↑</button>
              <button onClick={() => moveSlide(slide.id, 'down')} disabled={idx === slides.length - 1}
                className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Flytt ned">↓</button>
              <button onClick={() => handleToggle(slide.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                  slide.aktiv ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}>{slide.aktiv ? 'Deaktiver' : 'Aktiver'}</button>
              <button onClick={() => handleEdit(slide)}
                className="px-3 py-1.5 text-xs font-medium text-[#16425b] bg-[#16425b]/10 rounded-lg hover:bg-[#16425b]/20">Rediger</button>
              <button onClick={() => handleDelete(slide.id)}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">Slett</button>
            </div>
          </div>
        ))}
      </div>

      {/* Import-modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowImport(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">📥 Importer innhold til infoskjerm</h3>
              <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">📅 Arrangementer</h4>
                {arrangementer.length === 0 ? (
                  <p className="text-sm text-gray-500">Ingen arrangementer tilgjengelig</p>
                ) : (
                  <div className="space-y-2">
                    {arrangementer.map(arr => (
                      <div key={arr.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {arr.bildeUrl ? <img src={arr.bildeUrl} alt="" className="w-10 h-10 rounded object-cover" />
                            : <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">📅</div>}
                          <div>
                            <div className="font-medium">{arr.tittel}</div>
                            <div className="text-xs text-gray-500">{new Date(arr.dato).toLocaleDateString('nb-NO')}</div>
                          </div>
                        </div>
                        <button onClick={() => handleImportArrangement(arr)}
                          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200">
                          + Importer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">⭐ Anbefalinger</h4>
                {anbefalinger.length === 0 ? (
                  <p className="text-sm text-gray-500">Ingen publiserte anbefalinger</p>
                ) : (
                  <div className="space-y-2">
                    {anbefalinger.map(anb => (
                      <div key={anb.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {anb.bildeUrl ? <img src={anb.bildeUrl} alt="" className="w-10 h-10 rounded object-cover" />
                            : <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center">⭐</div>}
                          <div>
                            <div className="font-medium">{anb.tittel}</div>
                            <div className="text-xs text-gray-500">{anb.forfatter}</div>
                          </div>
                        </div>
                        <button onClick={() => handleImportAnbefaling(anb)}
                          className="px-3 py-1.5 text-sm bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200">
                          + Importer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullskjerm-preview */}
      {showPreview && aktiveSlides.length > 0 && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={() => setShowPreview(false)}>
          <div className="w-full h-full relative" onClick={e => e.stopPropagation()}>
            {(() => {
              const slide = aktiveSlides[previewIndex % aktiveSlides.length]
              if (!slide) return null
              return (
                <div className="w-full h-full flex items-center justify-center relative">
                  {slide.bildeUrl && (
                    <img src={slide.bildeUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className={`absolute inset-0 ${slide.bildeUrl ? 'bg-black/50' : 'bg-gradient-to-br from-[#16425b] to-[#2a6a8e]'}`} />
                  <div className="relative z-10 text-center text-white px-16 max-w-4xl">
                    <div className="text-6xl mb-6">{typeIkon(slide.type)}</div>
                    <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-serif)' }}>{slide.tittel}</h1>
                    {slide.tekst && <p className="text-2xl opacity-90 leading-relaxed">{slide.tekst}</p>}
                  </div>
                  {/* Slide-indikator */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
                    {aktiveSlides.map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full transition-colors ${
                        i === previewIndex % aktiveSlides.length ? 'bg-white' : 'bg-white/30'
                      }`} />
                    ))}
                  </div>
                  <div className="absolute top-6 left-6 text-white/60 text-sm">Bergen Offentlige Bibliotek</div>
                </div>
              )
            })()}
            <button onClick={() => setShowPreview(false)}
              className="absolute top-6 right-6 text-white/80 hover:text-white text-lg bg-white/10 px-4 py-2 rounded-lg">
              ✕ Lukk forhåndsvisning
            </button>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">{toastMessage}</div>
      )}
    </div>
  )
}
