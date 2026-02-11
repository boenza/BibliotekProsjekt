'use client'

import { useState } from 'react'

interface DeltInnhold {
  id: string; type: 'anbefaling' | 'arrangement' | 'artikkel'; tittel: string; beskrivelse: string
  forfatter?: string; bibliotek: string; kommune: string; delt: string; kategori?: string
}

const andresInnhold: DeltInnhold[] = [
  { id: 'delt-1', type: 'anbefaling', tittel: 'Dei sju dørene', beskrivelse: 'Agnes Ravatn har skrevet en fengslende roman om hemmeligheter, identitet og konsekvenser.', forfatter: 'Agnes Ravatn', bibliotek: 'Stavanger bibliotek', kommune: 'Stavanger', delt: '2026-02-01', kategori: 'Roman' },
  { id: 'delt-2', type: 'arrangement', tittel: 'Barnas lesesirkel — Vinterferiespecial', beskrivelse: 'Bli med på lesesirkel for barn 8-12 år! Vi leser og diskuterer bøker sammen.', bibliotek: 'Trondheim folkebibliotek', kommune: 'Trondheim', delt: '2026-01-28', kategori: 'Barnearrangement' },
  { id: 'delt-3', type: 'anbefaling', tittel: 'Fuglane', beskrivelse: 'Tarjei Vesaas\' mesterverk om Mattis og hans søster Hege.', forfatter: 'Tarjei Vesaas', bibliotek: 'Oslo deichmanske bibliotek', kommune: 'Oslo', delt: '2026-02-05', kategori: 'Klassiker' },
  { id: 'delt-4', type: 'arrangement', tittel: 'Digital mestring for seniorer', beskrivelse: 'Kurs i bruk av nettbank, Altinn og digitale helsetjenester.', bibliotek: 'Bodø bibliotek', kommune: 'Bodø', delt: '2026-02-03', kategori: 'Kurs' },
  { id: 'delt-5', type: 'artikkel', tittel: 'Slik får du mest ut av bibliotekets digitale tilbud', beskrivelse: 'En guide til Biblio, Filmoteket og andre digitale tjenester.', bibliotek: 'Kristiansand folkebibliotek', kommune: 'Kristiansand', delt: '2026-01-20', kategori: 'Guide' },
  { id: 'delt-6', type: 'anbefaling', tittel: 'Doppler', beskrivelse: 'Erlend Loes kjente roman om mannen som forlater alt og flytter inn i skogen.', forfatter: 'Erlend Loe', bibliotek: 'Drammen bibliotek', kommune: 'Drammen', delt: '2026-02-07', kategori: 'Roman' },
]

export default function DelingPage() {
  const [filter, setFilter] = useState<'alle' | 'anbefaling' | 'arrangement' | 'artikkel'>('alle')
  const [importerte, setImporterte] = useState<DeltInnhold[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [søk, setSøk] = useState('')
  const [activeView, setActiveView] = useState<'tilgjengelig' | 'importert'>('tilgjengelig')

  const filteredContent = andresInnhold
    .filter(i => filter === 'alle' || i.type === filter)
    .filter(i => !søk || i.tittel.toLowerCase().includes(søk.toLowerCase()) || i.bibliotek.toLowerCase().includes(søk.toLowerCase()))

  const isImported = (id: string) => importerte.some(i => i.id === id)

  const handleImport = (innhold: DeltInnhold) => {
    setImporterte(prev => [...prev, innhold])
    setToastMessage(`"${innhold.tittel}" importert som kladd`)
    setShowToast(true); setTimeout(() => setShowToast(false), 4000)
  }

  const handleRemoveImport = (id: string) => {
    setImporterte(prev => prev.filter(i => i.id !== id))
  }

  const getTypeIcon = (t: string) => t === 'anbefaling' ? '⭐' : t === 'arrangement' ? '📅' : '📝'
  const getBadge = (t: string) => t === 'anbefaling' ? 'bg-purple-100 text-purple-800' : t === 'arrangement' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">Deling mellom bibliotek</h1><p className="mt-2 text-gray-600">Importer og del innhold med andre bibliotek</p></div>
        <div className="text-sm bg-green-50 border border-green-200 px-4 py-2 rounded-lg">🔗 {andresInnhold.length} tilgjengelig · {importerte.length} importert</div>
      </div>

      {/* Tabs: Tilgjengelig / Importert */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button onClick={() => setActiveView('tilgjengelig')} className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeView === 'tilgjengelig' ? 'text-[#16425b] border-[#16425b]' : 'text-gray-500 border-transparent'}`}>
          Tilgjengelig ({andresInnhold.length})
        </button>
        <button onClick={() => setActiveView('importert')} className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeView === 'importert' ? 'text-[#16425b] border-[#16425b]' : 'text-gray-500 border-transparent'}`}>
          Importert som kladd ({importerte.length})
        </button>
      </div>

      {activeView === 'importert' ? (
        importerte.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Ingen importerte elementer ennå. Gå til «Tilgjengelig» for å importere innhold.</div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {importerte.map(innhold => (
              <div key={innhold.id} className="bg-white rounded-xl shadow-sm p-6 border border-green-200 bg-green-50/30">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getBadge(innhold.type)}`}>{getTypeIcon(innhold.type)} {innhold.type}</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Kladd</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{innhold.tittel}</h3>
                {innhold.forfatter && <p className="text-gray-600 text-sm mb-2">{innhold.forfatter}</p>}
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{innhold.beskrivelse}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Fra {innhold.bibliotek}</span>
                  <div className="space-x-2">
                    <button className="px-4 py-2 bg-[#16425b] text-white text-sm rounded-lg font-medium">Publiser</button>
                    <button onClick={() => handleRemoveImport(innhold.id)} className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg">Fjern</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center space-x-4">
              <input type="text" value={søk} onChange={e => setSøk(e.target.value)} className="flex-1 px-4 py-3 border rounded-lg" placeholder="Søk i delt innhold..." />
              <div className="flex space-x-2">
                {(['alle', 'anbefaling', 'arrangement', 'artikkel'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-[#16425b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {f === 'alle' ? 'Alle' : f.charAt(0).toUpperCase() + f.slice(1) + 'er'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {filteredContent.map(innhold => (
              <div key={innhold.id} className={`bg-white rounded-xl shadow-sm p-6 border transition-colors ${isImported(innhold.id) ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getBadge(innhold.type)}`}>{getTypeIcon(innhold.type)} {innhold.type}</span>
                  {isImported(innhold.id) && <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">✓ Importert</span>}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{innhold.tittel}</h3>
                {innhold.forfatter && <p className="text-gray-600 text-sm mb-2">{innhold.forfatter}</p>}
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{innhold.beskrivelse}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500"><span className="font-medium">{innhold.bibliotek}</span> · {new Date(innhold.delt).toLocaleDateString('nb-NO')}</span>
                  {!isImported(innhold.id) ? (
                    <button onClick={() => handleImport(innhold)} className="px-4 py-2 bg-[#16425b] text-white text-sm rounded-lg font-medium">📥 Importer</button>
                  ) : (
                    <span className="text-green-600 text-sm font-medium">Lagt til som kladd</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showToast && <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">{toastMessage}</div>}
    </div>
  )
}
