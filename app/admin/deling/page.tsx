'use client'

import { useState } from 'react'

interface DeltInnhold {
  id: string
  type: 'anbefaling' | 'arrangement' | 'artikkel'
  tittel: string
  beskrivelse: string
  forfatter?: string
  bibliotek: string
  kommune: string
  delt: string
  kategori?: string
  bildeUrl?: string
}

// Mock data fra andre bibliotek
const andresInnhold: DeltInnhold[] = [
  {
    id: 'delt-1',
    type: 'anbefaling',
    tittel: 'Dei sju dørene',
    beskrivelse: 'Agnes Ravatn har skrevet en fengslende roman om hemmeligheter, identitet og konsekvenser. Et must for alle som liker norsk samtidslitteratur.',
    forfatter: 'Agnes Ravatn',
    bibliotek: 'Stavanger bibliotek',
    kommune: 'Stavanger',
    delt: '2026-02-01',
    kategori: 'Roman',
  },
  {
    id: 'delt-2',
    type: 'arrangement',
    tittel: 'Barnas lesesirkel — Vinterferiespecial',
    beskrivelse: 'Bli med på lesesirkel for barn 8-12 år! Vi leser og diskuterer bøker sammen, med aktiviteter og godteri.',
    bibliotek: 'Trondheim folkebibliotek',
    kommune: 'Trondheim',
    delt: '2026-01-28',
    kategori: 'Barnearrangement',
  },
  {
    id: 'delt-3',
    type: 'anbefaling',
    tittel: 'Fuglane',
    beskrivelse: 'Tarjei Vesaas\' mesterverk om Mattis og hans søster Hege. En tidløs og vakker fortelling om å være annerledes.',
    forfatter: 'Tarjei Vesaas',
    bibliotek: 'Oslo deichmanske bibliotek',
    kommune: 'Oslo',
    delt: '2026-02-05',
    kategori: 'Klassiker',
  },
  {
    id: 'delt-4',
    type: 'arrangement',
    tittel: 'Digital mestring for seniorer',
    beskrivelse: 'Kurs i bruk av nettbank, Altinn og digitale helsetjenester. Gratis og åpent for alle over 60 år.',
    bibliotek: 'Bodø bibliotek',
    kommune: 'Bodø',
    delt: '2026-02-03',
    kategori: 'Kurs',
  },
  {
    id: 'delt-5',
    type: 'artikkel',
    tittel: 'Slik får du mest ut av bibliotekets digitale tilbud',
    beskrivelse: 'En guide til Biblio, Filmoteket, PressReader og andre digitale tjenester du har tilgang til som bibliotekkort-eier.',
    bibliotek: 'Kristiansand folkebibliotek',
    kommune: 'Kristiansand',
    delt: '2026-01-20',
    kategori: 'Guide',
  },
  {
    id: 'delt-6',
    type: 'anbefaling',
    tittel: 'Doppler',
    beskrivelse: 'Erlend Loes kjente roman om mannen som forlater alt og flytter inn i skogen. Humoristisk og tankevekkende.',
    forfatter: 'Erlend Loe',
    bibliotek: 'Drammen bibliotek',
    kommune: 'Drammen',
    delt: '2026-02-07',
    kategori: 'Roman',
  },
]

export default function DelingPage() {
  const [filter, setFilter] = useState<'alle' | 'anbefaling' | 'arrangement' | 'artikkel'>('alle')
  const [importerte, setImporterte] = useState<string[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [søk, setSøk] = useState('')

  const filteredContent = andresInnhold
    .filter(i => filter === 'alle' || i.type === filter)
    .filter(i => !søk || 
      i.tittel.toLowerCase().includes(søk.toLowerCase()) ||
      i.bibliotek.toLowerCase().includes(søk.toLowerCase()) ||
      (i.forfatter && i.forfatter.toLowerCase().includes(søk.toLowerCase()))
    )

  const handleImport = async (innhold: DeltInnhold) => {
    // Simuler import
    setImporterte(prev => [...prev, innhold.id])
    setToastMessage(`"${innhold.tittel}" importert fra ${innhold.bibliotek} — tilgjengelig som kladd`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'anbefaling': return '⭐'
      case 'arrangement': return '📅'
      case 'artikkel': return '📝'
      default: return '📄'
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'anbefaling': return 'bg-purple-100 text-purple-800'
      case 'arrangement': return 'bg-blue-100 text-blue-800'
      case 'artikkel': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deling mellom bibliotek</h1>
          <p className="mt-2 text-gray-600">Se og importer innhold delt av andre bibliotek i nettverket</p>
        </div>
        <div className="text-sm text-gray-500 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
          🔗 Koblet til nasjonalt biblioteknettverk · {andresInnhold.length} nye innhold
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-4">
          <input type="text" value={søk} onChange={(e) => setSøk(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
            placeholder="Søk i delt innhold..." />
          
          <div className="flex space-x-2">
            {(['alle', 'anbefaling', 'arrangement', 'artikkel'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-[#16425b] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {f === 'alle' ? 'Alle' : f.charAt(0).toUpperCase() + f.slice(1) + 'er'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-2 gap-6">
        {filteredContent.map(innhold => (
          <div key={innhold.id} className={`bg-white rounded-xl shadow-sm p-6 border transition-colors ${
            importerte.includes(innhold.id) ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-[#16425b]/30'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(innhold.type)}`}>
                  {getTypeIcon(innhold.type)} {innhold.type.charAt(0).toUpperCase() + innhold.type.slice(1)}
                </span>
                {innhold.kategori && (
                  <span className="text-xs text-gray-500">{innhold.kategori}</span>
                )}
              </div>
              {importerte.includes(innhold.id) && (
                <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">✓ Importert</span>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">{innhold.tittel}</h3>
            {innhold.forfatter && (
              <p className="text-gray-600 text-sm mb-2">{innhold.forfatter}</p>
            )}
            <p className="text-gray-700 text-sm mb-4 line-clamp-3">{innhold.beskrivelse}</p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                <span className="font-medium">{innhold.bibliotek}</span>
                <span className="mx-1">·</span>
                <span>Delt {new Date(innhold.delt).toLocaleDateString('nb-NO')}</span>
              </div>

              {!importerte.includes(innhold.id) ? (
                <button onClick={() => handleImport(innhold)}
                  className="px-4 py-2 bg-[#16425b] text-white text-sm rounded-lg hover:bg-[#1a5270] transition-colors font-medium">
                  📥 Importer
                </button>
              ) : (
                <span className="text-green-600 text-sm font-medium">Lagt til som kladd</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Ingen innhold funnet med gjeldende filter.
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">{toastMessage}</div>
      )}
    </div>
  )
}
