'use client'

import { useState, useEffect } from 'react'

interface Bilde {
  id: string
  url: string
  tittel: string
  kilde: 'katalog' | 'anbefaling' | 'arrangement' | 'opplastet'
  kildeId: string | null
  kildeNavn?: string
  opprettet: string
  tags: string[]
}

/* ───── SVG Icons ───── */
const ic = {
  image: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>,
  book: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  calendar: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  upload: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
}

const KILDE_INFO: Record<string, { label: string; ikon: JSX.Element; farge: string }> = {
  katalog: { label: 'Katalog', ikon: ic.book, farge: 'bg-blue-100 text-blue-800' },
  anbefaling: { label: 'Anbefaling', ikon: ic.star, farge: 'bg-purple-100 text-purple-800' },
  arrangement: { label: 'Arrangement', ikon: ic.calendar, farge: 'bg-green-100 text-green-800' },
  opplastet: { label: 'Opplastet', ikon: ic.upload, farge: 'bg-orange-100 text-orange-800' },
}

export default function BilderPage() {
  const [bilder, setBilder] = useState<Bilde[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [valgtKilde, setValgtKilde] = useState('alle')
  const [søk, setSøk] = useState('')
  const [valgtBilde, setValgtBilde] = useState<Bilde | null>(null)

  // Legg til
  const [visLeggTil, setVisLeggTil] = useState(false)
  const [nyUrl, setNyUrl] = useState('')
  const [nyTittel, setNyTittel] = useState('')
  const [nyTags, setNyTags] = useState('')

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => { fetchBilder() }, [valgtKilde])

  const fetchBilder = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (valgtKilde !== 'alle') params.set('kilde', valgtKilde)
      const res = await fetch(`/api/bilder?${params}`)
      const data = await res.json()
      if (Array.isArray(data)) setBilder(data)
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const handleLeggTil = async () => {
    if (!nyUrl) return
    try {
      const res = await fetch('/api/bilder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: nyUrl,
          tittel: nyTittel || 'Uten tittel',
          tags: nyTags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      if (res.ok) {
        setNyUrl(''); setNyTittel(''); setNyTags(''); setVisLeggTil(false)
        fetchBilder()
        toast('Bilde lagt til!')
      }
    } catch (e) { toast('Feil ved lagring') }
  }

  const handleSlett = async (id: string) => {
    if (!confirm('Slette dette bildet fra biblioteket?')) return
    try {
      const res = await fetch(`/api/bilder?id=${id}`, { method: 'DELETE' })
      if (res.ok) { fetchBilder(); setValgtBilde(null); toast('Bilde slettet') }
    } catch (e) { toast('Kan bare slette opplastede bilder') }
  }

  const kopierUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast('URL kopiert!')
  }

  const toast = (msg: string) => {
    setToastMessage(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000)
  }

  const filtrerteBilder = søk
    ? bilder.filter(b => b.tittel.toLowerCase().includes(søk.toLowerCase()) || b.tags.some(t => t.includes(søk.toLowerCase())))
    : bilder

  const antallPerKilde = {
    alle: bilder.length,
    ...Object.keys(KILDE_INFO).reduce((acc, k) => ({ ...acc, [k]: bilder.filter(b => b.kilde === k).length }), {} as Record<string, number>),
  }

  const KILDE_FILTER = [
    { key: 'alle', label: 'Totalt', ikon: ic.image },
    ...Object.entries(KILDE_INFO).map(([key, info]) => ({ key, label: info.label, ikon: info.ikon })),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bildebibliotek</h1>
          <p className="mt-2 text-gray-600">Alle bilder samlet — fra katalog, anbefalinger, arrangementer og opplastede</p>
        </div>
        <button onClick={() => setVisLeggTil(!visLeggTil)}
          className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">
          + Last opp bilde
        </button>
      </div>

      {/* Statistikk */}
      <div className="grid grid-cols-5 gap-3">
        {KILDE_FILTER.map(({ key, label, ikon }) => (
          <button key={key} onClick={() => setValgtKilde(key)}
            className={`rounded-xl p-4 border transition-all text-left ${
              valgtKilde === key ? 'border-[#16425b] bg-[#16425b]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
            }`}>
            <div className="mb-1 text-gray-500">{ikon}</div>
            <div className="text-2xl font-bold">{antallPerKilde[key as keyof typeof antallPerKilde] || 0}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </button>
        ))}
      </div>

      {/* Legg til */}
      {visLeggTil && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="flex items-center gap-1.5 font-semibold mb-4">{ic.upload} Legg til bilde i biblioteket</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bilde-URL *</label>
              <input type="text" value={nyUrl} onChange={e => setNyUrl(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tittel</label>
              <input type="text" value={nyTittel} onChange={e => setNyTittel(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                placeholder="Beskriv bildet" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (kommaseparert)</label>
              <div className="flex space-x-2">
                <input type="text" value={nyTags} onChange={e => setNyTags(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="bibliotek, interiør" />
                <button onClick={handleLeggTil}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Lagre</button>
              </div>
            </div>
          </div>
          {nyUrl && (
            <div className="mt-4">
              <img src={nyUrl} alt="Forhåndsvisning" className="h-32 rounded-lg object-cover border"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          )}
        </div>
      )}

      {/* Søk */}
      <div className="relative">
        <input type="text" value={søk} onChange={e => setSøk(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white"
          placeholder="Søk i bilder..." />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{ic.search}</span>
      </div>

      {/* Bilderutenett */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Laster bilder...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtrerteBilder.map(bilde => {
            const info = KILDE_INFO[bilde.kilde]
            return (
              <button key={bilde.id} onClick={() => setValgtBilde(bilde)}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 hover:border-[#16425b] hover:shadow-lg transition-all bg-gray-100 text-left">
                <img src={bilde.url} alt={bilde.tittel}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium truncate">{bilde.tittel}</p>
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full font-medium ${info?.farge || 'bg-gray-100 text-gray-700'}`}>
                    {info?.ikon} {info?.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Detalj-modal */}
      {valgtBilde && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setValgtBilde(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={valgtBilde.url} alt={valgtBilde.tittel} className="w-full max-h-[50vh] object-contain bg-gray-100" />
              <button onClick={() => setValgtBilde(null)}
                className="absolute top-4 right-4 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-lg text-xl">&times;</button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{valgtBilde.tittel}</h3>
              <div className="flex items-center space-x-3 mb-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${KILDE_INFO[valgtBilde.kilde]?.farge}`}>
                  {KILDE_INFO[valgtBilde.kilde]?.ikon} {KILDE_INFO[valgtBilde.kilde]?.label}
                </span>
                {valgtBilde.kildeNavn && <span className="text-sm text-gray-500">Fra: {valgtBilde.kildeNavn}</span>}
                <span className="text-sm text-gray-400">{new Date(valgtBilde.opprettet).toLocaleDateString('nb-NO')}</span>
              </div>
              {valgtBilde.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {valgtBilde.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center space-x-3">
                <button onClick={() => kopierUrl(valgtBilde.url)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#16425b] text-white rounded-lg text-sm font-medium hover:bg-[#1a5270]">
                  {ic.copy} Kopier URL
                </button>
                <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-xs text-gray-600 truncate">{valgtBilde.url}</code>
                {valgtBilde.kilde === 'opplastet' && (
                  <button onClick={() => handleSlett(valgtBilde.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
                    {ic.trash} Slett
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">{toastMessage}</div>
      )}
    </div>
  )
}
