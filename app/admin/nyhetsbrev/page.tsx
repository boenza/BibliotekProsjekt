'use client'

import { useState, useEffect } from 'react'

interface Arrangement { id: string; tittel: string; dato: string; klokkeslett: string; kategori: string }
interface Anbefaling { id: string; tittel: string; forfatter: string | null; beskrivelse: string }

export default function NyhetsbrevPage() {
  const [emne, setEmne] = useState('')
  const [intro, setIntro] = useState('')
  const [arrangementer, setArrangementer] = useState<Arrangement[]>([])
  const [anbefalinger, setAnbefalinger] = useState<Anbefaling[]>([])
  const [valgtArrangementer, setValgtArrangementer] = useState<string[]>([])
  const [valgtAnbefalinger, setValgtAnbefalinger] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const [arrRes, anbRes] = await Promise.all([
        fetch('/api/arrangementer'),
        fetch('/api/anbefalinger')
      ])
      const arrData = await arrRes.json()
      const anbData = await anbRes.json()
      if (Array.isArray(arrData)) setArrangementer(arrData)
      if (Array.isArray(anbData)) setAnbefalinger(anbData)
    } catch (error) {
      console.error('Error fetching content:', error)
    }
  }

  const toggleArrangement = (id: string) => {
    setValgtArrangementer(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleAnbefaling = (id: string) => {
    setValgtAnbefalinger(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleTestSend = async () => {
    if (!emne) { alert('Fyll ut emne!'); return }
    setIsSending(true)
    // Simuler sending
    await new Promise(r => setTimeout(r, 1500))
    setIsSending(false)
    setToastMessage('✅ Testutsending sendt til admin@bergen.bibliotek.no')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 5000)
  }

  const selectedArr = arrangementer.filter(a => valgtArrangementer.includes(a.id))
  const selectedAnb = anbefalinger.filter(a => valgtAnbefalinger.includes(a.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nyhetsbrev</h1>
          <p className="mt-2 text-gray-600">Opprett og send nyhetsbrev til lånere</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Editor */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">📧 Innhold</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emne *</label>
                <input type="text" value={emne} onChange={(e) => setEmne(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                  placeholder="F.eks. 'Nytt fra Bergen Bibliotek — mars 2026'" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Introduksjonstekst</label>
                <textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                  placeholder="Skriv en kort intro til nyhetsbrevet..." />
              </div>
            </div>
          </div>

          {/* Velg arrangementer */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">📅 Inkluder arrangementer</h3>
            {arrangementer.length === 0 ? (
              <p className="text-gray-500 text-sm">Ingen arrangementer tilgjengelig</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {arrangementer.map(arr => (
                  <label key={arr.id} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    valgtArrangementer.includes(arr.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                  }`}>
                    <input type="checkbox" checked={valgtArrangementer.includes(arr.id)}
                      onChange={() => toggleArrangement(arr.id)} className="w-4 h-4 text-[#16425b] rounded" />
                    <div>
                      <span className="font-medium text-gray-900">{arr.tittel}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(arr.dato).toLocaleDateString('nb-NO')} kl {arr.klokkeslett}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Velg anbefalinger */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">⭐ Inkluder anbefalinger</h3>
            {anbefalinger.length === 0 ? (
              <p className="text-gray-500 text-sm">Ingen anbefalinger tilgjengelig</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {anbefalinger.map(anb => (
                  <label key={anb.id} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    valgtAnbefalinger.includes(anb.id) ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50 border border-transparent'
                  }`}>
                    <input type="checkbox" checked={valgtAnbefalinger.includes(anb.id)}
                      onChange={() => toggleAnbefaling(anb.id)} className="w-4 h-4 text-purple-600 rounded" />
                    <div>
                      <span className="font-medium text-gray-900">{anb.tittel}</span>
                      {anb.forfatter && <span className="text-sm text-gray-500 ml-2">av {anb.forfatter}</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => setShowPreview(true)}
              className="px-6 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-medium">
              👁️ Forhåndsvis
            </button>
            <button onClick={handleTestSend} disabled={isSending}
              className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium disabled:opacity-50">
              {isSending ? 'Sender...' : '📨 Testutsending'}
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
              🚀 Send til alle abonnenter
            </button>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">📊 Statistikk</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Abonnenter</div>
                <div className="text-2xl font-bold text-gray-900">2,847</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Åpningsrate</div>
                <div className="text-2xl font-bold text-gray-900">34%</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Siste utsending</div>
                <div className="text-sm font-medium text-gray-900">15. jan 2026</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</h3>
            <p className="text-sm text-blue-800">
              Velg arrangementer og anbefalinger fra listene, så bygges nyhetsbrevet automatisk. 
              Bruk «Testutsending» for å se resultatet i din egen innboks.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">👁️ Forhåndsvisning av nyhetsbrev</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-8">
              {/* Simulert e-post */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-[#16425b] text-white p-6 text-center">
                  <h1 className="text-2xl font-bold">📚 Bergen Bibliotek</h1>
                  <p className="text-white/80 mt-1">Nyhetsbrev</p>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{emne || 'Emne mangler'}</h2>
                  {intro && <p className="text-gray-700 mb-6">{intro}</p>}

                  {selectedArr.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">📅 Kommende arrangementer</h3>
                      {selectedArr.map(arr => (
                        <div key={arr.id} className="p-4 bg-gray-50 rounded-lg mb-2">
                          <h4 className="font-semibold">{arr.tittel}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(arr.dato).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })} kl {arr.klokkeslett}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedAnb.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">⭐ Anbefalinger</h3>
                      {selectedAnb.map(anb => (
                        <div key={anb.id} className="p-4 bg-gray-50 rounded-lg mb-2">
                          <h4 className="font-semibold">{anb.tittel}</h4>
                          {anb.forfatter && <p className="text-sm text-gray-600">{anb.forfatter}</p>}
                          <p className="text-sm text-gray-700 mt-1 line-clamp-2">{anb.beskrivelse}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                    Bergen Offentlige Bibliotek · Strømgaten 6 · 5015 Bergen
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">{toastMessage}</div>
      )}
    </div>
  )
}
