'use client'

import { useState, useEffect } from 'react'
import BildeVelger from '@/components/BildeVelger'

interface SamlingTittel { id: string; tittel: string; forfatter: string; bildeUrl: string|null; kommentar: string; katalogId: string|null }
interface Anbefaling { id: string; type:'enkel'|'samling'; tittel: string; forfatter: string|null; beskrivelse: string; bildeUrl: string|null; publisert: boolean; opprettet: string; katalogId: string|null; titler?: SamlingTittel[] }
interface KatalogBok { id: string; tittel: string; forfatter: string; sjanger: string; isbn: string|null; bildeUrl: string|null }

/* ───── SVG Icons ───── */
const ic = {
  bookOpen: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  books: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  link: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  sparkle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  x: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>,
}

export default function AnbefalingerPage() {
  const [anbefalinger, setAnbefalinger] = useState<Anbefaling[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'alle'|'enkel'|'samling'>('alle')
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [anbType, setAnbType] = useState<'enkel'|'samling'>('enkel')
  const [tittel, setTittel] = useState(''); const [forfatter, setForfatter] = useState('')
  const [beskrivelse, setBeskrivelse] = useState(''); const [bildeUrl, setBildeUrl] = useState('')
  const [samlingTitler, setSamlingTitler] = useState<SamlingTittel[]>([])
  const [showBildeVelger, setShowBildeVelger] = useState(false)
  const [bildeVelgerTarget, setBildeVelgerTarget] = useState<'hoved'|number>('hoved')
  const [katalogSoek, setKatalogSoek] = useState(''); const [katalogResultater, setKatalogResultater] = useState<KatalogBok[]>([])
  const [showKatalogDropdown, setShowKatalogDropdown] = useState(false)
  const [valgtBok, setValgtBok] = useState<KatalogBok | null>(null)
  const [isSearchingKatalog, setIsSearchingKatalog] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState(''); const [isGenerating, setIsGenerating] = useState(false)
  const [isCheckingLanguage, setIsCheckingLanguage] = useState(false)
  const [showFormPreview, setShowFormPreview] = useState(false)
  const [showToast, setShowToast] = useState(false); const [toastMsg, setToastMsg] = useState('')

  useEffect(() => { fetchAnbefalinger() }, [])
  useEffect(() => {
    if (katalogSoek.length < 2) { setKatalogResultater([]); setShowKatalogDropdown(false); return }
    const timer = setTimeout(async () => {
      setIsSearchingKatalog(true)
      try { const res = await fetch(`/api/katalog?q=${encodeURIComponent(katalogSoek)}`); const data = await res.json(); if (Array.isArray(data)) { setKatalogResultater(data); setShowKatalogDropdown(true) } }
      catch (e) { console.error(e) } finally { setIsSearchingKatalog(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [katalogSoek])

  const fetchAnbefalinger = async () => { try { const res = await fetch('/api/anbefalinger'); const data = await res.json(); if (Array.isArray(data)) setAnbefalinger(data) } catch (e) { console.error(e) } finally { setIsLoading(false) } }
  const toast = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3500) }
  const resetForm = () => { setEditingId(null); setAnbType('enkel'); setTittel(''); setForfatter(''); setBeskrivelse(''); setBildeUrl(''); setSamlingTitler([]); setValgtBok(null); setKatalogSoek(''); setAiSuggestion(''); setShowFormPreview(false) }

  const handleSelectBook = (bok: KatalogBok) => {
    setValgtBok(bok)
    if (anbType === 'enkel') { setTittel(bok.tittel); setForfatter(bok.forfatter); if (bok.bildeUrl) setBildeUrl(bok.bildeUrl) }
    setKatalogSoek(''); setShowKatalogDropdown(false)
  }
  const handleEdit = (anb: Anbefaling) => { setEditingId(anb.id); setAnbType(anb.type); setTittel(anb.tittel); setForfatter(anb.forfatter||''); setBeskrivelse(anb.beskrivelse); setBildeUrl(anb.bildeUrl||''); setSamlingTitler(anb.titler||[]); setValgtBok(null); setAiSuggestion(''); setShowForm(true); window.scrollTo({ top:0, behavior:'smooth' }) }
  const handleDelete = async (id: string, tittel: string) => { if (!confirm(`Slette "${tittel}"?`)) return; try { const res = await fetch(`/api/anbefalinger?id=${id}`, { method:'DELETE' }); if (res.ok) { fetchAnbefalinger(); toast('Slettet') } } catch { toast('Feil ved sletting') } }
  const handleTogglePublish = async (id: string, current: boolean) => { try { await fetch('/api/anbefalinger', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id, publisert:!current }) }); fetchAnbefalinger(); toast(current ? 'Avpublisert' : 'Publisert!') } catch { toast('Feil') } }

  const handleAIAssist = async () => {
    if (!tittel) { alert('Fyll ut tittel først!'); return }; setIsGenerating(true); setAiSuggestion('')
    try { const res = await fetch('/api/ai/generate-text', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type:'anbefaling', prompt:`Skriv en engasjerende anbefaling for "${tittel}"${forfatter?` av ${forfatter}`:''}. ${beskrivelse?`Idé: ${beskrivelse}`:''}`, context:'Bergen Offentlige Bibliotek.' }) }); const data = await res.json(); if (data.text) setAiSuggestion(data.text); else if (data.error) alert(data.error) }
    catch { alert('AI-tjenesten er ikke tilgjengelig') } finally { setIsGenerating(false) }
  }
  const handleKlarspraak = async () => {
    if (!beskrivelse) { alert('Skriv tekst først!'); return }; setIsCheckingLanguage(true)
    try { const res = await fetch('/api/ai/generate-text', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type:'klarspråk', prompt:`Forbedre denne teksten etter klarspråkprinsippene. Returner KUN forbedret tekst:\n\n${beskrivelse}`, context:'Klarspråk.' }) }); const data = await res.json(); if (data.text) setAiSuggestion(data.text) }
    catch (e) { console.error(e) } finally { setIsCheckingLanguage(false) }
  }

  const handleSave = async (publiser: boolean) => {
    if (!tittel) { alert('Tittel er påkrevd!'); return }; if (!beskrivelse) { alert('Beskrivelse er påkrevd!'); return }
    if (anbType === 'samling' && samlingTitler.length === 0) { alert('Legg til minst én tittel i samlingen!'); return }
    const payload = { type:anbType, tittel, forfatter:anbType==='enkel'?(forfatter||null):null, beskrivelse, bildeUrl:bildeUrl||null, publisert:publiser, katalogId:valgtBok?.id||null, titler:anbType==='samling'?samlingTitler:undefined }
    try {
      const res = editingId
        ? await fetch('/api/anbefalinger', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:editingId, ...payload }) })
        : await fetch('/api/anbefalinger', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      if (res.ok) { resetForm(); setShowForm(false); fetchAnbefalinger(); toast(editingId ? 'Oppdatert!' : (publiser ? 'Publisert!' : 'Lagret som kladd!')) }
    } catch { toast('Noe gikk galt') }
  }

  const addTittel = () => setSamlingTitler(prev => [...prev, { id:`st-${Date.now()}`, tittel:'', forfatter:'', bildeUrl:null, kommentar:'', katalogId:null }])
  const updateTittel = (idx: number, field: string, value: string) => setSamlingTitler(prev => prev.map((t,i) => i===idx ? { ...t, [field]:value } : t))
  const removeTittel = (idx: number) => setSamlingTitler(prev => prev.filter((_,i) => i!==idx))
  const moveTittel = (idx: number, dir:'up'|'down') => { setSamlingTitler(prev => { const swap = dir==='up'?idx-1:idx+1; if (swap<0||swap>=prev.length) return prev; const copy=[...prev]; [copy[idx],copy[swap]]=[copy[swap],copy[idx]]; return copy }) }

  const handleBildeValgt = (url: string) => { if (bildeVelgerTarget === 'hoved') setBildeUrl(url); else updateTittel(bildeVelgerTarget as number, 'bildeUrl', url); setShowBildeVelger(false) }
  const openBildeVelger = (target:'hoved'|number) => { setBildeVelgerTarget(target); setShowBildeVelger(true) }

  const filtrert = filter === 'alle' ? anbefalinger : anbefalinger.filter(a => a.type === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">Anbefalinger</h1><p className="mt-2 text-gray-600">Enkeltanbefalinger og samlelister for formidling</p></div>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }} className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">{showForm ? 'Lukk skjema' : '+ Ny anbefaling'}</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Rediger anbefaling' : 'Ny anbefaling'}</h3>
          <div className="flex space-x-3 mb-6">
            <button onClick={() => setAnbType('enkel')} className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${anbType==='enkel'?'border-[#16425b] bg-[#16425b]/5':'border-gray-200'}`}>
              <span className="text-gray-600">{ic.bookOpen}</span><div className="font-semibold mt-1">Enkeltanbefaling</div><div className="text-xs text-gray-500">En bok eller tittel</div>
            </button>
            <button onClick={() => setAnbType('samling')} className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${anbType==='samling'?'border-[#16425b] bg-[#16425b]/5':'border-gray-200'}`}>
              <span className="text-gray-600">{ic.books}</span><div className="font-semibold mt-1">Samleanbefaling</div><div className="text-xs text-gray-500">Leseliste med flere titler</div>
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">{ic.link} Knytt til tittel i katalogen</label>
              <input type="text" value={katalogSoek} onChange={e => setKatalogSoek(e.target.value)} className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500" placeholder="Søk tittel, forfatter eller ISBN..." />
              {isSearchingKatalog && <div className="absolute right-3 top-9 text-sm text-gray-400">Søker...</div>}
              {showKatalogDropdown && katalogResultater.length > 0 && (
                <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  {katalogResultater.map(bok => (
                    <button key={bok.id} onClick={() => handleSelectBook(bok)} className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0 flex items-center space-x-3">
                      {bok.bildeUrl ? <img src={bok.bildeUrl} alt="" className="w-8 h-10 rounded object-cover" /> : <span className="text-gray-400">{ic.books}</span>}
                      <div><div className="font-semibold">{bok.tittel}</div><div className="text-sm text-gray-600">{bok.forfatter} {bok.sjanger ? `· ${bok.sjanger}` : ''}</div></div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {valgtBok && (
              <div className="flex items-center space-x-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-600">{ic.check}</span>
                <div className="flex-1"><p className="font-semibold text-green-900 text-sm">Knyttet til: {valgtBok.tittel}</p><p className="text-xs text-green-700">{valgtBok.forfatter}</p></div>
                <button onClick={() => setValgtBok(null)} className="text-green-600 text-sm hover:text-green-800">Fjern</button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{anbType==='samling'?'Listetittel *':'Boktittel *'}</label><input type="text" value={tittel} onChange={e => setTittel(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]" placeholder={anbType==='samling'?'F.eks. "Lesetips til 1. og 2. klasse"':'F.eks. "Fuglane"'} /></div>
              {anbType === 'enkel' && <div><label className="block text-sm font-medium text-gray-700 mb-1">Forfatter</label><input type="text" value={forfatter} onChange={e => setForfatter(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" /></div>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">{anbType==='samling'?'Introduksjon *':'Anmeldelse / beskrivelse *'}</label>
                <div className="flex space-x-2">
                  <button onClick={handleKlarspraak} disabled={isCheckingLanguage} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">{ic.edit} {isCheckingLanguage?'Sjekker...':'Klarspråk'}</button>
                  <button onClick={handleAIAssist} disabled={isGenerating} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">{ic.sparkle} {isGenerating?'Genererer...':'AI-hjelp'}</button>
                </div>
              </div>
              <textarea value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder={anbType==='samling'?'Kort introduksjon til listen...':'Din anbefaling av boken...'} />
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
                <button onClick={() => openBildeVelger('hoved')} className="px-4 py-2.5 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 font-medium text-sm whitespace-nowrap">Velg fra bibliotek</button>
              </div>
              {bildeUrl && <div className="mt-2 flex items-start space-x-3"><img src={bildeUrl} alt="" className="h-24 rounded-lg object-cover border" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/><button onClick={() => setBildeUrl('')} className="text-xs text-red-500 hover:text-red-700">Fjern</button></div>}
            </div>

            {anbType === 'samling' && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Titler i samlingen ({samlingTitler.length})</label>
                  <button onClick={addTittel} className="px-3 py-1.5 bg-[#16425b] text-white text-sm rounded-lg hover:bg-[#1a5270]">+ Legg til tittel</button>
                </div>
                {samlingTitler.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
                    <div className="flex justify-center mb-2 text-gray-400">{ic.books}</div>
                    <p>Ingen titler enda. Klikk &quot;Legg til tittel&quot; for å starte.</p>
                  </div>
                )}
                <div className="space-y-3">
                  {samlingTitler.map((t, idx) => (
                    <div key={t.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <button onClick={() => openBildeVelger(idx)} className="w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-[#16425b] transition-colors">
                          {t.bildeUrl ? <img src={t.bildeUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center">+bilde</div>}
                        </button>
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" value={t.tittel} onChange={e => updateTittel(idx,'tittel',e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Boktittel" />
                            <input type="text" value={t.forfatter} onChange={e => updateTittel(idx,'forfatter',e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Forfatter" />
                          </div>
                          <input type="text" value={t.kommentar} onChange={e => updateTittel(idx,'kommentar',e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Kort kommentar (f.eks. 'Perfekt for høytlesing')" />
                        </div>
                        <div className="flex flex-col space-y-1 flex-shrink-0">
                          <button onClick={() => moveTittel(idx,'up')} disabled={idx===0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20 text-sm">&uarr;</button>
                          <button onClick={() => moveTittel(idx,'down')} disabled={idx===samlingTitler.length-1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20 text-sm">&darr;</button>
                          <button onClick={() => removeTittel(idx)} className="p-1 text-red-400 hover:text-red-600">{ic.x}</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-4 border-t">
              <button onClick={() => handleSave(true)} className="px-6 py-2.5 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">{editingId?'Oppdater og publiser':'Publiser'}</button>
              <button onClick={() => handleSave(false)} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Lagre som kladd</button>
              <button onClick={() => setShowFormPreview(true)} className="flex items-center gap-1.5 px-6 py-2.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-medium">{ic.eye} Forhåndsvisning</button>
              <button onClick={() => { resetForm(); setShowForm(false) }} className="px-6 py-2.5 text-gray-600 hover:text-gray-900">Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {showBildeVelger && <BildeVelger gjeldendeBildeUrl={bildeVelgerTarget==='hoved'?bildeUrl:(samlingTitler[bildeVelgerTarget as number]?.bildeUrl||undefined)} onVelg={handleBildeValgt} onLukk={() => setShowBildeVelger(false)} />}

      {showFormPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFormPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-lg font-semibold">{ic.eye} Forhåndsvisning</h3>
              <button onClick={() => setShowFormPreview(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-8">
              <div className="bg-gray-50 rounded-xl p-6">
                {bildeUrl && <img src={bildeUrl} alt={tittel} className="w-full h-48 object-cover rounded-lg mb-4" />}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium mb-3">
                  {anbType==='samling'?ic.books:ic.star} {anbType==='samling'?'Samleanbefaling':'Anbefaling'}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{tittel || 'Tittel'}</h2>
                {anbType==='enkel' && <p className="text-gray-600 mb-4">{forfatter || 'Forfatter'}</p>}
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{beskrivelse || 'Beskrivelse'}</p>
                {valgtBok && <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">{ic.books} Knyttet til: {valgtBok.tittel} av {valgtBok.forfatter}</div>}
                {anbType==='samling' && samlingTitler.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="font-medium text-gray-700 text-sm">{samlingTitler.length} titler i listen:</p>
                    {samlingTitler.map((t,i) => <div key={i} className="flex items-center space-x-3 p-2 bg-white rounded-lg"><span className="text-gray-400 text-sm">{i+1}.</span><div><span className="font-medium text-sm">{t.tittel||'Uten tittel'}</span>{t.forfatter && <span className="text-gray-500 text-sm ml-1">— {t.forfatter}</span>}</div></div>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-3">
        {(['alle','enkel','samling'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter===f?'bg-[#16425b] text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f==='alle'?'Alle':f==='enkel'?<>{ic.bookOpen} Enkelt</>:<>{ic.books} Samlinger</>}
          </button>
        ))}
        <span className="text-sm text-gray-500">{filtrert.length} anbefalinger</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-gray-500">Laster...</div>
        : filtrert.length === 0 ? <div className="p-8 text-center text-gray-500">Ingen anbefalinger funnet</div>
        : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Anbefaling</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Type</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Status</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Opprettet</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">Handlinger</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
              {filtrert.map(anb => (
                <tr key={anb.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {anb.bildeUrl ? <img src={anb.bildeUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      : <div className="w-12 h-12 bg-[#16425b]/10 rounded-lg flex items-center justify-center text-[#16425b]">{anb.type==='samling'?ic.books:ic.bookOpen}</div>}
                      <div>
                        <div className="font-medium text-gray-900">{anb.tittel}</div>
                        {anb.type==='enkel' && anb.forfatter && <div className="text-sm text-gray-500">{anb.forfatter}</div>}
                        {anb.type==='samling' && anb.titler && <div className="text-xs text-purple-600">{anb.titler.length} titler i listen</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium ${anb.type==='samling'?'bg-purple-100 text-purple-800':'bg-blue-100 text-blue-800'}`}>
                      {anb.type==='samling'?ic.books:ic.bookOpen} {anb.type==='samling'?'Samling':'Enkelt'}
                    </span>
                  </td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs rounded-full font-medium ${anb.publisert?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{anb.publisert?'Publisert':'Kladd'}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(anb.opprettet).toLocaleDateString('nb-NO')}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => setPreviewId(previewId===anb.id?null:anb.id)} className="text-sm text-gray-500 font-medium">Forhåndsvisning</button>
                    <button onClick={() => handleTogglePublish(anb.id, anb.publisert)} className={`text-sm font-medium ${anb.publisert?'text-yellow-600':'text-green-600'}`}>{anb.publisert?'Avpubliser':'Publiser'}</button>
                    <button onClick={() => handleEdit(anb)} className="text-[#16425b] font-medium text-sm">Rediger</button>
                    <button onClick={() => handleDelete(anb.id, anb.tittel)} className="text-red-600 font-medium text-sm">Slett</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {previewId && (() => {
        const anb = anbefalinger.find(a => a.id === previewId); if (!anb) return null
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPreviewId(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {anb.bildeUrl && <img src={anb.bildeUrl} alt="" className="w-full h-56 object-cover rounded-t-2xl" />}
              <div className="p-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium mb-3">
                  {anb.type==='samling'?ic.books:ic.star} {anb.type==='samling'?'Samleanbefaling':'Anbefaling'}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{anb.tittel}</h2>
                {anb.type==='enkel' && anb.forfatter && <p className="text-gray-600 mb-4">{anb.forfatter}</p>}
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{anb.beskrivelse}</p>
                {anb.type==='samling' && anb.titler && anb.titler.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <p className="font-semibold text-gray-700">Titler i listen:</p>
                    {anb.titler.map((t,i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {t.bildeUrl ? <img src={t.bildeUrl} alt="" className="w-10 h-12 rounded object-cover" />
                        : <div className="w-10 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">{ic.bookOpen}</div>}
                        <div><div className="font-medium text-sm">{t.tittel}</div><div className="text-xs text-gray-500">{t.forfatter}</div>{t.kommentar && <div className="text-xs text-gray-400 italic mt-0.5">{t.kommentar}</div>}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 pt-4 border-t text-sm text-gray-500">Opprettet {new Date(anb.opprettet).toLocaleDateString('nb-NO', { day:'numeric', month:'long', year:'numeric' })}</div>
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
