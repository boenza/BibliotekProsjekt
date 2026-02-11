'use client'

import { useState, useEffect } from 'react'
import ImageEditor from '@/components/ImageEditor'

interface Anbefaling {
  id: string
  tittel: string
  forfatter: string | null
  beskrivelse: string
  bildeUrl: string | null
  publisert: boolean
  opprettet: string
  katalogId?: string | null
}

interface KatalogBok {
  id: string
  tittel: string
  forfatter: string
  sjanger: string
  isbn: string | null
  bildeUrl: string | null
}

export default function AnbefalingerPage() {
  const [showNewForm, setShowNewForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [anbefalinger, setAnbefalinger] = useState<Anbefaling[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [katalogSøk, setKatalogSøk] = useState('')
  const [katalogResultater, setKatalogResultater] = useState<KatalogBok[]>([])
  const [showKatalogDropdown, setShowKatalogDropdown] = useState(false)
  const [valgtBok, setValgtBok] = useState<KatalogBok | null>(null)
  const [isSearchingKatalog, setIsSearchingKatalog] = useState(false)
  const [isCheckingLanguage, setIsCheckingLanguage] = useState(false)
  const [showImageEditor, setShowImageEditor] = useState(false)

  useEffect(() => { fetchAnbefalinger() }, [])

  useEffect(() => {
    if (katalogSøk.length < 2) { setKatalogResultater([]); setShowKatalogDropdown(false); return }
    const timer = setTimeout(async () => {
      setIsSearchingKatalog(true)
      try {
        const res = await fetch(`/api/katalog?q=${encodeURIComponent(katalogSøk)}`)
        const data = await res.json()
        if (Array.isArray(data)) { setKatalogResultater(data); setShowKatalogDropdown(true) }
      } catch (e) { console.error(e) } finally { setIsSearchingKatalog(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [katalogSøk])

  const fetchAnbefalinger = async () => {
    try {
      const res = await fetch('/api/anbefalinger'); const data = await res.json()
      setAnbefalinger(Array.isArray(data) ? data : [])
    } catch (e) { setAnbefalinger([]) } finally { setIsLoading(false) }
  }

  const toast = (msg: string) => { setToastMessage(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000) }

  const resetForm = () => {
    setTitle(''); setAuthor(''); setContent(''); setImageUrl('')
    setAiSuggestion(''); setValgtBok(null); setEditingId(null)
    setShowNewForm(false); setShowPreview(false)
  }

  const handleSelectBook = (bok: KatalogBok) => {
    setValgtBok(bok); setTitle(bok.tittel); setAuthor(bok.forfatter)
    if (bok.bildeUrl) setImageUrl(bok.bildeUrl)
    setKatalogSøk(''); setShowKatalogDropdown(false)
  }

  const handleEdit = (a: Anbefaling) => {
    setEditingId(a.id); setTitle(a.tittel); setAuthor(a.forfatter || '')
    setContent(a.beskrivelse); setImageUrl(a.bildeUrl || ''); setShowNewForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string, tittel: string) => {
    if (!confirm(`Slette «${tittel}»?`)) return
    try {
      const res = await fetch(`/api/anbefalinger?id=${id}`, { method: 'DELETE' })
      if (res.ok) { fetchAnbefalinger(); toast('Slettet') } else toast('Feil ved sletting')
    } catch (e) { toast('Noe gikk galt') }
  }

  const handlePublish = async (publisert: boolean) => {
    if (!title || !content) { alert('Tittel og beskrivelse er påkrevd!'); return }
    setIsSaving(true)
    try {
      const body: any = { tittel: title, forfatter: author || null, beskrivelse: content, bildeUrl: imageUrl || null, katalogId: valgtBok?.id || null, publisert }
      let res
      if (editingId) {
        body.id = editingId
        res = await fetch('/api/anbefalinger', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      } else {
        res = await fetch('/api/anbefalinger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      }
      if (res.ok) { resetForm(); fetchAnbefalinger(); toast(editingId ? 'Oppdatert!' : publisert ? 'Publisert!' : 'Lagret som kladd!') }
      else alert('Kunne ikke lagre')
    } catch (e) { alert('Feil') } finally { setIsSaving(false) }
  }

  const handleTogglePublish = async (id: string, cur: boolean) => {
    try {
      const res = await fetch('/api/anbefalinger', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, publisert: !cur }) })
      if (res.ok) { fetchAnbefalinger(); toast(cur ? 'Avpublisert' : 'Publisert!') }
    } catch (e) { console.error(e) }
  }

  const handleAIAssist = async () => {
    if (!title) { alert('Fyll ut tittel først!'); return }
    setIsGenerating(true); setAiSuggestion('')
    try {
      const res = await fetch('/api/ai/generate-text', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'anbefaling', prompt: `Skriv en engasjerende anbefaling for "${title}"${author ? ` av ${author}` : ''}. ${content ? `Idé: ${content}` : ''}`, context: 'Bergen Offentlige Bibliotek.' }) })
      const data = await res.json()
      if (data.text) setAiSuggestion(data.text); else if (data.error) alert(data.error)
    } catch (e) { alert('AI-feil') } finally { setIsGenerating(false) }
  }

  const handleKlarspråk = async () => {
    if (!content) { alert('Skriv tekst først!'); return }
    setIsCheckingLanguage(true)
    try {
      const res = await fetch('/api/ai/generate-text', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'klarspråk', prompt: `Forbedre denne teksten etter klarspråkprinsippene. Returner KUN forbedret tekst:\n\n${content}`, context: 'Klarspråk.' }) })
      const data = await res.json()
      if (data.text) setAiSuggestion(data.text)
    } catch (e) { console.error(e) } finally { setIsCheckingLanguage(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Anbefalinger</h1>
          <p className="mt-2 text-gray-600">Administrer bibliotekets anbefalinger</p>
        </div>
        <button onClick={() => { resetForm(); setShowNewForm(!showNewForm) }}
          className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">+ Ny anbefaling</button>
      </div>

      {showNewForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-6">{editingId ? '✏️ Rediger anbefaling' : 'Opprett ny anbefaling'}</h3>
          <div className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Søk i katalogen</label>
              <input type="text" value={katalogSøk} onChange={(e) => setKatalogSøk(e.target.value)}
                className="w-full px-4 py-3 border border-blue-300 rounded-lg bg-blue-50" placeholder="Søk tittel, forfatter eller ISBN..." />
              {showKatalogDropdown && katalogResultater.length > 0 && (
                <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  {katalogResultater.map(bok => (
                    <button key={bok.id} onClick={() => handleSelectBook(bok)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0 flex items-center space-x-3">
                      <span>📚</span><div><div className="font-semibold">{bok.tittel}</div><div className="text-sm text-gray-600">{bok.forfatter}</div></div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {valgtBok && (
              <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <span>✅</span><div className="flex-1"><p className="font-semibold text-green-900">Knyttet til: {valgtBok.tittel}</p></div>
                <button onClick={() => setValgtBok(null)} className="text-green-600 text-sm">Fjern</button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Boktittel *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="Tittel" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forfatter</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="Forfatter" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bilde</label>
              <div className="flex items-center space-x-3">
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1 px-4 py-3 border rounded-lg" placeholder="Bilde-URL" />
                {imageUrl && <button onClick={() => setShowImageEditor(true)} className="px-4 py-3 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 font-medium">🖼️ Rediger</button>}
              </div>
              {imageUrl && <img src={imageUrl} alt="" className="mt-3 h-32 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Din anbefaling *</label>
                <div className="flex space-x-2">
                  <button onClick={handleKlarspråk} disabled={isCheckingLanguage} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50">
                    📝 {isCheckingLanguage ? 'Sjekker...' : 'Klarspråk'}
                  </button>
                  <button onClick={handleAIAssist} disabled={isGenerating} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg disabled:opacity-50">
                    ✨ {isGenerating ? 'Genererer...' : 'AI-hjelp'}
                  </button>
                </div>
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="w-full px-4 py-3 border rounded-lg" placeholder="Skriv din anbefaling..." />
            </div>

            {aiSuggestion && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-900 mb-2">✨ Forslag:</p>
                <p className="text-sm text-purple-800 whitespace-pre-line">{aiSuggestion}</p>
                <button onClick={() => { setContent(aiSuggestion); setAiSuggestion('') }} className="mt-3 text-sm text-purple-600 font-medium">Bruk dette →</button>
              </div>
            )}

            <div className="flex items-center space-x-4 pt-6 border-t">
              <button onClick={() => handlePublish(true)} disabled={isSaving} className="px-8 py-3 bg-[#16425b] text-white rounded-lg font-medium disabled:opacity-50">
                {isSaving ? 'Lagrer...' : editingId ? 'Oppdater' : 'Publiser'}
              </button>
              <button onClick={() => handlePublish(false)} disabled={isSaving} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50">Lagre som kladd</button>
              <button onClick={() => setShowPreview(true)} className="px-8 py-3 bg-green-100 text-green-800 rounded-lg font-medium">👁️ Forhåndsvis</button>
              <button onClick={resetForm} className="px-8 py-3 text-gray-600 hover:text-gray-900">Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">👁️ Forhåndsvisning</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-8">
              <div className="bg-gray-50 rounded-xl p-6">
                {imageUrl && <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-lg mb-4" />}
                <span className="inline-block px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium mb-3">⭐ Anbefaling</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{title || 'Tittel'}</h2>
                <p className="text-gray-600 mb-4">{author || 'Forfatter'}</p>
                <p className="text-gray-800 leading-relaxed">{content || 'Beskrivelse'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImageEditor && imageUrl && (
        <ImageEditor imageUrl={imageUrl} onSave={(url) => { setImageUrl(url); setShowImageEditor(false); toast('Bilde redigert!') }} onClose={() => setShowImageEditor(false)} />
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-gray-500">Laster...</div>
        : anbefalinger.length === 0 ? <div className="p-8 text-center text-gray-500">Ingen anbefalinger ennå.</div>
        : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">Tittel</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Forfatter</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Dato</th>
                <th className="text-right px-6 py-4 text-sm font-semibold">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {anbefalinger.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {a.bildeUrl && <img src={a.bildeUrl} alt="" className="w-10 h-10 rounded object-cover" />}
                      <span className="font-medium text-gray-900">{a.tittel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{a.forfatter || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${a.publisert ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {a.publisert ? 'Publisert' : 'Kladd'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{new Date(a.opprettet).toLocaleDateString('nb-NO')}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleTogglePublish(a.id, a.publisert)} className={`text-sm font-medium ${a.publisert ? 'text-yellow-600' : 'text-green-600'}`}>
                      {a.publisert ? 'Avpubliser' : 'Publiser'}
                    </button>
                    <button onClick={() => handleEdit(a)} className="text-[#16425b] font-medium text-sm">Rediger</button>
                    <button onClick={() => handleDelete(a.id, a.tittel)} className="text-red-600 font-medium text-sm">Slett</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showToast && <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">{toastMessage}</div>}
    </div>
  )
}
