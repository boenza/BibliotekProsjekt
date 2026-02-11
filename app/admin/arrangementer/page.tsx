'use client'

import { useState, useEffect } from 'react'
import ImageEditor from '@/components/ImageEditor'

interface Arrangement {
  id: string
  tittel: string
  beskrivelse: string
  dato: string
  klokkeslett: string
  sted: string
  kategori: string
  bildeUrl: string | null
  maxDeltakere: number | null
  antallPåmeldt: number
  publisert: boolean
  opprettet: string
  serieTittel?: string | null
}

const KATEGORIER = [
  'Foredrag', 'Forfatterbesøk', 'Verksted', 'Barneaktivitet', 'Ungdomsarrangement',
  'Boklubb', 'Utstilling', 'Konsert', 'Kurs', 'Debatt', 'Annet',
]

const STEDER = [
  'Bergen Hovedbibliotek — Store sal', 'Bergen Hovedbibliotek — Lille sal',
  'Bergen Hovedbibliotek — Barnebiblioteket', 'Bergen Hovedbibliotek — Lesesalen',
  'Loddefjord bibliotek', 'Fana bibliotek', 'Åsane bibliotek',
  'Fyllingsdalen bibliotek', 'Digitalt (Zoom)',
]

export default function ArrangementerPage() {
  const [arrangementer, setArrangementer] = useState<Arrangement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [tittel, setTittel] = useState('')
  const [beskrivelse, setBeskrivelse] = useState('')
  const [dato, setDato] = useState('')
  const [klokkeslett, setKlokkeslett] = useState('')
  const [sted, setSted] = useState(STEDER[0])
  const [kategori, setKategori] = useState(KATEGORIER[0])
  const [bildeUrl, setBildeUrl] = useState('')
  const [maxDeltakere, setMaxDeltakere] = useState('')
  const [serieTittel, setSerieTittel] = useState('')

  // Image editor
  const [showImageEditor, setShowImageEditor] = useState(false)

  // Toast
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Filter
  const [filterKategori, setFilterKategori] = useState('Alle')
  const [filterTid, setFilterTid] = useState<'kommende' | 'alle' | 'tidligere'>('kommende')

  useEffect(() => { fetchArrangementer() }, [])

  const fetchArrangementer = async () => {
    try {
      const res = await fetch('/api/arrangementer')
      const data = await res.json()
      if (Array.isArray(data)) setArrangementer(data)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTittel(''); setBeskrivelse(''); setDato(''); setKlokkeslett('')
    setSted(STEDER[0]); setKategori(KATEGORIER[0]); setBildeUrl('')
    setMaxDeltakere(''); setSerieTittel(''); setEditingId(null)
  }

  const handleEdit = (arr: Arrangement) => {
    setEditingId(arr.id)
    setTittel(arr.tittel)
    setBeskrivelse(arr.beskrivelse)
    setDato(arr.dato)
    setKlokkeslett(arr.klokkeslett)
    setSted(arr.sted)
    setKategori(arr.kategori)
    setBildeUrl(arr.bildeUrl || '')
    setMaxDeltakere(arr.maxDeltakere?.toString() || '')
    setSerieTittel(arr.serieTittel || '')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string, tittel: string) => {
    if (!confirm(`Slette «${tittel}»?`)) return
    try {
      const res = await fetch(`/api/arrangementer?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchArrangementer()
        toast('Arrangement slettet')
      }
    } catch (error) {
      toast('Feil ved sletting', true)
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/arrangementer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, publisert: !currentStatus })
      })
      if (res.ok) {
        fetchArrangementer()
        toast(currentStatus ? 'Avpublisert' : 'Publisert!')
      }
    } catch (error) {
      toast('Feil', true)
    }
  }

  const handleSave = async (publisert: boolean) => {
    if (!tittel || !dato || !klokkeslett) {
      alert('Tittel, dato og klokkeslett er påkrevd!')
      return
    }

    const payload = {
      tittel, beskrivelse, dato, klokkeslett, sted, kategori,
      bildeUrl: bildeUrl || null,
      maxDeltakere: maxDeltakere ? parseInt(maxDeltakere) : null,
      serieTittel: serieTittel || null,
      publisert,
    }

    try {
      let res
      if (editingId) {
        res = await fetch('/api/arrangementer', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload })
        })
      } else {
        res = await fetch('/api/arrangementer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (res.ok) {
        resetForm()
        setShowForm(false)
        fetchArrangementer()
        toast(editingId ? 'Arrangement oppdatert!' : (publisert ? 'Publisert!' : 'Lagret som kladd!'))
      } else {
        toast('Kunne ikke lagre', true)
      }
    } catch (error) {
      toast('Noe gikk galt', true)
    }
  }

  const handleImageEditorSave = (dataUrl: string) => {
    setBildeUrl(dataUrl)
    setShowImageEditor(false)
    toast('Bilde redigert!')
  }

  const toast = (msg: string, isError = false) => {
    setToastMessage(isError ? `❌ ${msg}` : `✅ ${msg}`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }

  // Filtrering
  const nå = new Date()
  let filtrert = [...arrangementer]
  if (filterKategori !== 'Alle') filtrert = filtrert.filter(a => a.kategori === filterKategori)
  if (filterTid === 'kommende') filtrert = filtrert.filter(a => new Date(a.dato) >= nå)
  else if (filterTid === 'tidligere') filtrert = filtrert.filter(a => new Date(a.dato) < nå)
  filtrert.sort((a, b) => new Date(a.dato).getTime() - new Date(b.dato).getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Arrangementer</h1>
          <p className="mt-2 text-gray-600">Administrer bibliotekets arrangementer og aktiviteter</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium">
          {showForm ? 'Lukk skjema' : '+ Nytt arrangement'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-6">
            {editingId ? '✏️ Rediger arrangement' : '📅 Nytt arrangement'}
          </h3>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tittel *</label>
                <input type="text" value={tittel} onChange={e => setTittel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]"
                  placeholder="F.eks. 'Forfattermøte: Agnes Ravatn'" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select value={kategori} onChange={e => setKategori(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]">
                  {KATEGORIER.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dato *</label>
                <input type="date" value={dato} onChange={e => setDato(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Klokkeslett *</label>
                <input type="time" value={klokkeslett} onChange={e => setKlokkeslett(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maks deltakere</label>
                <input type="number" value={maxDeltakere} onChange={e => setMaxDeltakere(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]"
                  placeholder="Ubegrenset" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sted</label>
              <select value={sted} onChange={e => setSted(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]">
                {STEDER.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
              <textarea value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]"
                placeholder="Beskriv arrangementet..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serietittel (valgfritt)</label>
              <input type="text" value={serieTittel} onChange={e => setSerieTittel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]"
                placeholder="F.eks. 'Sommerlesing 2026' — for å gruppere arrangementer i en serie" />
            </div>

            {/* BILDE — #14 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🖼️ Forsidebilde (valgfritt)</label>
              <div className="flex items-center space-x-3">
                <input type="text" value={bildeUrl} onChange={e => setBildeUrl(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]"
                  placeholder="Lim inn bilde-URL (fra Unsplash, biblioteket.no, etc.)" />
                {bildeUrl && (
                  <button onClick={() => setShowImageEditor(true)}
                    className="px-4 py-3 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 font-medium flex items-center space-x-2">
                    <span>🖼️</span><span>Rediger</span>
                  </button>
                )}
              </div>
              {bildeUrl && (
                <div className="mt-3 relative inline-block group">
                  <img src={bildeUrl} alt="Forhåndsvisning"
                    className="h-40 rounded-lg object-cover shadow-sm border border-gray-200"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                    <button onClick={() => setBildeUrl('')}
                      className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-red-600 text-white text-sm rounded-lg transition-opacity">
                      Fjern bilde
                    </button>
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                💡 Bildet vises på arrangementkortet i den offentlige visningen og på infoskjermen.
                Anbefalt størrelse: 800×400px, liggende format.
              </p>
            </div>

            {/* Handlinger */}
            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
              <button onClick={() => handleSave(true)}
                className="px-8 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">
                {editingId ? 'Oppdater og publiser' : 'Publiser'}
              </button>
              <button onClick={() => handleSave(false)}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                Lagre som kladd
              </button>
              <button onClick={() => { resetForm(); setShowForm(false) }}
                className="px-8 py-3 text-gray-600 hover:text-gray-900">
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ImageEditor Modal */}
      {showImageEditor && bildeUrl && (
        <ImageEditor
          imageUrl={bildeUrl}
          onSave={handleImageEditorSave}
          onClose={() => setShowImageEditor(false)}
        />
      )}

      {/* Filtre */}
      <div className="flex items-center space-x-4">
        <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
          {(['kommende', 'alle', 'tidligere'] as const).map(tid => (
            <button key={tid} onClick={() => setFilterTid(tid)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filterTid === tid ? 'bg-[#16425b] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {tid === 'kommende' ? 'Kommende' : tid === 'alle' ? 'Alle' : 'Tidligere'}
            </button>
          ))}
        </div>
        <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="Alle">Alle kategorier</option>
          {KATEGORIER.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtrert.length} arrangementer</span>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Laster arrangementer...</div>
        ) : filtrert.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Ingen arrangementer funnet</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Arrangement</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Dato</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Sted</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Påmeldt</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtrert.map(arr => {
                const passert = new Date(arr.dato) < nå
                return (
                  <tr key={arr.id} className={`hover:bg-gray-50 ${passert ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {arr.bildeUrl ? (
                          <img src={arr.bildeUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-[#16425b]/10 rounded-lg flex items-center justify-center text-xl">📅</div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{arr.tittel}</div>
                          <div className="text-sm text-gray-500">{arr.kategori}</div>
                          {arr.serieTittel && <div className="text-xs text-purple-600">Serie: {arr.serieTittel}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(arr.dato).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <br /><span className="text-gray-400">kl {arr.klokkeslett}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{arr.sted}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="font-medium">{arr.antallPåmeldt || 0}</span>
                      {arr.maxDeltakere && <span className="text-gray-400">/{arr.maxDeltakere}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        passert ? 'bg-gray-100 text-gray-600'
                        : arr.publisert ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {passert ? 'Avholdt' : arr.publisert ? 'Publisert' : 'Kladd'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {!passert && (
                        <button onClick={() => handleTogglePublish(arr.id, arr.publisert)}
                          className={`font-medium text-sm ${arr.publisert ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}>
                          {arr.publisert ? 'Avpubliser' : 'Publiser'}
                        </button>
                      )}
                      <button onClick={() => handleEdit(arr)}
                        className="text-[#16425b] hover:text-[#1a5270] font-medium text-sm">Rediger</button>
                      <button onClick={() => handleDelete(arr.id, arr.tittel)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm">Slett</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">{toastMessage}</div>
      )}
    </div>
  )
}
