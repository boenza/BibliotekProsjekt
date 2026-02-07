'use client'

import { useState } from 'react'

export default function AnbefalingerPage() {
  const [showNewForm, setShowNewForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const anbefalinger = [
    { id: 1, title: 'Nordlys i november', book: 'Maja Lunde', status: 'Publisert', date: '2026-02-05' },
    { id: 2, title: 'En gripende historie', book: 'Bror din på prærien', status: 'Kladd', date: '2026-02-04' },
    { id: 3, title: 'Perfekt for vinterkvelder', book: 'Vinterhav', status: 'Publisert', date: '2026-02-03' },
  ]

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
          prompt: `Skriv en engasjerende anbefaling for boken "${title}". ${content ? `Her er min idé: ${content}` : ''}`,
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tittel på anbefaling
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="F.eks. 'Perfekt sommerlesning'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Velg bok fra samlingen
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent">
                <option>Søk etter bok...</option>
                <option>Nordlys i november - Maja Lunde</option>
                <option>Bror din på prærien - Torvald Sund</option>
                <option>Vinterhav - Helene Uri</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Din anbefaling
                </label>
                <button
                  onClick={handleAIAssist}
                  disabled={isGenerating}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>✨</span>
                  <span>{isGenerating ? 'Genererer...' : 'AI-hjelp'}</span>
                </button>
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

            {/* AI Suggestion */}
            {aiSuggestion && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <span className="text-purple-600">✨</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900 mb-2">AI-forslag:</p>
                    <p className="text-sm text-purple-800">{aiSuggestion}</p>
                    <button
                      onClick={() => setContent(aiSuggestion)}
                      className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Bruk dette forslaget →
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
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
        </div>
      )}

      {/* List of recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Tittel</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Bok</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Dato</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Handlinger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {anbefalinger.map((anbefaling) => (
              <tr key={anbefaling.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{anbefaling.title}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{anbefaling.book}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                    anbefaling.status === 'Publisert'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {anbefaling.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{anbefaling.date}</td>
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
