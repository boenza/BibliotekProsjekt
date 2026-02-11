'use client'

import { useState, useEffect } from 'react'

interface Tittel { id: string; tittel: string; forfatter: string; sjanger: string; fremhevet: boolean; beskrivelse: string }

export default function SamlingPage() {
  const [titler, setTitler] = useState<Tittel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [søk, setSøk] = useState('')
  const [fremhevede, setFremhevede] = useState<string[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    const fetchKatalog = async () => {
      try {
        const res = await fetch('/api/katalog')
        const data = await res.json()
        if (Array.isArray(data)) {
          setTitler(data.map((b: any) => ({ id: b.id, tittel: b.tittel, forfatter: b.forfatter, sjanger: b.sjanger, fremhevet: false, beskrivelse: b.beskrivelse || '' })))
        }
      } catch (e) { console.error(e) } finally { setIsLoading(false) }
    }
    fetchKatalog()
  }, [])

  const toast = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000) }

  const toggleFremhev = (id: string) => {
    if (fremhevede.includes(id)) {
      setFremhevede(prev => prev.filter(i => i !== id))
      toast('Fjernet fra forsiden')
    } else {
      setFremhevede(prev => [...prev, id])
      toast('Fremhevet på forsiden!')
    }
  }

  const filtered = titler.filter(t => !søk || t.tittel.toLowerCase().includes(søk.toLowerCase()) || t.forfatter.toLowerCase().includes(søk.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">Samling</h1><p className="mt-2 text-gray-600">Fremhev titler fra katalogen på forsiden</p></div>
        <div className="text-sm bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">⭐ {fremhevede.length} fremhevet</div>
      </div>

      {fremhevede.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">⭐ Fremhevede titler</h3>
          <div className="flex flex-wrap gap-3">
            {titler.filter(t => fremhevede.includes(t.id)).map(t => (
              <div key={t.id} className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg">
                <span className="font-medium text-sm">{t.tittel}</span>
                <button onClick={() => toggleFremhev(t.id)} className="text-yellow-600 hover:text-yellow-800">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <input type="text" value={søk} onChange={e => setSøk(e.target.value)} className="w-full px-4 py-3 border rounded-lg mb-4" placeholder="Søk i samlingen..." />
        {isLoading ? <div className="text-center py-8 text-gray-500">Laster...</div> : (
          <div className="space-y-3">
            {filtered.map(t => (
              <div key={t.id} className={`flex items-center justify-between p-4 rounded-lg border ${fremhevede.includes(t.id) ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div>
                  <h4 className="font-semibold text-gray-900">{t.tittel}</h4>
                  <p className="text-sm text-gray-600">{t.forfatter} · {t.sjanger}</p>
                </div>
                <button onClick={() => toggleFremhev(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${fremhevede.includes(t.id) ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {fremhevede.includes(t.id) ? '⭐ Fremhevet' : '☆ Fremhev'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {showToast && <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">{toastMsg}</div>}
    </div>
  )
}
