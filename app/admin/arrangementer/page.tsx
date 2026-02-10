'use client'

import { useState, useEffect } from 'react'

interface Arrangement {
  id: string
  tittel: string
  beskrivelse: string
  dato: string
  klokkeslett: string
  sted: string
  kategori: string
  kapasitet: number
  påmeldte: number
  publisert: boolean
  opprettet: string
}

interface KatalogBok {
  id: string
  tittel: string
  forfatter: string
  sjanger: string
}

export default function ArrangementerPage() {
  const [showNewForm, setShowNewForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('Bergen Hovedbibliotek')
  const [category, setCategory] = useState('Forfattermøte')
  const [capacity, setCapacity] = useState(50)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [arrangementer, setArrangementer] = useState<Arrangement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Serie-funksjon (A-4)
  const [isSerie, setIsSerie] = useState(false)
  const [serieDatoer, setSerieDatoer] = useState<string[]>([''])
  const [serieFrekvens, setSerieFrekvens] = useState<'ukentlig' | 'månedlig' | 'egendefinert'>('ukentlig')
  const [serieAntall, setSerieAntall] = useState(4)

  // Koble til tittel (A-3)
  const [katalogSøk, setKatalogSøk] = useState('')
  const [katalogResultater, setKatalogResultater] = useState<KatalogBok[]>([])
  const [showKatalogDropdown, setShowKatalogDropdown] = useState(false)
  const [kobletTittel, setKobletTittel] = useState<KatalogBok | null>(null)

  useEffect(() => {
    fetchArrangementer()
  }, [])

  // Katalog-søk for kobling (A-3)
  useEffect(() => {
    if (katalogSøk.length < 2) {
      setKatalogResultater([])
      setShowKatalogDropdown(false)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/katalog?q=${encodeURIComponent(katalogSøk)}`)
        const data = await response.json()
        if (Array.isArray(data)) {
          setKatalogResultater(data)
          setShowKatalogDropdown(true)
        }
      } catch (error) {
        console.error('Katalog search error:', error)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [katalogSøk])

  const fetchArrangementer = async () => {
    try {
      const response = await fetch('/api/arrangementer')
      if (!response.ok) throw new Error('Failed')
      const data = await response.json()
      setArrangementer(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error:', error)
      setArrangementer([])
    } finally {
      setIsLoading(false)
    }
  }

  // Generer serie-datoer (A-4)
  const genererSerieDatoer = () => {
    if (!date) return
    const startDato = new Date(date)
    const datoer: string[] = []
    
    for (let i = 0; i < serieAntall; i++) {
      const d = new Date(startDato)
      if (serieFrekvens === 'ukentlig') {
        d.setDate(d.getDate() + (i * 7))
      } else if (serieFrekvens === 'månedlig') {
        d.setMonth(d.getMonth() + i)
      }
      datoer.push(d.toISOString().split('T')[0])
    }
    setSerieDatoer(datoer)
  }

  useEffect(() => {
    if (isSerie && date) {
      genererSerieDatoer()
    }
  }, [isSerie, date, serieFrekvens, serieAntall])

  const handleDuplicate = async (arrangement: Arrangement) => {
    if (!confirm(`Vil du duplisere "${arrangement.tittel}"?`)) return
    try {
      const response = await fetch('/api/arrangementer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: arrangement.id, action: 'duplicate' })
      })
      if (response.ok) {
        setToastMessage('Arrangement duplisert!')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        await fetchArrangementer()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handlePublish = async (publisert: boolean) => {
    if (!title || !description || !date || !time) {
      alert('Tittel, beskrivelse, dato og klokkeslett er påkrevd!')
      return
    }

    setIsSaving(true)

    try {
      // Hvis serie, opprett flere
      const datoerÅOpprette = isSerie ? serieDatoer : [date]

      for (const d of datoerÅOpprette) {
        await fetch('/api/arrangementer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tittel: title,
            beskrivelse: description,
            dato: d,
            klokkeslett: time,
            sted: location,
            kategori: category,
            kapasitet: capacity,
            kobletTittelId: kobletTittel?.id || null,
            publisert
          }),
        })
      }

      setTitle('')
      setDescription('')
      setDate('')
      setTime('')
      setLocation('Bergen Hovedbibliotek')
      setCategory('Forfattermøte')
      setCapacity(50)
      setAiSuggestion('')
      setIsSerie(false)
      setKobletTittel(null)
      setShowNewForm(false)
      setShowPreview(false)
      fetchArrangementer()
      
      const antall = datoerÅOpprette.length
      setToastMessage(antall > 1 
        ? `${antall} arrangementer i serie opprettet!` 
        : (publisert ? 'Arrangement publisert!' : 'Arrangement lagret som kladd!'))
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (error) {
      console.error('Error:', error)
      alert('Noe gikk galt ved lagring')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAIAssist = async () => {
    if (!title) { alert('Fyll ut tittel først!'); return }
    setIsGenerating(true)
    setAiSuggestion('')
    try {
      const response = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'arrangement',
          prompt: `Skriv en engasjerende beskrivelse for arrangementet "${title}". ${description ? `Idé: ${description}` : ''}`,
          context: `Bergen Biblioteks arrangementskalender.`
        }),
      })
      const data = await response.json()
      if (data.text) setAiSuggestion(data.text)
    } catch (error) {
      console.error('AI error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Avpubliser (A-1)
  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/arrangementer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: currentStatus ? 'unpublish' : 'publish' })
      })
      if (response.ok) {
        fetchArrangementer()
        setToastMessage(currentStatus ? 'Avpublisert' : 'Publisert!')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      }
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Arrangementer</h1>
          <p className="mt-2 text-gray-600">Administrer bibliotekets arrangementer</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium"
        >
          + Nytt arrangement
        </button>
      </div>

      {showNewForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-6">Opprett nytt arrangement</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tittel *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="F.eks. 'Forfatterkveld: Agnes Ravatn'" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent">
                <option>Forfattermøte</option>
                <option>Barnearrangement</option>
                <option>Foredrag</option>
                <option>Kurs</option>
                <option>Utstilling</option>
                <option>Konsert</option>
                <option>Filmvisning</option>
                <option>Annet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sted</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent">
                <option>Bergen Hovedbibliotek</option>
                <option>Loddefjord bibliotek</option>
                <option>Fana bibliotek</option>
                <option>Åsane bibliotek</option>
                <option>Fyllingsdalen bibliotek</option>
                <option>Laksevåg bibliotek</option>
                <option>Arna bibliotek</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dato *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Klokkeslett *</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Antall plasser</label>
              <input type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 50)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent" />
            </div>

            {/* Serie-funksjon (A-4) */}
            <div className="col-span-2 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={isSerie} onChange={(e) => setIsSerie(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded" />
                <span className="font-medium text-indigo-900">🔁 Opprett som arrangementsserie</span>
              </label>

              {isSerie && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Frekvens</label>
                    <select value={serieFrekvens} onChange={(e) => setSerieFrekvens(e.target.value as any)}
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg bg-white">
                      <option value="ukentlig">Ukentlig</option>
                      <option value="månedlig">Månedlig</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Antall ganger</label>
                    <input type="number" value={serieAntall} onChange={(e) => setSerieAntall(parseInt(e.target.value) || 2)}
                      min={2} max={12}
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg bg-white" />
                  </div>
                  {serieDatoer.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-indigo-700 mb-2">Planlagte datoer:</p>
                      <div className="flex flex-wrap gap-2">
                        {serieDatoer.map((d, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                            📅 {new Date(d).toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Koble til tittel/anbefaling (A-3) */}
            <div className="col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔗 Knytt til tittel i katalogen (valgfritt)
              </label>
              <input type="text" value={katalogSøk} onChange={(e) => setKatalogSøk(e.target.value)}
                className="w-full px-4 py-3 border border-blue-300 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500"
                placeholder="Søk etter bok å knytte til arrangementet..." />
              
              {showKatalogDropdown && katalogResultater.length > 0 && (
                <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {katalogResultater.map(bok => (
                    <button key={bok.id} onClick={() => { setKobletTittel(bok); setKatalogSøk(''); setShowKatalogDropdown(false) }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0">
                      <span className="font-semibold">{bok.tittel}</span>
                      <span className="text-gray-500 text-sm ml-2">— {bok.forfatter}</span>
                    </button>
                  ))}
                </div>
              )}

              {kobletTittel && (
                <div className="mt-2 flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span>✅</span>
                  <span className="text-sm text-green-800">Knyttet til: <strong>{kobletTittel.tittel}</strong> av {kobletTittel.forfatter}</span>
                  <button onClick={() => setKobletTittel(null)} className="text-green-600 hover:text-green-800 text-sm ml-auto">Fjern</button>
                </div>
              )}
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Beskrivelse *</label>
                <button type="button" onClick={handleAIAssist} disabled={isGenerating}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50">
                  <span>✨</span>
                  <span>{isGenerating ? 'Genererer...' : 'AI-hjelp'}</span>
                </button>
              </div>
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="Beskriv arrangementet..." />
            </div>

            {aiSuggestion && (
              <div className="col-span-2 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-900 mb-2">✨ AI-forslag:</p>
                <p className="text-sm text-purple-800">{aiSuggestion}</p>
                <button onClick={() => { setDescription(aiSuggestion); setAiSuggestion('') }}
                  className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium">
                  Bruk dette forslaget →
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 mt-6">
            <button onClick={() => handlePublish(true)} disabled={isSaving}
              className="px-8 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium disabled:opacity-50">
              {isSaving ? 'Lagrer...' : (isSerie ? `Publiser ${serieDatoer.length} arrangementer` : 'Publiser')}
            </button>
            <button onClick={() => handlePublish(false)} disabled={isSaving}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50">
              Lagre som kladd
            </button>
            <button onClick={() => setShowPreview(true)}
              className="px-8 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-medium">
              👁️ Forhåndsvis
            </button>
            <button onClick={() => setShowNewForm(false)} className="px-8 py-3 text-gray-600 hover:text-gray-900">Avbryt</button>
          </div>
        </div>
      )}

      {/* Preview Modal (A-3) */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">👁️ Forhåndsvisning — slik ser det ut for publikum</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <span className="inline-block px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium mb-3">
                  {category}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title || 'Tittel mangler'}</h2>
                <div className="text-gray-600 text-sm space-y-1 mb-4">
                  <p>📅 {date ? new Date(date).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Dato mangler'}</p>
                  <p>🕐 {time || 'Tid mangler'}</p>
                  <p>📍 {location}</p>
                  <p>👥 {capacity} plasser</p>
                </div>
                <p className="text-gray-800 leading-relaxed">{description || 'Beskrivelse mangler'}</p>
                {kobletTittel && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    📚 Relatert bok: {kobletTittel.tittel} av {kobletTittel.forfatter}
                  </div>
                )}
                {isSerie && serieDatoer.length > 1 && (
                  <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
                    🔁 Del av serie — {serieDatoer.length} datoer
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Laster arrangementer...</div>
        ) : arrangementer.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Ingen arrangementer ennå.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Arrangement</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Dato & tid</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Sted</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Påmeldte</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {arrangementer.map((arr) => (
                <tr key={arr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{arr.tittel}</div>
                    <div className="text-sm text-gray-500">{arr.kategori}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(arr.dato).toLocaleDateString('nb-NO')} kl. {arr.klokkeslett}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{arr.sted}</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">{arr.påmeldte} / {arr.kapasitet}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${arr.kapasitet > 0 ? (arr.påmeldte / arr.kapasitet) * 100 : 0}%` }} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      arr.publisert ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {arr.publisert ? 'Publisert' : 'Kladd'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleDuplicate(arr)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm">📋 Dupliser</button>
                    <button onClick={() => handleTogglePublish(arr.id, arr.publisert)}
                      className={`font-medium text-sm ${arr.publisert ? 'text-yellow-600' : 'text-green-600'}`}>
                      {arr.publisert ? 'Avpubliser' : 'Publiser'}
                    </button>
                    <button className="text-red-600 hover:text-red-800 font-medium text-sm">Slett</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">{toastMessage}</div>
      )}
    </div>
  )
}
