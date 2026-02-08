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

export default function ArrangementerPage() {
  const [showNewForm, setShowNewForm] = useState(false)
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

  // Hent arrangementer fra database
  useEffect(() => {
    fetchArrangementer()
  }, [])

  const fetchArrangementer = async () => {
    try {
      const response = await fetch('/api/arrangementer')
      
      if (!response.ok) {
        throw new Error('Failed to fetch arrangementer')
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setArrangementer(data)
      } else {
        console.error('Data is not an array:', data)
        setArrangementer([])
      }
    } catch (error) {
      console.error('Error fetching arrangementer:', error)
      setArrangementer([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicate = async (arrangement: Arrangement) => {
    if (!confirm(`Vil du duplisere arrangementet "${arrangement.tittel}"?`)) {
      return
    }

    try {
      const response = await fetch('/api/arrangementer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: arrangement.id,
          action: 'duplicate'
        })
      })

      if (response.ok) {
        setToastMessage('Arrangement duplisert!')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        
        // Refresh list
        await fetchArrangementer()
      } else {
        alert('Kunne ikke duplisere arrangement')
      }
    } catch (error) {
      console.error('Error duplicating arrangement:', error)
      alert('Feil ved duplisering')
    }
  }

  const handlePublish = async (publisert: boolean) => {
    if (!title || !description || !date || !time) {
      alert('Tittel, beskrivelse, dato og klokkeslett er påkrevd!')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/arrangementer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tittel: title,
          beskrivelse: description,
          dato: date,
          klokkeslett: time,
          sted: location,
          kategori: category,
          kapasitet: capacity,
          publisert
        }),
      })

      if (response.ok) {
        // Reset form
        setTitle('')
        setDescription('')
        setDate('')
        setTime('')
        setLocation('Bergen Hovedbibliotek')
        setCategory('Forfattermøte')
        setCapacity(50)
        setAiSuggestion('')
        setShowNewForm(false)
        
        // Refresh list
        fetchArrangementer()
        
        // Show success message
        setToastMessage(publisert ? 'Arrangement publisert!' : 'Arrangement lagret som kladd!')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      } else {
        alert('Kunne ikke lagre arrangement')
      }
    } catch (error) {
      console.error('Error saving arrangement:', error)
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
          type: 'arrangement',
          prompt: `Skriv en engasjerende beskrivelse for arrangementet "${title}". ${description ? `Her er min idé: ${description}` : ''}`,
          context: `Dette er for Bergen Biblioteks arrangementskalender.`
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

      {/* New Event Form */}
      {showNewForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-6">Opprett nytt arrangement</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tittel på arrangement *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="F.eks. 'Forfattermøte med Jo Nesbø'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
              >
                <option>Forfattermøte</option>
                <option>Barn</option>
                <option>Ungdom</option>
                <option>Bokklubb</option>
                <option>Kurs</option>
                <option>Konsert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bibliotekfilial *
              </label>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
              >
                <option>Bergen Hovedbibliotek</option>
                <option>Laksevåg bibliotek</option>
                <option>Fyllingsdalen bibliotek</option>
                <option>Fana bibliotek</option>
                <option>Åsane bibliotek</option>
                <option>Loddefjord bibliotek</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dato *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Klokkeslett *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Antall plasser
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 50)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="50"
              />
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Beskrivelse *
                </label>
                <button
                  type="button"
                  onClick={handleAIAssist}
                  disabled={isGenerating}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>✨</span>
                  <span>{isGenerating ? 'Genererer...' : 'AI-hjelp'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="Beskriv arrangementet..."
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 Tips: Fortell hva deltakerne vil oppleve og hvem arrangementet passer for.
              </p>
            </div>

            {/* AI Suggestion */}
            {aiSuggestion && (
              <div className="col-span-2 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <span className="text-purple-600">✨</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900 mb-2">AI-forslag:</p>
                    <p className="text-sm text-purple-800">{aiSuggestion}</p>
                    <button
                      type="button"
                      onClick={() => setDescription(aiSuggestion)}
                      className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Bruk dette forslaget →
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrangementsbilde
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#16425b] transition-colors cursor-pointer">
                <div className="text-4xl mb-2">📸</div>
                <p className="text-sm text-gray-600">Klikk for å laste opp bilde</p>
                <p className="text-xs text-gray-500 mt-1">eller dra og slipp her</p>
              </div>
            </div>

            <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">ℹ️</span>
                <div className="flex-1 text-sm text-blue-900">
                  <p className="font-medium mb-1">Tilgjengelighet</p>
                  <div className="space-y-2 mt-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span>Rullestoltilgjengelig</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span>Teleslynge</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span>Tegnspråktolk</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 mt-6">
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
              onClick={() => setShowNewForm(false)}
              className="px-8 py-3 text-gray-600 hover:text-gray-900"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* List of events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Laster arrangementer...
          </div>
        ) : arrangementer.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Ingen arrangementer ennå. Opprett ditt første!
          </div>
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
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${arr.kapasitet > 0 ? (arr.påmeldte / arr.kapasitet) * 100 : 0}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      arr.publisert
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {arr.publisert ? 'Publisert' : 'Kladd'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDuplicate(arr)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-4"
                      title="Dupliser arrangement"
                    >
                      📋 Dupliser
                    </button>
                    <button className="text-[#16425b] hover:text-[#1a5270] font-medium text-sm mr-4">
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

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
