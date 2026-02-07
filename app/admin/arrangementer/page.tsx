'use client'

import { useState } from 'react'

export default function ArrangementerPage() {
  const [showNewForm, setShowNewForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

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
  
  const arrangementer = [
    { id: 1, title: 'Forfattermøte: Jo Nesbø', date: '2026-02-12', time: '18:00', branch: 'Hovedbiblioteket', status: 'Publisert', spots: 120, registered: 98 },
    { id: 2, title: 'Eventyrtime for de minste', date: '2026-02-08', time: '10:30', branch: 'Fana', status: 'Publisert', spots: 25, registered: 18 },
    { id: 3, title: 'Kodeklubb for ungdom', date: '2026-02-10', time: '15:00', branch: 'Åsane', status: 'Kladd', spots: 20, registered: 0 },
  ]

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="F.eks. 'Forfattermøte med...'"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kort beskrivelse
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="Undertittel eller kort beskrivelse"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent">
                <option>Velg kategori...</option>
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
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent">
                <option>Velg filial...</option>
                <option>Hovedbiblioteket</option>
                <option>Fana</option>
                <option>Åsane</option>
                <option>Loddefjord</option>
                <option>Laksevåg</option>
                <option>Fyllingsdalen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dato *
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start *
                </label>
                <input
                  type="time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slutt *
                </label>
                <input
                  type="time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Antall plasser
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="La stå tom for drop-in"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Målgruppe
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="F.eks. 'Voksne', '0-5 år', 'Alle'"
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
            <button className="px-8 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium">
              Publiser
            </button>
            <button className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
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
                  <div className="font-medium text-gray-900">{arr.title}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {arr.date} kl. {arr.time}
                </td>
                <td className="px-6 py-4 text-gray-600">{arr.branch}</td>
                <td className="px-6 py-4">
                  <div className="text-gray-900 font-medium">{arr.registered} / {arr.spots}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(arr.registered / arr.spots) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                    arr.status === 'Publisert'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {arr.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
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
      </div>
    </div>
  )
}
