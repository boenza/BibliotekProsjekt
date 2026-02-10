'use client'

import { useState, useEffect } from 'react'

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

  // Katalog-søk (A-2)
  const [katalogSøk, setKatalogSøk] = useState('')
  const [katalogResultater, setKatalogResultater] = useState<KatalogBok[]>([])
  const [showKatalogDropdown, setShowKatalogDropdown] = useState(false)
  const [valgtBok, setValgtBok] = useState<KatalogBok | null>(null)
  const [isSearchingKatalog, setIsSearchingKatalog] = useState(false)

  // Klarspråk (A-5)
  const [isCheckingLanguage, setIsCheckingLanguage] = useState(false)

  useEffect(() => {
    fetchAnbefalinger()
  }, [])

  // Katalog-søk med debounce
  useEffect(() => {
    if (katalogSøk.length < 2) {
      setKatalogResultater([])
      setShowKatalogDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingKatalog(true)
      try {
        const response = await fetch(`/api/katalog?q=${encodeURIComponent(katalogSøk)}`)
        const data = await response.json()
        if (Array.isArray(data)) {
          setKatalogResultater(data)
          setShowKatalogDropdown(true)
        }
      } catch (error) {
        console.error('Katalog search error:', error)
      } finally {
        setIsSearchingKatalog(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [katalogSøk])

  const fetchAnbefalinger = async () => {
    try {
      const response = await fetch('/api/anbefalinger')
      const data = await response.json()
      setAnbefalinger(data)
    } catch (error) {
      console.error('Error fetching anbefalinger:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectBook = (bok: KatalogBok) => {
    setValgtBok(bok)
    setTitle(bok.tittel)
    setAuthor(bok.forfatter)
    if (bok.bildeUrl) setImageUrl(bok.bildeUrl)
    setKatalogSøk('')
    setShowKatalogDropdown(false)
  }

  const handlePublish = async (publisert: boolean) => {
    if (!title || !content) {
      alert('Tittel og beskrivelse er påkrevd!')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/anbefalinger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tittel: title,
          forfatter: author || null,
          beskrivelse: content,
          bildeUrl: imageUrl || null,
          katalogId: valgtBok?.id || null,
          publisert
        }),
      })

      if (response.ok) {
        setTitle('')
        setAuthor('')
        setContent('')
        setImageUrl('')
        setAiSuggestion('')
        setValgtBok(null)
        setShowNewForm(false)
        setShowPreview(false)
        fetchAnbefalinger()
        
        setToastMessage(publisert ? 'Anbefaling publisert!' : 'Anbefaling lagret som kladd!')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      } else {
        alert('Kunne ikke lagre anbefaling')
      }
    } catch (error) {
      console.error('Error saving anbefaling:', error)
      alert('Noe gikk galt ved lagring')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAIAssist = async () => {
    if (!title) {
      alert('Vennligst fyll ut tittel først!')
      return
    }
    
    setIsGenerating(true)
    setAiSuggestion('')
    
    try {
      const response = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'anbefaling',
          prompt: `Skriv en engasjerende anbefaling for boken "${title}"${author ? ` av ${author}` : ''}. ${content ? `Her er min idé: ${content}` : ''}`,
          context: `Dette er for Bergen Biblioteks nettside. Målgruppen er voksne lesere.`
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        alert('Kunne ikke generere forslag: ' + data.error)
      } else {
        setAiSuggestion(data.text)
      }
    } catch (error) {
      console.error('AI error:', error)
      alert('Noe gikk galt med AI-genereringen')
    } finally {
      setIsGenerating(false)
    }
  }

  // Klarspråk-sjekk (A-5)
  const handleKlarspråk = async () => {
    if (!content) {
      alert('Skriv en tekst først!')
      return
    }

    setIsCheckingLanguage(true)
    
    try {
      const response = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'klarspråk',
          prompt: `Forbedre denne teksten etter klarspråkprinsippene. Gjør den enklere, tydeligere og mer tilgjengelig. Behold budskapet, men forenkle setningsstrukturen og bruk vanlige ord. Returner KUN den forbedrede teksten, ingen forklaring:\n\n${content}`,
          context: 'Klarspråk-sjekk for bibliotekinnhold. Følg Språkrådets klarspråkprinsipper.'
        }),
      })

      const data = await response.json()
      if (data.text) {
        setAiSuggestion(data.text)
      }
    } catch (error) {
      console.error('Klarspråk error:', error)
    } finally {
      setIsCheckingLanguage(false)
    }
  }

  // Avpubliser (A-1)
  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/anbefalinger', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, publisert: !currentStatus })
      })

      if (response.ok) {
        fetchAnbefalinger()
        setToastMessage(currentStatus ? 'Anbefaling avpublisert' : 'Anbefaling publisert!')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      }
    } catch (error) {
      console.error('Toggle publish error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Anbefalinger</h1>
          <p className="mt-2 text-gray-600">Administrer bibliotekets anbefalinger</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium"
        >
          + Ny anbefaling
        </button>
      </div>

      {/* New Recommendation Form */}
      {showNewForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-6">Opprett ny anbefaling</h3>
          
          <div className="space-y-6">
            {/* Katalog-søk (A-2) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Søk i katalogen og knytt til utgivelse
              </label>
              <input
                type="text"
                value={katalogSøk}
                onChange={(e) => setKatalogSøk(e.target.value)}
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                placeholder="Søk etter tittel, forfatter eller ISBN i katalogen..."
              />
              {isSearchingKatalog && (
                <div className="absolute right-4 top-[42px]">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}

              {/* Katalog dropdown */}
              {showKatalogDropdown && katalogResultater.length > 0 && (
                <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  {katalogResultater.map(bok => (
                    <button
                      key={bok.id}
                      onClick={() => handleSelectBook(bok)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 flex items-center space-x-3"
                    >
                      <span className="text-2xl">📚</span>
                      <div>
                        <div className="font-semibold text-gray-900">{bok.tittel}</div>
                        <div className="text-sm text-gray-600">{bok.forfatter} · {bok.sjanger}</div>
                        {bok.isbn && <div className="text-xs text-gray-400">ISBN: {bok.isbn}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Valgt bok fra katalog */}
            {valgtBok && (
              <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-3xl">✅</span>
                <div className="flex-1">
                  <p className="font-semibold text-green-900">Knyttet til katalog</p>
                  <p className="text-sm text-green-700">{valgtBok.tittel} av {valgtBok.forfatter}</p>
                  {valgtBok.isbn && <p className="text-xs text-green-600">ISBN: {valgtBok.isbn}</p>}
                </div>
                <button
                  onClick={() => setValgtBok(null)}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  Fjern kobling
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Boktittel *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                  placeholder="F.eks. 'Dei sju dørene'"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forfatter
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                  placeholder="F.eks. 'Agnes Ravatn'"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bilde-URL (valgfritt)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Din anbefaling *
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleKlarspråk}
                    disabled={isCheckingLanguage}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <span>📝</span>
                    <span>{isCheckingLanguage ? 'Sjekker...' : 'Klarspråk'}</span>
                  </button>
                  <button
                    onClick={handleAIAssist}
                    disabled={isGenerating}
                    className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <span>✨</span>
                    <span>{isGenerating ? 'Genererer...' : 'AI-hjelp'}</span>
                  </button>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="Skriv din anbefaling her..."
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 Tips: Fortell hva som gjør boken spesiell, hvem den passer for, og hvorfor leseren bør låne den.
              </p>
            </div>

            {/* AI / Klarspråk Suggestion */}
            {aiSuggestion && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <span className="text-purple-600">✨</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900 mb-2">Forslag:</p>
                    <p className="text-sm text-purple-800 whitespace-pre-line">{aiSuggestion}</p>
                    <button
                      onClick={() => { setContent(aiSuggestion); setAiSuggestion('') }}
                      className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Bruk dette forslaget →
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
              <button 
                onClick={() => handlePublish(true)}
                disabled={isSaving}
                className="px-8 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium disabled:opacity-50"
              >
                {isSaving ? 'Lagrer...' : 'Publiser'}
              </button>
              <button 
                onClick={() => handlePublish(false)}
                disabled={isSaving}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
              >
                Lagre som kladd
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="px-8 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-medium"
              >
                👁️ Forhåndsvis
              </button>
              <button
                onClick={() => setShowNewForm(false)}
                className="px-8 py-3 text-gray-600 hover:text-gray-900"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal (A-2) */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">👁️ Forhåndsvisning — slik ser det ut for publikum</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-8">
              <div className="bg-gray-50 rounded-xl p-6">
                {imageUrl && (
                  <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-lg mb-4" />
                )}
                <span className="inline-block px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium mb-3">
                  ⭐ Anbefaling
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{title || 'Tittel mangler'}</h2>
                <p className="text-gray-600 mb-4">{author || 'Forfatter'}</p>
                <p className="text-gray-800 leading-relaxed">{content || 'Beskrivelse mangler'}</p>
                {valgtBok && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    📚 Finn denne boken i katalogen — {valgtBok.sjanger}
                    {valgtBok.isbn && <span className="ml-2 text-blue-600">ISBN: {valgtBok.isbn}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List of recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Laster anbefalinger...</div>
        ) : anbefalinger.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Ingen anbefalinger ennå. Opprett din første!</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Tittel</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Forfatter</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Opprettet</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {anbefalinger.map((anbefaling) => (
                <tr key={anbefaling.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{anbefaling.tittel}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{anbefaling.forfatter || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      anbefaling.publisert ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {anbefaling.publisert ? 'Publisert' : 'Kladd'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(anbefaling.opprettet).toLocaleDateString('nb-NO')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => handleTogglePublish(anbefaling.id, anbefaling.publisert)}
                      className={`font-medium text-sm ${
                        anbefaling.publisert ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {anbefaling.publisert ? 'Avpubliser' : 'Publiser'}
                    </button>
                    <button className="text-[#16425b] hover:text-[#1a5270] font-medium text-sm">
                      Rediger
                    </button>
                    <button className="text-red-600 hover:text-red-800 font-medium text-sm">
                      Slett
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
