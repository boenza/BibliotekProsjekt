'use client'

import { useState, useEffect } from 'react'
import BildeVelger from '@/components/BildeVelger'

interface Artikkel {
  id: string
  tittel: string
  ingress: string
  innhold: string
  bildeUrl: string | null
  kategori: string
  forfatter: string
  publisert: boolean
  opprettet: string
  oppdatert: string
}

const KATEGORIER = ['Nyheter', 'Kampanjer', 'Digitalt', 'Arrangementer', 'Tips', 'Om biblioteket']

/* ───── SVG Icons ───── */
const ic = {
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  sparkle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  fileText: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
}

export default function ArtiklerPage() {
  const [artikler, setArtikler] = useState<Artikkel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)

  // Form
  const [tittel, setTittel] = useState('')
  const [ingress, setIngress] = useState('')
  const [innhold, setInnhold] = useState('')
  const [bildeUrl, setBildeUrl] = useState('')
  const [kategori, setKategori] = useState(KATEGORIER[0])
  const [forfatter, setForfatter] = useState('Redaksjonen')

  // AI og skriveverktøy
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCheckingLanguage, setIsCheckingLanguage] = useState(false)

  // Forhåndsvisning fra skjema
  const [showFormPreview, setShowFormPreview] = useState(false)

  const [showBildeVelger, setShowBildeVelger] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/artikler')
      const data = await res.json()
      if (Array.isArray(data)) setArtikler(data)
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const toast = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3500) }

  const resetForm = () => {
    setEditingId(null); setTittel(''); setIngress(''); setInnhold('')
    setBildeUrl(''); setKategori(KATEGORIER[0]); setForfatter('Redaksjonen')
    setAiSuggestion(''); setShowFormPreview(false)
  }

  const handleEdit = (art: Artikkel) => {
    setEditingId(art.id); setTittel(art.tittel); setIngress(art.ingress)
    setInnhold(art.innhold); setBildeUrl(art.bildeUrl || ''); setKategori(art.kategori)
    setForfatter(art.forfatter); setAiSuggestion('')
    setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string, tittel: string) => {
    if (!confirm(`Slette "${tittel}"?`)) return
    try {
      const res = await fetch(`/api/artikler?id=${id}`, { method: 'DELETE' })
      if (res.ok) { fetchData(); toast('Slettet') }
    } catch (e) { toast('Feil') }
  }

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await fetch('/api/artikler', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, publisert: !current })
      })
      fetchData(); toast(current ? 'Avpublisert' : 'Publisert!')
    } catch (e) { toast('Feil') }
  }

  // AI-hjelp
  const handleAIAssist = async () => {
    if (!tittel) { alert('Fyll ut tittel først!'); return }
    setIsGenerating(true); setAiSuggestion('')
    try {
      const res = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'artikkel',
          prompt: `Skriv en engasjerende artikkel med tittelen "${tittel}". ${ingress ? `Ingress: ${ingress}` : ''} ${innhold ? `Utkast: ${innhold}` : ''}`,
          context: 'Bergen Offentlige Bibliotek, nettside for publikum.'
        })
      })
      const data = await res.json()
      if (data.text) setAiSuggestion(data.text)
      else if (data.error) alert(data.error)
    } catch (e) { alert('AI-tjenesten er ikke tilgjengelig') }
    finally { setIsGenerating(false) }
  }

  // Klarspråk-sjekk
  const handleKlarspraak = async () => {
    if (!innhold) { alert('Skriv tekst først!'); return }
    setIsCheckingLanguage(true)
    try {
      const res = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'klarspråk',
          prompt: `Forbedre denne teksten etter klarspråkprinsippene. Returner KUN forbedret tekst:\n\n${innhold}`,
          context: 'Klarspråk.'
        })
      })
      const data = await res.json()
      if (data.text) setAiSuggestion(data.text)
    } catch (e) { console.error(e) }
    finally { setIsCheckingLanguage(false) }
  }

  const handleSave = async (publiser: boolean) => {
    if (!tittel) { alert('Tittel er påkrevd!'); return }

    const payload = {
      tittel, ingress, innhold,
      bildeUrl: bildeUrl || null,
      kategori, forfatter,
      publisert: publiser,
    }

    try {
      const res = editingId
        ? await fetch('/api/artikler', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...payload }) })
        : await fetch('/api/artikler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

      if (res.ok) {
        resetForm(); setShowForm(false); fetchData()
        toast(editingId ? 'Oppdatert!' : (publiser ? 'Publisert!' : 'Lagret som kladd!'))
      }
    } catch (e) { toast('Noe gikk galt') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Artikler</h1>
          <p className="mt-2 text-gray-600">Nyheter, kampanjer og redaksjonelt innhold for nettsiden</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">
          {showForm ? 'Lukk' : '+ Ny artikkel'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="flex items-center gap-1.5 text-lg font-semibold mb-4">
            {editingId ? <>{ic.edit} Rediger artikkel</> : 'Ny artikkel'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tittel *</label>
              <input type="text" value={tittel} onChange={e => setTittel(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-lg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select value={kategori} onChange={e => setKategori(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                  {KATEGORIER.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forfatter</label>
                <input type="text" value={forfatter} onChange={e => setForfatter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingress</label>
              <textarea value={ingress} onChange={e => setIngress(e.target.value)} rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                placeholder="Kort sammendrag som vises i listene..." />
            </div>

            {/* Innhold med AI og Klarspråk */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Innhold</label>
                <div className="flex space-x-2">
                  <button onClick={handleKlarspraak} disabled={isCheckingLanguage}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                    {ic.edit} {isCheckingLanguage ? 'Sjekker...' : 'Klarspråk'}
                  </button>
                  <button onClick={handleAIAssist} disabled={isGenerating}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">
                    {ic.sparkle} {isGenerating ? 'Genererer...' : 'AI-hjelp'}
                  </button>
                </div>
              </div>
              <textarea value={innhold} onChange={e => setInnhold(e.target.value)} rows={10}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Artikkelteksten (støtter linjeskift for avsnitt)" />
            </div>

            {/* AI-forslag */}
            {aiSuggestion && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="flex items-center gap-1 text-sm font-medium text-purple-900 mb-2">{ic.sparkle} Forslag:</p>
                <p className="text-sm text-purple-800 whitespace-pre-line">{aiSuggestion}</p>
                <div className="flex space-x-3 mt-3">
                  <button onClick={() => { setInnhold(aiSuggestion); setAiSuggestion('') }}
                    className="text-sm text-purple-600 font-medium hover:text-purple-800">Bruk dette &rarr;</button>
                  <button onClick={() => setAiSuggestion('')}
                    className="text-sm text-gray-500 hover:text-gray-700">Forkast</button>
                </div>
              </div>
            )}

            {/* Bilde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forsidebilde</label>
              <div className="flex items-center space-x-3">
                <input type="text" value={bildeUrl} onChange={e => setBildeUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="Bilde-URL" />
                <button onClick={() => setShowBildeVelger(true)}
                  className="px-4 py-2.5 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 font-medium text-sm whitespace-nowrap">
                  Velg fra bibliotek
                </button>
              </div>
              {bildeUrl && (
                <div className="mt-2 flex items-start space-x-3">
                  <img src={bildeUrl} alt="" className="h-24 rounded-lg object-cover border" />
                  <button onClick={() => setBildeUrl('')} className="text-xs text-red-500">Fjern</button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t">
              <button onClick={() => handleSave(true)}
                className="px-6 py-2.5 bg-[#16425b] text-white rounded-lg font-medium">{editingId ? 'Oppdater og publiser' : 'Publiser'}</button>
              <button onClick={() => handleSave(false)}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium">Lagre som kladd</button>
              <button onClick={() => setShowFormPreview(true)}
                className="flex items-center gap-1 px-6 py-2.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-medium">
                {ic.eye} Forhåndsvisning
              </button>
              <button onClick={() => { resetForm(); setShowForm(false) }}
                className="px-6 py-2.5 text-gray-600">Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {showBildeVelger && (
        <BildeVelger gjeldendeBildeUrl={bildeUrl}
          onVelg={(url) => { setBildeUrl(url); setShowBildeVelger(false) }}
          onLukk={() => setShowBildeVelger(false)} />
      )}

      {/* Forhåndsvisning fra skjema */}
      {showFormPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFormPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-lg font-semibold">{ic.eye} Forhåndsvisning — slik ser det ut for publikum</h3>
              <button onClick={() => setShowFormPreview(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            {bildeUrl && <img src={bildeUrl} alt="" className="w-full h-64 object-cover" />}
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium">{kategori}</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>{tittel || 'Tittel'}</h2>
              {ingress && <p className="text-lg text-gray-600 mb-6 leading-relaxed">{ingress}</p>}
              <div className="prose max-w-none text-gray-700">
                {(innhold || 'Innhold').split('\n').map((avsnitt, i) => (
                  avsnitt.trim() ? <p key={i} className="mb-4">{avsnitt}</p> : null
                ))}
              </div>
              <div className="mt-8 pt-4 border-t text-sm text-gray-500">Av {forfatter}</div>
            </div>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Laster...</div>
        ) : artikler.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Ingen artikler enda</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold">Artikkel</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Kategori</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Forfatter</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Status</th>
                <th className="text-right px-6 py-3 text-sm font-semibold">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {artikler.map(art => (
                <tr key={art.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {art.bildeUrl ? (
                        <img src={art.bildeUrl} alt="" className="w-16 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">{ic.fileText}</div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{art.tittel}</div>
                        {art.ingress && <div className="text-xs text-gray-500 truncate max-w-sm">{art.ingress}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{art.kategori}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{art.forfatter}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      art.publisert ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{art.publisert ? 'Publisert' : 'Kladd'}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => setPreviewId(previewId === art.id ? null : art.id)}
                      className="text-sm text-gray-500 font-medium">Forhåndsvisning</button>
                    <button onClick={() => handleTogglePublish(art.id, art.publisert)}
                      className={`text-sm font-medium ${art.publisert ? 'text-yellow-600' : 'text-green-600'}`}>
                      {art.publisert ? 'Avpubliser' : 'Publiser'}</button>
                    <button onClick={() => handleEdit(art)} className="text-sm text-[#16425b] font-medium">Rediger</button>
                    <button onClick={() => handleDelete(art.id, art.tittel)} className="text-sm text-red-600 font-medium">Slett</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Forhåndsvisning fra liste */}
      {previewId && (() => {
        const art = artikler.find(a => a.id === previewId)
        if (!art) return null
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPreviewId(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {art.bildeUrl && <img src={art.bildeUrl} alt="" className="w-full h-64 object-cover rounded-t-2xl" />}
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium">{art.kategori}</span>
                  <span className="text-sm text-gray-400">{new Date(art.opprettet).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>{art.tittel}</h2>
                {art.ingress && <p className="text-lg text-gray-600 mb-6 leading-relaxed">{art.ingress}</p>}
                <div className="prose max-w-none text-gray-700">
                  {art.innhold.split('\n').map((avsnitt, i) => (
                    avsnitt.trim() ? <p key={i} className="mb-4">{avsnitt}</p> : null
                  ))}
                </div>
                <div className="mt-8 pt-4 border-t text-sm text-gray-500">Av {art.forfatter}</div>
              </div>
              <button onClick={() => setPreviewId(null)}
                className="absolute top-4 right-4 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center text-lg shadow hover:bg-white">&times;</button>
            </div>
          </div>
        )
      })()}

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">{toastMsg}</div>
      )}
    </div>
  )
}
