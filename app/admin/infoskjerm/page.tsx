'use client'

import { useState, useEffect } from 'react'
import BildeVelger from '@/components/BildeVelger'

// ═══════════════════════════════════════════════════════
// TYPER
// ═══════════════════════════════════════════════════════

interface SlideBase {
  id: string; type: 'arrangement' | 'anbefaling' | 'melding'
  tittel: string; bildeUrl: string | null; varighet: number; aktiv: boolean; rekkefølge: number
}
interface ArrangementSlide extends SlideBase {
  type: 'arrangement'; beskrivelse: string; dato: string; klokkeslett: string; sted: string; kategori: string; påmeldingsUrl: string
}
interface AnbefalingSlide extends SlideBase {
  type: 'anbefaling'; forfatter: string; beskrivelse: string; ansattNavn: string
}
interface MeldingSlide extends SlideBase {
  type: 'melding'; tekst: string; undertekst: string
}
type Slide = ArrangementSlide | AnbefalingSlide | MeldingSlide

/* ───── SVG Icons ───── */
const ic = {
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  calendarLg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  pin: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  megaphone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  bookOpen: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  image: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>,
  download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  timer: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6M22 6l-3-3M10 2h4"/></svg>,
  x: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  inbox: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
}

// Plakat-sized icons (used inside slide renderers at larger sizes)
const plakatIcon = {
  calendar: (sz = 20) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  clock: (sz = 20) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  pin: (sz = 20) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  bookOpen: (sz = 80) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  calendarBig: (sz = 80) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
}

// ═══════════════════════════════════════════════════════
// QR PLACEHOLDER
// ═══════════════════════════════════════════════════════

function QRPlaceholder({ størrelse = 80 }: { størrelse?: number }) {
  const p = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,0,0,1,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,0,1,0,1,1,1,0,1],[1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1],[1,0,0,0,0,0,1,0,1,1,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0],[0,1,0,1,1,0,0,1,0,1,1,0,1,1,0,1,0,0,1],
    [1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,0,1,1,0],[0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,1,0,1],
    [1,1,1,1,1,1,1,0,0,1,0,0,1,1,0,1,1,1,0],[1,0,0,0,0,0,1,0,1,0,1,1,0,0,1,0,0,1,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,0,0],[1,0,1,1,1,0,1,0,0,1,0,0,1,1,0,1,1,1,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,1,0,0,1,0,0],[1,0,0,0,0,0,1,0,0,1,1,1,0,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,0,1,0,0,1,1,0,1,0,1,1,0],
  ]
  const cs = størrelse / p.length
  return (
    <svg width={størrelse} height={størrelse} viewBox={`0 0 ${størrelse} ${størrelse}`}>
      <rect width={størrelse} height={størrelse} fill="white" rx="4" />
      {p.map((row, y) => row.map((cell, x) =>
        cell ? <rect key={`${x}-${y}`} x={x*cs+1} y={y*cs+1} width={cs-0.5} height={cs-0.5} fill="#16425b" /> : null
      ))}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════
// SLIDE RENDERERS
// ═══════════════════════════════════════════════════════

function ArrangementPlakat({ slide }: { slide: ArrangementSlide }) {
  const datoF = slide.dato ? new Date(slide.dato).toLocaleDateString('nb-NO', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : ''
  return (
    <div className="w-full h-full flex" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>
      <div className="w-[55%] h-full flex flex-col justify-between p-10 relative"
        style={{ background: 'linear-gradient(160deg, #16425b 0%, #1a5270 60%, #2a6a8e 100%)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-[0.07]" style={{ background:'white', transform:'translate(30%,-30%)' }} />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/15 text-white/90 rounded-full text-sm font-sans font-medium tracking-wide uppercase mb-6">
            <span className="text-white/70">{plakatIcon.calendar(14)}</span> {slide.kategori || 'Arrangement'}
          </span>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6" style={{ letterSpacing:'-0.02em' }}>{slide.tittel}</h1>
          {slide.beskrivelse && <p className="text-xl text-white/80 leading-relaxed mb-8 font-sans font-light max-w-lg">{slide.beskrivelse.length > 200 ? slide.beskrivelse.slice(0,200)+'...' : slide.beskrivelse}</p>}
          <div className="space-y-3 font-sans">
            <div className="flex items-center space-x-3 text-white/90"><span className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">{plakatIcon.calendar()}</span><span className="text-lg capitalize">{datoF}</span></div>
            <div className="flex items-center space-x-3 text-white/90"><span className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">{plakatIcon.clock()}</span><span className="text-lg">Kl. {slide.klokkeslett}</span></div>
            <div className="flex items-center space-x-3 text-white/90"><span className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">{plakatIcon.pin()}</span><span className="text-lg">{slide.sted}</span></div>
          </div>
        </div>
        <div className="relative z-10 flex items-end justify-between">
          <div className="flex items-center space-x-4"><div className="bg-white rounded-lg p-1.5 shadow-lg"><QRPlaceholder størrelse={80} /></div><div className="text-white/80 font-sans"><p className="font-medium text-white text-sm">Skann for påmelding</p><p className="text-xs opacity-70">eller besøk bergen.bibliotek.no</p></div></div>
          <div className="text-right text-white/60 font-sans text-sm"><p className="font-medium text-white/80">Bergen Offentlige</p><p>Bibliotek</p></div>
        </div>
      </div>
      <div className="w-[45%] h-full relative overflow-hidden">
        {slide.bildeUrl ? <img src={slide.bildeUrl} alt={slide.tittel} className="w-full h-full object-cover" /> : (
          <div className="w-full h-full flex items-center justify-center" style={{ background:'linear-gradient(135deg,#2a6a8e,#3d8ab0)' }}><div className="text-center text-white/30">{plakatIcon.calendarBig()}</div></div>
        )}
        <div className="absolute inset-y-0 left-0 w-16" style={{ background:'linear-gradient(to right,#1a5270,transparent)' }} />
      </div>
    </div>
  )
}

function AnbefalingPlakat({ slide }: { slide: AnbefalingSlide }) {
  return (
    <div className="w-full h-full flex" style={{ fontFamily:'var(--font-serif, Georgia, serif)' }}>
      <div className="w-[40%] h-full relative overflow-hidden" style={{ background:'linear-gradient(135deg,#f5f0e8,#e8dfd3)' }}>
        {slide.bildeUrl ? <div className="w-full h-full flex items-center justify-center p-12"><img src={slide.bildeUrl} alt={slide.tittel} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" /></div> : <div className="w-full h-full flex items-center justify-center text-gray-300">{plakatIcon.bookOpen()}</div>}
        <div className="absolute inset-y-0 right-0 w-12" style={{ background:'linear-gradient(to left,#faf8f4,transparent)' }} />
      </div>
      <div className="w-[60%] h-full flex flex-col justify-between p-10" style={{ background:'#faf8f4' }}>
        <div>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-sans font-medium mb-8">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Anbefalt av biblioteket
          </span>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-3" style={{ letterSpacing:'-0.02em' }}>{slide.tittel}</h1>
          <p className="text-2xl text-gray-500 mb-8 font-light">{slide.forfatter}</p>
          <p className="text-xl text-gray-700 leading-relaxed font-sans font-light max-w-lg">{slide.beskrivelse.length > 280 ? slide.beskrivelse.slice(0,280)+'...' : slide.beskrivelse}</p>
          {slide.ansattNavn && <div className="mt-8 pl-6 border-l-4 border-amber-300"><p className="text-gray-500 font-sans italic">&laquo;En bok du ikke legger fra deg&raquo;</p><p className="text-gray-600 font-sans font-medium mt-2">— {slide.ansattNavn}, bibliotekar</p></div>}
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-center space-x-4"><div className="bg-white rounded-lg p-1.5 shadow-sm border border-gray-200"><QRPlaceholder størrelse={70} /></div><div className="font-sans text-gray-500 text-sm"><p className="font-medium text-gray-700">Lån den nå</p><p className="text-xs">Tilgjengelig på alle filialer</p></div></div>
          <div className="text-right text-gray-400 font-sans text-sm"><p className="font-medium text-gray-500">Bergen Offentlige</p><p>Bibliotek</p></div>
        </div>
      </div>
    </div>
  )
}

function MeldingPlakat({ slide }: { slide: MeldingSlide }) {
  return (
    <div className="w-full h-full relative flex items-center justify-center" style={{ background:'linear-gradient(160deg,#16425b 0%,#1a5270 40%,#2d7a50 100%)' }}>
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-[0.06]" style={{ background:'white', transform:'translate(-30%,-30%)' }} />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-[0.06]" style={{ background:'white', transform:'translate(20%,20%)' }} />
      <div className="relative z-10 flex items-center max-w-5xl w-full px-16">
        {slide.bildeUrl && <div className="w-80 h-80 flex-shrink-0 mr-12 rounded-2xl overflow-hidden shadow-2xl"><img src={slide.bildeUrl} alt="" className="w-full h-full object-cover" /></div>}
        <div className="flex-1" style={{ fontFamily:'var(--font-serif, Georgia, serif)' }}>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6" style={{ letterSpacing:'-0.02em' }}>{slide.tittel}</h1>
          {slide.tekst && <p className="text-2xl text-white/80 leading-relaxed font-sans font-light mb-6">{slide.tekst}</p>}
          {slide.undertekst && <p className="text-lg text-white/60 font-sans">{slide.undertekst}</p>}
        </div>
      </div>
      <div className="absolute bottom-8 left-16 right-16 flex items-end justify-between">
        <div className="text-white/50 font-sans text-sm"><p className="font-medium text-white/70">Bergen Offentlige Bibliotek</p></div>
        <div className="flex items-center space-x-6 text-white/50 font-sans text-sm"><span>bergen.bibliotek.no</span><span>55 56 85 60</span></div>
      </div>
    </div>
  )
}

function SlideRenderer({ slide }: { slide: Slide }) {
  switch (slide.type) {
    case 'arrangement': return <ArrangementPlakat slide={slide} />
    case 'anbefaling': return <AnbefalingPlakat slide={slide} />
    case 'melding': return <MeldingPlakat slide={slide} />
  }
}

// ═══════════════════════════════════════════════════════
// ADMIN-SIDE
// ═══════════════════════════════════════════════════════

const TYPE_LABELS: Record<string, { ikon: JSX.Element; label: string; farge: string }> = {
  arrangement: { ikon: ic.calendar, label: 'Plakat', farge: 'bg-blue-100 text-blue-800' },
  anbefaling: { ikon: ic.star, label: 'Anbefaling', farge: 'bg-amber-100 text-amber-800' },
  melding: { ikon: ic.megaphone, label: 'Melding', farge: 'bg-teal-100 text-teal-800' },
}

export default function InfoskjermPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [showBildeVelger, setShowBildeVelger] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [miniPreviewId, setMiniPreviewId] = useState<string | null>(null)

  // Import data
  const [arrangementer, setArrangementer] = useState<any[]>([])
  const [anbefalinger, setAnbefalinger] = useState<any[]>([])

  // Form
  const [slideType, setSlideType] = useState<Slide['type']>('arrangement')
  const [tittel, setTittel] = useState('')
  const [bildeUrl, setBildeUrl] = useState('')
  const [varighet, setVarighet] = useState('10')
  const [beskrivelse, setBeskrivelse] = useState('')
  const [dato, setDato] = useState('')
  const [klokkeslett, setKlokkeslett] = useState('')
  const [sted, setSted] = useState('Bergen Hovedbibliotek — Store sal')
  const [kategori, setKategori] = useState('Foredrag')
  const [forfatter, setForfatter] = useState('')
  const [ansattNavn, setAnsattNavn] = useState('')
  const [tekst, setTekst] = useState('')
  const [undertekst, setUndertekst] = useState('')

  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => { fetchSlides(); fetchContent() }, [])

  useEffect(() => {
    if (!showPreview) return
    const aktive = slides.filter(s => s.aktiv)
    if (!aktive.length) return
    const current = aktive[previewIndex % aktive.length]
    const timer = setTimeout(
      () => setPreviewIndex(prev => (prev + 1) % aktive.length),
      (current?.varighet || 10) * 1000
    )
    return () => clearTimeout(timer)
  }, [showPreview, previewIndex, slides])

  const fetchSlides = async () => {
    try { const res = await fetch('/api/infoskjerm'); const data = await res.json(); if (Array.isArray(data)) setSlides(data) }
    catch (e) { console.error(e) } finally { setIsLoading(false) }
  }

  const fetchContent = async () => {
    try {
      const [arrRes, anbRes] = await Promise.all([fetch('/api/arrangementer'), fetch('/api/anbefalinger')])
      const arrData = await arrRes.json(); const anbData = await anbRes.json()
      if (Array.isArray(arrData)) setArrangementer(arrData)
      if (Array.isArray(anbData)) setAnbefalinger(anbData.filter((a: any) => a.publisert))
    } catch (e) { console.error(e) }
  }

  const toast = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000) }

  const resetForm = () => {
    setEditingId(null); setSlideType('arrangement'); setTittel(''); setBildeUrl('')
    setVarighet('10'); setBeskrivelse(''); setDato(''); setKlokkeslett('')
    setSted('Bergen Hovedbibliotek — Store sal'); setKategori('Foredrag')
    setForfatter(''); setAnsattNavn(''); setTekst(''); setUndertekst('')
  }

  const buildSlide = (): Slide => {
    const base = {
      id: editingId || `slide-${Date.now()}`, tittel,
      bildeUrl: bildeUrl || null, varighet: parseInt(varighet) || 10,
      aktiv: true, rekkefølge: editingId ? slides.find(s => s.id === editingId)?.rekkefølge || slides.length + 1 : slides.length + 1,
    }
    if (slideType === 'arrangement') return { ...base, type:'arrangement', beskrivelse, dato, klokkeslett, sted, kategori, påmeldingsUrl:`/arrangementer/${base.id}` }
    if (slideType === 'anbefaling') return { ...base, type:'anbefaling', forfatter, beskrivelse, ansattNavn }
    return { ...base, type:'melding', tekst, undertekst }
  }

  const loadSlideIntoForm = (slide: Slide) => {
    setEditingId(slide.id); setSlideType(slide.type); setTittel(slide.tittel)
    setBildeUrl(slide.bildeUrl || ''); setVarighet(slide.varighet.toString())
    if (slide.type === 'arrangement') { setBeskrivelse(slide.beskrivelse); setDato(slide.dato); setKlokkeslett(slide.klokkeslett); setSted(slide.sted); setKategori(slide.kategori) }
    else if (slide.type === 'anbefaling') { setForfatter(slide.forfatter); setBeskrivelse(slide.beskrivelse); setAnsattNavn(slide.ansattNavn) }
    else { setTekst(slide.tekst); setUndertekst(slide.undertekst) }
    setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!tittel) { alert('Tittel er påkrevd!'); return }
    const slide = buildSlide()
    try {
      if (editingId) {
        await fetch('/api/infoskjerm', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(slide) })
        toast('Slide oppdatert!')
      } else {
        await fetch('/api/infoskjerm', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(slide) })
        toast('Ny slide lagt til!')
      }
      resetForm(); setShowForm(false); fetchSlides()
    } catch { toast('Feil') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Slette denne sliden?')) return
    await fetch(`/api/infoskjerm?id=${id}`, { method:'DELETE' })
    fetchSlides(); toast('Slettet')
  }

  const handleToggle = async (id: string, aktiv: boolean) => {
    await fetch('/api/infoskjerm', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id, aktiv: !aktiv }) })
    fetchSlides()
  }

  const handleVarighetChange = async (id: string, nyVarighet: number) => {
    await fetch('/api/infoskjerm', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id, varighet: nyVarighet }) })
    fetchSlides()
  }

  const moveSlide = async (id: string, dir: 'up' | 'down') => {
    const idx = slides.findIndex(s => s.id === id)
    const swap = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= slides.length) return
    const copy = [...slides];
    [copy[idx], copy[swap]] = [copy[swap], copy[idx]]
    const reordered = copy.map((s, i) => ({ ...s, rekkefølge: i + 1 }))
    await fetch('/api/infoskjerm', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(reordered) })
    fetchSlides()
  }

  const handleImportArr = async (arr: any) => {
    const slide: ArrangementSlide = {
      id: `slide-${Date.now()}`, type:'arrangement', tittel:arr.tittel,
      beskrivelse:arr.beskrivelse||'', dato:arr.dato, klokkeslett:arr.klokkeslett,
      sted:arr.sted, kategori:arr.kategori, bildeUrl:arr.bildeUrl||null,
      påmeldingsUrl:`/arrangementer/${arr.id}`,
      varighet:12, aktiv:true, rekkefølge:slides.length+1,
    }
    await fetch('/api/infoskjerm', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(slide) })
    fetchSlides(); toast(`«${arr.tittel}» importert`)
  }

  const handleImportAnb = async (anb: any) => {
    const slide: AnbefalingSlide = {
      id: `slide-${Date.now()}`, type:'anbefaling', tittel:anb.tittel,
      forfatter:anb.forfatter||'', beskrivelse:anb.beskrivelse||'',
      ansattNavn:'', bildeUrl:anb.bildeUrl||null,
      varighet:10, aktiv:true, rekkefølge:slides.length+1,
    }
    await fetch('/api/infoskjerm', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(slide) })
    fetchSlides(); toast(`«${anb.tittel}» importert`)
  }

  const aktiveSlides = slides.filter(s => s.aktiv)
  const totalRotasjon = aktiveSlides.reduce((s, sl) => s + sl.varighet, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Infoskjerm</h1>
          <p className="mt-2 text-gray-600">Plakater og innhold for bibliotekets storskjermer</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-4 py-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 font-medium">
            {ic.download} Importer
          </button>
          <button onClick={() => { setPreviewIndex(0); setShowPreview(true) }}
            className="flex items-center gap-1.5 px-4 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-medium"
            disabled={aktiveSlides.length === 0}>
            {ic.eye} Forhåndsvis ({aktiveSlides.length})
          </button>
        </div>
      </div>

      {/* Opprett ny — tydelige snarveier */}
      <div className="grid grid-cols-3 gap-4">
        {([
          { type: 'arrangement' as const, icon: ic.calendarLg, label: 'Ny plakat', desc: 'Arrangement med dato, sted og QR', bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
          { type: 'anbefaling' as const, icon: ic.star, label: 'Ny anbefaling', desc: 'Bok med omtale og ansatt-sitat', bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
          { type: 'melding' as const, icon: ic.megaphone, label: 'Ny melding', desc: 'Kunngjøring, info, åpningstider', bg: 'bg-teal-50 border-teal-200 hover:bg-teal-100' },
        ]).map(item => (
          <button key={item.type} onClick={() => { resetForm(); setSlideType(item.type); setShowForm(true) }}
            className={`p-5 rounded-xl border-2 text-left transition-all ${item.bg}`}>
            <div className="mb-2 text-gray-700">{item.icon}</div>
            <div className="font-semibold text-gray-900">{item.label}</div>
            <div className="text-sm text-gray-600 mt-1">{item.desc}</div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border"><div className="text-sm text-gray-500">Totalt</div><div className="text-2xl font-bold">{slides.length}</div></div>
        <div className="bg-white rounded-xl p-4 border"><div className="text-sm text-gray-500">Aktive</div><div className="text-2xl font-bold text-green-600">{aktiveSlides.length}</div></div>
        <div className="bg-white rounded-xl p-4 border"><div className="text-sm text-gray-500">Total rotasjon</div><div className="text-2xl font-bold">{totalRotasjon}s <span className="text-sm font-normal text-gray-400">({Math.round(totalRotasjon/60)} min)</span></div></div>
        <div className="bg-white rounded-xl p-4 border"><div className="text-sm text-gray-500">Maler</div>
          <div className="flex space-x-1 mt-1">{Object.values(TYPE_LABELS).map(t => <span key={t.label} className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${t.farge}`}>{t.ikon}</span>)}</div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="flex items-center gap-1.5 text-lg font-semibold mb-4">{editingId ? <>{ic.edit} Rediger slide</> : <>{ic.image} Ny slide</>}</h3>

          {/* Malvalg */}
          <div className="flex space-x-3 mb-6">
            {(Object.entries(TYPE_LABELS) as [Slide['type'], typeof TYPE_LABELS.arrangement][]).map(([type, info]) => (
              <button key={type} onClick={() => setSlideType(type)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                  slideType === type ? 'border-[#16425b] bg-[#16425b]/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <span className="text-gray-600">{info.ikon}</span>
                <div className="font-semibold mt-1">{info.label}</div>
                <div className="text-xs text-gray-500">
                  {type === 'arrangement' ? 'Tekst + bilde + QR' : type === 'anbefaling' ? 'Bok + anmeldelse' : 'Generell melding'}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tittel *</label>
                <input type="text" value={tittel} onChange={e => setTittel(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">{ic.timer} Visningstid (sekunder)</label>
                <div className="flex items-center space-x-3">
                  <input type="range" min="5" max="60" step="1" value={varighet} onChange={e => setVarighet(e.target.value)}
                    className="flex-1 accent-[#16425b]" />
                  <span className="text-lg font-bold text-[#16425b] w-12 text-right">{varighet}s</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>5s</span><span>30s</span><span>60s</span></div>
              </div>
            </div>

            {slideType === 'arrangement' && (
              <>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label><textarea value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" /></div>
                <div className="grid grid-cols-4 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Dato</label><input type="date" value={dato} onChange={e => setDato(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Klokkeslett</label><input type="time" value={klokkeslett} onChange={e => setKlokkeslett(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label><select value={kategori} onChange={e => setKategori(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg">{['Foredrag','Forfatterbesøk','Verksted','Barneaktivitet','Ungdomsarrangement','Boklubb','Konsert','Kurs','Debatt'].map(k => <option key={k}>{k}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Sted</label><input type="text" value={sted} onChange={e => setSted(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" /></div>
                </div>
              </>
            )}

            {slideType === 'anbefaling' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Forfatter</label><input type="text" value={forfatter} onChange={e => setForfatter(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Anbefalt av (ansatt)</label><input type="text" value={ansattNavn} onChange={e => setAnsattNavn(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="F.eks. Maria Solheim" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Omtale</label><textarea value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" /></div>
              </>
            )}

            {slideType === 'melding' && (
              <>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Meldingstekst</label><textarea value={tekst} onChange={e => setTekst(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="F.eks. Nye åpningstider, stengt pga vedlikehold, velkommen til ..." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Undertekst (valgfri)</label><input type="text" value={undertekst} onChange={e => setUndertekst(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="F.eks. Gjelder alle filialer" /></div>
              </>
            )}

            {/* Bilde */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">{ic.image} Bilde</label>
              <div className="flex items-center space-x-3">
                <input type="text" value={bildeUrl} onChange={e => setBildeUrl(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="Bilde-URL" />
                <button onClick={() => setShowBildeVelger(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 font-medium text-sm whitespace-nowrap">{ic.image} Velg fra bibliotek</button>
              </div>
              {bildeUrl && <img src={bildeUrl} alt="" className="mt-2 h-24 rounded-lg object-cover" />}
            </div>

            {tittel && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forhåndsvisning</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden" style={{ aspectRatio:'16/9', maxHeight:'280px' }}><SlideRenderer slide={buildSlide()} /></div>
              </div>
            )}

            <div className="flex space-x-3 pt-4 border-t">
              <button onClick={handleSave} className="px-6 py-2.5 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">{editingId ? 'Oppdater' : 'Legg til'}</button>
              <button onClick={() => { resetForm(); setShowForm(false) }} className="px-6 py-2.5 text-gray-600">Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {showBildeVelger && <BildeVelger gjeldendeBildeUrl={bildeUrl} onVelg={(url) => { setBildeUrl(url); setShowBildeVelger(false) }} onLukk={() => setShowBildeVelger(false)} />}

      {/* Slide-liste */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">Laster...</div>
        ) : slides.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">Ingen slides — bruk knappene over for å opprette</div>
        ) : slides.map((slide, idx) => {
          const tl = TYPE_LABELS[slide.type]
          return (
            <div key={slide.id} className={`bg-white rounded-xl border p-3 transition-opacity ${slide.aktiv ? 'border-gray-200' : 'border-gray-100 opacity-50'}`}>
              <div className="flex items-center space-x-4">
                <button onClick={() => setMiniPreviewId(miniPreviewId === slide.id ? null : slide.id)}
                  className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 hover:border-[#16425b] transition-colors relative group">
                  <div className="w-full h-full" style={{ fontSize:'4px' }}><SlideRenderer slide={slide} /></div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-xs bg-white px-2 py-0.5 rounded shadow flex items-center gap-1">{ic.eye}</span>
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${tl.farge}`}>{tl.ikon} {tl.label}</span>
                    <h4 className="font-medium text-gray-900 truncate">{slide.tittel}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${slide.aktiv ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {slide.aktiv ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-gray-400">{ic.timer}</span>
                    <input type="range" min="5" max="60" step="1" value={slide.varighet}
                      onChange={e => handleVarighetChange(slide.id, parseInt(e.target.value))}
                      className="w-24 h-1 accent-[#16425b]" />
                    <span className="text-xs font-medium text-gray-600 w-8">{slide.varighet}s</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <button onClick={() => moveSlide(slide.id, 'up')} disabled={idx === 0} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-20">&uarr;</button>
                  <button onClick={() => moveSlide(slide.id, 'down')} disabled={idx === slides.length - 1} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-20">&darr;</button>
                  <button onClick={() => handleToggle(slide.id, slide.aktiv)} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${slide.aktiv ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{slide.aktiv ? 'Deaktiver' : 'Aktiver'}</button>
                  <button onClick={() => loadSlideIntoForm(slide)} className="px-3 py-1.5 text-xs rounded-lg font-medium text-[#16425b] bg-[#16425b]/10">Rediger</button>
                  <button onClick={() => handleDelete(slide.id)} className="px-3 py-1.5 text-xs rounded-lg font-medium text-red-600 bg-red-50">Slett</button>
                </div>
              </div>

              {miniPreviewId === slide.id && (
                <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden" style={{ aspectRatio:'16/9', maxHeight:'320px' }}><SlideRenderer slide={slide} /></div>
              )}
            </div>
          )
        })}
      </div>

      {/* Import-modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowImport(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="flex items-center gap-1.5 text-lg font-semibold">{ic.download} Importer innhold</h3>
              <button onClick={() => setShowImport(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="flex items-center gap-1.5 font-semibold mb-3">{ic.calendar} Arrangementer &rarr; Plakat-slide</h4>
                {arrangementer.length === 0 ? <p className="text-sm text-gray-500">Ingen tilgjengelig</p> : (
                  <div className="space-y-2">{arrangementer.map(arr => (
                    <div key={arr.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {arr.bildeUrl ? <img src={arr.bildeUrl} className="w-10 h-10 rounded object-cover" alt="" /> : <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600">{ic.calendar}</div>}
                        <div><div className="font-medium text-sm">{arr.tittel}</div><div className="text-xs text-gray-500">{new Date(arr.dato).toLocaleDateString('nb-NO')}</div></div>
                      </div>
                      <button onClick={() => handleImportArr(arr)} className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200">+ Plakat</button>
                    </div>
                  ))}</div>
                )}
              </div>
              <div>
                <h4 className="flex items-center gap-1.5 font-semibold mb-3">{ic.star} Anbefalinger &rarr; Anbefaling-slide</h4>
                {anbefalinger.length === 0 ? <p className="text-sm text-gray-500">Ingen tilgjengelig</p> : (
                  <div className="space-y-2">{anbefalinger.map(anb => (
                    <div key={anb.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {anb.bildeUrl ? <img src={anb.bildeUrl} className="w-10 h-10 rounded object-cover" alt="" /> : <div className="w-10 h-10 bg-amber-100 rounded flex items-center justify-center text-amber-600">{ic.star}</div>}
                        <div><div className="font-medium text-sm">{anb.tittel}</div><div className="text-xs text-gray-500">{anb.forfatter}</div></div>
                      </div>
                      <button onClick={() => handleImportAnb(anb)} className="px-3 py-1.5 text-sm bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200">+ Anbefaling</button>
                    </div>
                  ))}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullskjerm-preview */}
      {showPreview && aktiveSlides.length > 0 && (
        <div className="fixed inset-0 bg-black z-50">
          <div className="w-full h-full"><SlideRenderer slide={aktiveSlides[previewIndex % aktiveSlides.length]} /></div>
          <div className="absolute top-6 left-6 bg-black/40 text-white px-4 py-2 rounded-lg backdrop-blur-sm text-sm font-sans">
            <span className="opacity-70">Slide {(previewIndex % aktiveSlides.length) + 1}/{aktiveSlides.length}</span>
            <span className="mx-2">&middot;</span>
            <span className="inline-flex items-center gap-1 opacity-70">{ic.timer} {aktiveSlides[previewIndex % aktiveSlides.length]?.varighet}s</span>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {aktiveSlides.map((_, i) => (
              <button key={i} onClick={() => setPreviewIndex(i)} className={`w-3 h-3 rounded-full transition-colors ${i === previewIndex % aktiveSlides.length ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
          <button onClick={() => setShowPreview(false)} className="absolute top-6 right-6 text-white/80 hover:text-white bg-black/30 px-4 py-2 rounded-lg text-sm backdrop-blur-sm flex items-center gap-1.5">{ic.x} Lukk</button>
          <button onClick={() => setPreviewIndex(p => (p - 1 + aktiveSlides.length) % aktiveSlides.length)} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-black/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm text-xl">&lsaquo;</button>
          <button onClick={() => setPreviewIndex(p => (p + 1) % aktiveSlides.length)} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-black/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm text-xl">&rsaquo;</button>
        </div>
      )}

      {showToast && <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">{toastMsg}</div>}
    </div>
  )
}
