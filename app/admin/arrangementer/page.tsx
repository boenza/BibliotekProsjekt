'use client'

import { useState, useEffect } from 'react'
import BildeVelger from '@/components/BildeVelger'

interface Arrangement {
  id: string; tittel: string; beskrivelse: string; dato: string; klokkeslett: string
  sted: string; kategori: string; bildeUrl: string | null; maxDeltakere: number
  maxOverstyrt: boolean; antallPaameldt: number; publisert: boolean; opprettet: string; serieTittel: string | null
}
interface KatalogBok { id: string; tittel: string; forfatter: string; sjanger: string }

/* ───── SVG Icons ───── */
const ic = {
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  pin: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  repeat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  link: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  sparkle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  book: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  bulb: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>,
}

const KATEGORIER = ['Foredrag','Forfatterbesøk','Verksted','Barneaktivitet','Ungdomsarrangement','Boklubb','Utstilling','Konsert','Kurs','Debatt','Annet']

const STEDER: Record<string, number> = {
  'Bergen Hovedbibliotek — Store sal': 120, 'Bergen Hovedbibliotek — Lille sal': 40,
  'Bergen Hovedbibliotek — Barnebiblioteket': 30, 'Bergen Hovedbibliotek — Lesesalen': 25,
  'Loddefjord bibliotek': 50, 'Fana bibliotek': 45, 'Åsane bibliotek': 55,
  'Fyllingsdalen bibliotek': 40, 'Digitalt (Zoom)': 500,
}

export default function ArrangementerPage() {
  const [arrangementer, setArrangementer] = useState<Arrangement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tittel, setTittel] = useState('')
  const [beskrivelse, setBeskrivelse] = useState('')
  const [dato, setDato] = useState('')
  const [klokkeslett, setKlokkeslett] = useState('')
  const [sted, setSted] = useState(Object.keys(STEDER)[0])
  const [kategori, setKategori] = useState(KATEGORIER[0])
  const [bildeUrl, setBildeUrl] = useState('')
  const [maxDeltakere, setMaxDeltakere] = useState('')
  const [maxOverstyrt, setMaxOverstyrt] = useState(false)
  const [serieTittel, setSerieTittel] = useState('')
  const [isSerie, setIsSerie] = useState(false)
  const [serieFrekvens, setSerieFrekvens] = useState<'ukentlig'|'månedlig'>('ukentlig')
  const [serieAntall, setSerieAntall] = useState(4)
  const [serieDatoer, setSerieDatoer] = useState<string[]>([])
  const [katalogSoek, setKatalogSoek] = useState('')
  const [katalogResultater, setKatalogResultater] = useState<KatalogBok[]>([])
  const [showKatalogDropdown, setShowKatalogDropdown] = useState(false)
  const [kobletTittel, setKobletTittel] = useState<KatalogBok | null>(null)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCheckingLanguage, setIsCheckingLanguage] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [showBildeVelger, setShowBildeVelger] = useState(false)
  const [filterKategori, setFilterKategori] = useState('Alle')
  const [filterTid, setFilterTid] = useState<'kommende'|'alle'|'tidligere'>('kommende')
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (katalogSoek.length < 2) { setKatalogResultater([]); setShowKatalogDropdown(false); return }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/katalog?q=${encodeURIComponent(katalogSoek)}`)
        const data = await res.json()
        if (Array.isArray(data)) { setKatalogResultater(data); setShowKatalogDropdown(true) }
      } catch (e) { console.error(e) }
    }, 300)
    return () => clearTimeout(timer)
  }, [katalogSoek])

  useEffect(() => {
    if (!isSerie || !dato) { setSerieDatoer([]); return }
    const startDato = new Date(dato); const datoer: string[] = []
    for (let i = 0; i < serieAntall; i++) {
      const d = new Date(startDato)
      if (serieFrekvens === 'ukentlig') d.setDate(d.getDate() + (i * 7)); else d.setMonth(d.getMonth() + i)
      datoer.push(d.toISOString().split('T')[0])
    }
    setSerieDatoer(datoer)
  }, [isSerie, dato, serieFrekvens, serieAntall])

  const fetchData = async () => {
    try { const res = await fetch('/api/arrangementer'); const data = await res.json(); if (Array.isArray(data)) setArrangementer(data) }
    catch (e) { console.error(e) } finally { setIsLoading(false) }
  }

  const toast = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3500) }

  const resetForm = () => {
    setEditingId(null); setTittel(''); setBeskrivelse(''); setDato(''); setKlokkeslett('')
    setSted(Object.keys(STEDER)[0]); setKategori(KATEGORIER[0]); setBildeUrl(''); setMaxDeltakere('')
    setMaxOverstyrt(false); setSerieTittel(''); setIsSerie(false); setSerieFrekvens('ukentlig')
    setSerieAntall(4); setSerieDatoer([]); setKobletTittel(null); setKatalogSoek(''); setAiSuggestion('')
    setShowPreview(false)
  }

  const handleStedChange = (nyttSted: string) => { setSted(nyttSted); if (!maxOverstyrt) setMaxDeltakere(String(STEDER[nyttSted] || 50)) }
  const handleKapasitetChange = (verdi: string) => { setMaxDeltakere(verdi); setMaxOverstyrt(parseInt(verdi) !== (STEDER[sted] || 50)) }
  const resetKapasitet = () => { setMaxDeltakere(String(STEDER[sted] || 50)); setMaxOverstyrt(false) }

  const handleAIAssist = async () => {
    if (!tittel) { alert('Fyll ut tittel først!'); return }
    setIsGenerating(true); setAiSuggestion('')
    try {
      const res = await fetch('/api/ai/generate-text', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ type:'arrangement', prompt:`Skriv en engasjerende beskrivelse for arrangementet "${tittel}". ${beskrivelse ? `Idé: ${beskrivelse}` : ''}`, context:'Bergen Biblioteks arrangementskalender.' }) })
      const data = await res.json(); if (data.text) setAiSuggestion(data.text)
    } catch { alert('AI-tjenesten er ikke tilgjengelig') } finally { setIsGenerating(false) }
  }

  const handleKlarspraak = async () => {
    if (!beskrivelse) { alert('Skriv tekst først!'); return }
    setIsCheckingLanguage(true)
    try {
      const res = await fetch('/api/ai/generate-text', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ type:'klarspråk', prompt:`Forbedre denne teksten etter klarspråkprinsippene. Returner KUN forbedret tekst:\n\n${beskrivelse}`, context:'Klarspråk.' }) })
      const data = await res.json(); if (data.text) setAiSuggestion(data.text)
    } catch (e) { console.error(e) } finally { setIsCheckingLanguage(false) }
  }

  const handleEdit = (arr: Arrangement) => {
    setEditingId(arr.id); setTittel(arr.tittel); setBeskrivelse(arr.beskrivelse); setDato(arr.dato)
    setKlokkeslett(arr.klokkeslett); setSted(arr.sted); setKategori(arr.kategori); setBildeUrl(arr.bildeUrl || '')
    setMaxDeltakere(String(arr.maxDeltakere)); setMaxOverstyrt(arr.maxOverstyrt); setSerieTittel(arr.serieTittel || '')
    setIsSerie(false); setKobletTittel(null); setAiSuggestion(''); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDuplicate = async (arr: Arrangement) => {
    if (!confirm(`Duplisere "${arr.tittel}"?`)) return
    try {
      const res = await fetch('/api/arrangementer', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ tittel:arr.tittel+' (kopi)', beskrivelse:arr.beskrivelse, dato:arr.dato, klokkeslett:arr.klokkeslett, sted:arr.sted, kategori:arr.kategori, bildeUrl:arr.bildeUrl, maxDeltakere:arr.maxDeltakere, maxOverstyrt:arr.maxOverstyrt, serieTittel:arr.serieTittel, publisert:false }) })
      if (res.ok) { fetchData(); toast('Duplisert som kladd!') }
    } catch { toast('Feil ved duplisering') }
  }

  const handleDelete = async (id: string, tittel: string) => {
    if (!confirm(`Slette "${tittel}"?`)) return
    try { const res = await fetch(`/api/arrangementer?id=${id}`, { method:'DELETE' }); if (res.ok) { fetchData(); toast('Slettet') } }
    catch { toast('Feil') }
  }

  const handleTogglePublish = async (id: string, current: boolean) => {
    try { await fetch('/api/arrangementer', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id, publisert:!current }) }); fetchData(); toast(current ? 'Avpublisert' : 'Publisert!') }
    catch { toast('Feil') }
  }

  const handleSave = async (publiser: boolean) => {
    if (!tittel || !dato || !klokkeslett) { alert('Tittel, dato og klokkeslett er påkrevd!'); return }
    const stdKap = STEDER[sted] || 50; const kap = parseInt(maxDeltakere) || stdKap
    const basePayload = { tittel, beskrivelse, klokkeslett, sted, kategori, bildeUrl:bildeUrl||null, maxDeltakere:kap, maxOverstyrt:kap!==stdKap, serieTittel:(isSerie?(serieTittel||tittel):serieTittel)||null, publisert:publiser }
    try {
      if (editingId) {
        const res = await fetch('/api/arrangementer', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:editingId, dato, ...basePayload }) })
        if (res.ok) { resetForm(); setShowForm(false); fetchData(); toast('Oppdatert!') }
      } else if (isSerie && serieDatoer.length > 1) {
        for (const d of serieDatoer) await fetch('/api/arrangementer', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...basePayload, dato:d }) })
        resetForm(); setShowForm(false); fetchData(); toast(`${serieDatoer.length} arrangementer i serie opprettet!`)
      } else {
        const res = await fetch('/api/arrangementer', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...basePayload, dato }) })
        if (res.ok) { resetForm(); setShowForm(false); fetchData(); toast(publiser ? 'Publisert!' : 'Lagret som kladd!') }
      }
    } catch { toast('Noe gikk galt') }
  }

  const naa = new Date()
  let filtrert = [...arrangementer]
  if (filterKategori !== 'Alle') filtrert = filtrert.filter(a => a.kategori === filterKategori)
  if (filterTid === 'kommende') filtrert = filtrert.filter(a => new Date(a.dato) >= naa)
  else if (filterTid === 'tidligere') filtrert = filtrert.filter(a => new Date(a.dato) < naa)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Arrangementer</h1>
          <p className="mt-2 text-gray-600">Administrer arrangementer, billetter og påmeldinger</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">
          {showForm ? 'Lukk' : '+ Nytt arrangement'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Rediger arrangement' : 'Nytt arrangement'}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tittel *</label>
                <input type="text" value={tittel} onChange={e => setTittel(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="F.eks. 'Forfatterkveld: Agnes Ravatn'" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select value={kategori} onChange={e => setKategori(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                  {KATEGORIER.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Dato *</label><input type="date" value={dato} onChange={e => setDato(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Klokkeslett *</label><input type="time" value={klokkeslett} onChange={e => setKlokkeslett(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Serietittel</label><input type="text" value={serieTittel} onChange={e => setSerieTittel(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="Valgfritt" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasjon</label>
                <select value={sted} onChange={e => handleStedChange(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                  {Object.entries(STEDER).map(([s, kap]) => <option key={s} value={s}>{s} (standard: {kap} plasser)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Antall billetter / plasser{maxOverstyrt && <span className="ml-2 text-xs text-orange-600 font-normal">(overstyrt fra {STEDER[sted]||50})</span>}</label>
                <div className="flex items-center space-x-2">
                  <input type="number" value={maxDeltakere} onChange={e => handleKapasitetChange(e.target.value)} className={`flex-1 px-4 py-2.5 border rounded-lg ${maxOverstyrt ? 'border-orange-300 bg-orange-50' : 'border-gray-300'}`} min="1" />
                  {maxOverstyrt && <button onClick={resetKapasitet} className="px-3 py-2.5 text-xs text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 whitespace-nowrap">Tilbakestill</button>}
                </div>
              </div>
            </div>

            {!editingId && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={isSerie} onChange={e => setIsSerie(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
                  <span className="flex items-center gap-1.5 font-medium text-indigo-900">{ic.repeat} Opprett som arrangementsserie</span>
                </label>
                {isSerie && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-indigo-700 mb-1">Frekvens</label><select value={serieFrekvens} onChange={e => setSerieFrekvens(e.target.value as any)} className="w-full px-3 py-2 border border-indigo-300 rounded-lg bg-white"><option value="ukentlig">Ukentlig</option><option value="månedlig">Månedlig</option></select></div>
                    <div><label className="block text-sm font-medium text-indigo-700 mb-1">Antall ganger</label><input type="number" value={serieAntall} onChange={e => setSerieAntall(parseInt(e.target.value)||2)} min={2} max={12} className="w-full px-3 py-2 border border-indigo-300 rounded-lg bg-white" /></div>
                    {serieDatoer.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-indigo-700 mb-2">Planlagte datoer:</p>
                        <div className="flex flex-wrap gap-2">
                          {serieDatoer.map((d, i) => (
                            <span key={i} className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                              {ic.calendar} {new Date(d).toLocaleDateString('nb-NO', { weekday:'short', day:'numeric', month:'short' })}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">{ic.link} Knytt til tittel i katalogen (valgfritt)</label>
              <input type="text" value={katalogSoek} onChange={e => setKatalogSoek(e.target.value)} className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500" placeholder="Søk etter bok å knytte til arrangementet..." />
              {showKatalogDropdown && katalogResultater.length > 0 && (
                <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {katalogResultater.map(bok => (
                    <button key={bok.id} onClick={() => { setKobletTittel(bok); setKatalogSoek(''); setShowKatalogDropdown(false) }} className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0">
                      <span className="font-semibold">{bok.tittel}</span><span className="text-gray-500 text-sm ml-2">— {bok.forfatter}</span>
                    </button>
                  ))}
                </div>
              )}
              {kobletTittel && (
                <div className="mt-2 flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-600">{ic.check}</span>
                  <span className="text-sm text-green-800">Knyttet til: <strong>{kobletTittel.tittel}</strong> av {kobletTittel.forfatter}</span>
                  <button onClick={() => setKobletTittel(null)} className="text-green-600 hover:text-green-800 text-sm ml-auto">Fjern</button>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Beskrivelse</label>
                <div className="flex space-x-2">
                  <button onClick={handleKlarspraak} disabled={isCheckingLanguage} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                    {ic.edit} {isCheckingLanguage ? 'Sjekker...' : 'Klarspråk'}
                  </button>
                  <button onClick={handleAIAssist} disabled={isGenerating} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">
                    {ic.sparkle} {isGenerating ? 'Genererer...' : 'AI-hjelp'}
                  </button>
                </div>
              </div>
              <textarea value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="Beskriv arrangementet..." />
            </div>

            {aiSuggestion && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="flex items-center gap-1.5 text-sm font-medium text-purple-900 mb-2">{ic.sparkle} Forslag:</p>
                <p className="text-sm text-purple-800 whitespace-pre-line">{aiSuggestion}</p>
                <div className="flex space-x-3 mt-3">
                  <button onClick={() => { setBeskrivelse(aiSuggestion); setAiSuggestion('') }} className="text-sm text-purple-600 font-medium hover:text-purple-800">Bruk dette &rarr;</button>
                  <button onClick={() => setAiSuggestion('')} className="text-sm text-gray-500 hover:text-gray-700">Forkast</button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forsidebilde</label>
              <div className="flex items-center space-x-3">
                <input type="text" value={bildeUrl} onChange={e => setBildeUrl(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="Bilde-URL" />
                <button onClick={() => setShowBildeVelger(true)} className="px-4 py-2.5 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 font-medium text-sm whitespace-nowrap">Velg fra bibliotek</button>
              </div>
              {bildeUrl && <div className="mt-2 flex items-start space-x-3"><img src={bildeUrl} alt="" className="h-24 rounded-lg object-cover border" /><button onClick={() => setBildeUrl('')} className="text-xs text-red-500">Fjern</button></div>}
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t">
              <button onClick={() => handleSave(true)} className="px-6 py-2.5 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">
                {editingId ? 'Oppdater og publiser' : (isSerie ? `Publiser ${serieDatoer.length} arrangementer` : 'Publiser')}
              </button>
              <button onClick={() => handleSave(false)} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium">Lagre som kladd</button>
              <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-6 py-2.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-medium">{ic.eye} Forhåndsvisning</button>
              <button onClick={() => { resetForm(); setShowForm(false) }} className="px-6 py-2.5 text-gray-600">Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-lg font-semibold">{ic.eye} Forhåndsvisning — slik ser det ut for publikum</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-8">
              <div className="bg-gray-50 rounded-xl p-6">
                {bildeUrl && <img src={bildeUrl} alt="" className="w-full h-48 object-cover rounded-lg mb-4" />}
                <span className="inline-block px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium mb-3">{kategori}</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{tittel || 'Tittel mangler'}</h2>
                <div className="text-gray-600 text-sm space-y-1.5 mb-4">
                  <p className="flex items-center gap-2"><span className="text-gray-400">{ic.calendar}</span> {dato ? new Date(dato).toLocaleDateString('nb-NO', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : 'Dato mangler'}</p>
                  <p className="flex items-center gap-2"><span className="text-gray-400">{ic.clock}</span> {klokkeslett || 'Tid mangler'}</p>
                  <p className="flex items-center gap-2"><span className="text-gray-400">{ic.pin}</span> {sted}</p>
                  <p className="flex items-center gap-2"><span className="text-gray-400">{ic.users}</span> {maxDeltakere || STEDER[sted] || 50} plasser</p>
                </div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{beskrivelse || 'Beskrivelse mangler'}</p>
                {kobletTittel && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <span className="text-blue-600">{ic.book}</span> Relatert bok: {kobletTittel.tittel} av {kobletTittel.forfatter}
                  </div>
                )}
                {isSerie && serieDatoer.length > 1 && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
                    {ic.repeat} Del av serie — {serieDatoer.length} datoer
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showBildeVelger && <BildeVelger gjeldendeBildeUrl={bildeUrl} onVelg={(url) => { setBildeUrl(url); setShowBildeVelger(false) }} onLukk={() => setShowBildeVelger(false)} />}

      <div className="flex items-center space-x-4">
        <div className="flex bg-white rounded-lg border overflow-hidden">
          {(['kommende','alle','tidligere'] as const).map(tid => (
            <button key={tid} onClick={() => setFilterTid(tid)} className={`px-4 py-2 text-sm font-medium ${filterTid === tid ? 'bg-[#16425b] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {tid === 'kommende' ? 'Kommende' : tid === 'alle' ? 'Alle' : 'Tidligere'}
            </button>
          ))}
        </div>
        <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)} className="px-4 py-2 border rounded-lg text-sm">
          <option value="Alle">Alle kategorier</option>{KATEGORIER.map(k => <option key={k}>{k}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtrert.length} arrangementer</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-gray-500">Laster...</div>
        : filtrert.length === 0 ? <div className="p-8 text-center text-gray-500">Ingen arrangementer funnet</div>
        : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-5 py-3 text-sm font-semibold">Arrangement</th>
              <th className="text-left px-5 py-3 text-sm font-semibold">Dato</th>
              <th className="text-left px-5 py-3 text-sm font-semibold">Sted</th>
              <th className="text-left px-5 py-3 text-sm font-semibold">Billetter</th>
              <th className="text-left px-5 py-3 text-sm font-semibold">Status</th>
              <th className="text-right px-5 py-3 text-sm font-semibold">Handlinger</th>
            </tr></thead>
            <tbody className="divide-y">
              {filtrert.map(arr => {
                const passert = new Date(arr.dato) < naa
                const belegg = arr.maxDeltakere > 0 ? Math.round((arr.antallPaameldt / arr.maxDeltakere) * 100) : 0
                const erFullt = belegg >= 100
                return (
                  <tr key={arr.id} className={`hover:bg-gray-50 ${passert ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-3">
                        {arr.bildeUrl ? <img src={arr.bildeUrl} alt="" className="w-11 h-11 rounded-lg object-cover" />
                        : <div className="w-11 h-11 bg-[#16425b]/10 rounded-lg flex items-center justify-center text-[#16425b]">{ic.calendar}</div>}
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{arr.tittel}</div>
                          <div className="text-xs text-gray-500">{arr.kategori}</div>
                          {arr.serieTittel && <div className="text-xs text-purple-600">Serie: {arr.serieTittel}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{new Date(arr.dato).toLocaleDateString('nb-NO', { day:'numeric', month:'short' })}<br/><span className="text-xs text-gray-400">kl {arr.klokkeslett}</span></td>
                    <td className="px-5 py-3 text-sm text-gray-600 max-w-[180px] truncate">{arr.sted}</td>
                    <td className="px-5 py-3">
                      <div className="text-sm"><span className={`font-semibold ${erFullt ? 'text-red-600' : 'text-gray-900'}`}>{arr.antallPaameldt}</span><span className="text-gray-400"> / {arr.maxDeltakere}</span>{arr.maxOverstyrt && <span className="ml-1 text-xs text-orange-500" title="Overstyrt kapasitet">*</span>}</div>
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1"><div className={`h-full rounded-full ${belegg>=90?'bg-red-500':belegg>=70?'bg-yellow-500':'bg-green-500'}`} style={{ width:`${Math.min(belegg,100)}%` }} /></div>
                      {erFullt && <span className="text-xs text-red-600 font-medium">Fullt!</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${passert?'bg-gray-100 text-gray-600':arr.publisert?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{passert?'Avholdt':arr.publisert?'Publisert':'Kladd'}</span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button onClick={() => setPreviewId(previewId===arr.id?null:arr.id)} className="text-xs text-gray-500 font-medium">Forhåndsvisning</button>
                      <button onClick={() => handleDuplicate(arr)} className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">{ic.copy} Dupliser</button>
                      {!passert && <button onClick={() => handleTogglePublish(arr.id, arr.publisert)} className={`text-xs font-medium ${arr.publisert?'text-yellow-600':'text-green-600'}`}>{arr.publisert?'Avpubliser':'Publiser'}</button>}
                      <button onClick={() => handleEdit(arr)} className="text-xs text-[#16425b] font-medium">Rediger</button>
                      <button onClick={() => handleDelete(arr.id, arr.tittel)} className="text-xs text-red-600 font-medium">Slett</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {previewId && (() => {
        const arr = arrangementer.find(a => a.id === previewId); if (!arr) return null
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPreviewId(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {arr.bildeUrl && <img src={arr.bildeUrl} alt="" className="w-full h-56 object-cover rounded-t-2xl" />}
              <div className="p-8">
                <span className="inline-block px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium mb-3">{arr.kategori}</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{arr.tittel}</h2>
                <div className="text-gray-600 text-sm space-y-1.5 mb-4">
                  <p className="flex items-center gap-2"><span className="text-gray-400">{ic.calendar}</span> {new Date(arr.dato).toLocaleDateString('nb-NO', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
                  <p className="flex items-center gap-2"><span className="text-gray-400">{ic.clock}</span> kl {arr.klokkeslett}</p>
                  <p className="flex items-center gap-2"><span className="text-gray-400">{ic.pin}</span> {arr.sted}</p>
                  <p className="flex items-center gap-2"><span className="text-gray-400">{ic.users}</span> {arr.antallPaameldt} / {arr.maxDeltakere} plasser</p>
                </div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{arr.beskrivelse}</p>
                {arr.serieTittel && <div className="mt-4 flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">{ic.repeat} Del av serie: {arr.serieTittel}</div>}
              </div>
              <button onClick={() => setPreviewId(null)} className="absolute top-4 right-4 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center text-lg shadow hover:bg-white">&times;</button>
            </div>
          </div>
        )
      })()}

      {showToast && <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">{toastMsg}</div>}
    </div>
  )
}
