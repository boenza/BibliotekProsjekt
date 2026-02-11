'use client'

import { useState } from 'react'

interface Artikkel {
  id: string
  tittel: string
  ingress: string
  innhold: string
  bildeUrl: string
  kategori: string
  publisert: boolean
  opprettet: string
}

const KATEGORIER = ['Nyhet', 'Guide', 'Kronikk', 'Intervju', 'Tips']

export default function ArtiklerPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tittel, setTittel] = useState('')
  const [ingress, setIngress] = useState('')
  const [innhold, setInnhold] = useState('')
  const [bildeUrl, setBildeUrl] = useState('')
  const [kategori, setKategori] = useState('Nyhet')
  const [artikler, setArtikler] = useState<Artikkel[]>([
    { id: 'art-1', tittel: 'Slik får du mest ut av bibliotekets digitale tilbud', ingress: 'En komplett guide til alle digitale tjenester ved Bergen Offentlige Bibliotek.', innhold: 'Med lånekort hos Bergen Offentlige Bibliotek har du tilgang til et bredt spekter av digitale tjenester. Biblio gir deg tilgang til tusenvis av e-bøker og lydbøker, Filmoteket lar deg streame norske og internasjonale filmer, og PressReader gir deg tilgang til aviser og magasiner fra hele verden.\n\nFor å komme i gang trenger du bare ditt bibliotekkortnummer. Gå til biblio.no, filmoteket.no eller pressreader.com og logg inn med kortnummeret ditt. Alle tjenestene er helt gratis.', bildeUrl: '', kategori: 'Guide', publisert: true, opprettet: '2026-01-15' },
    { id: 'art-2', tittel: 'Ny barneavdeling på Loddefjord bibliotek', ingress: 'Loddefjord bibliotek har fått en helt ny og oppgradert barneavdeling.', innhold: 'Etter flere måneders renovering åpner vi endelig dørene til den nye barneavdelingen på Loddefjord bibliotek. Den nye avdelingen er designet for å inspirere til lesing og kreativitet, med myke lesekroker, interaktive stasjoner og et stort utvalg av bøker for alle aldersgrupper.\n\nÅpningsfesten finner sted lørdag 15. februar kl. 11:00, med lesestund, aktiviteter og servering.', bildeUrl: '', kategori: 'Nyhet', publisert: true, opprettet: '2026-02-01' },
  ])
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const toast = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000) }

  const resetForm = () => { setTittel(''); setIngress(''); setInnhold(''); setBildeUrl(''); setKategori('Nyhet'); setEditingId(null); setShowForm(false) }

  const handleSave = (publisert: boolean) => {
    if (!tittel || !innhold) { alert('Tittel og innhold er påkrevd'); return }
    if (editingId) {
      setArtikler(prev => prev.map(a => a.id === editingId ? { ...a, tittel, ingress, innhold, bildeUrl, kategori, publisert } : a))
      toast('Artikkel oppdatert!')
    } else {
      const ny: Artikkel = { id: `art-${Date.now()}`, tittel, ingress, innhold, bildeUrl, kategori, publisert, opprettet: new Date().toISOString().split('T')[0] }
      setArtikler(prev => [ny, ...prev])
      toast(publisert ? 'Artikkel publisert!' : 'Lagret som kladd')
    }
    resetForm()
  }

  const handleEdit = (a: Artikkel) => {
    setEditingId(a.id); setTittel(a.tittel); setIngress(a.ingress); setInnhold(a.innhold)
    setBildeUrl(a.bildeUrl); setKategori(a.kategori); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Slette denne artikkelen?')) return
    setArtikler(prev => prev.filter(a => a.id !== id)); toast('Slettet')
  }

  const handleToggle = (id: string) => {
    setArtikler(prev => prev.map(a => a.id === id ? { ...a, publisert: !a.publisert } : a))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">Artikler</h1><p className="mt-2 text-gray-600">Skriv og publiser artikler og blogginnlegg</p></div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">+ Ny artikkel</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-6">{editingId ? '✏️ Rediger artikkel' : 'Ny artikkel'}</h3>
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tittel *</label>
                <input type="text" value={tittel} onChange={e => setTittel(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="Artikkeltittel" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select value={kategori} onChange={e => setKategori(e.target.value)} className="w-full px-4 py-3 border rounded-lg">
                  {KATEGORIER.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bilde-URL</label>
              <input type="text" value={bildeUrl} onChange={e => setBildeUrl(e.target.value)} className="w-full px-4 py-3 border rounded-lg" placeholder="https://..." />
              {bildeUrl && <img src={bildeUrl} alt="" className="mt-2 h-32 rounded-lg object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingress</label>
              <textarea value={ingress} onChange={e => setIngress(e.target.value)} rows={2} className="w-full px-4 py-3 border rounded-lg" placeholder="Kort oppsummering..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Innhold *</label>
              <textarea value={innhold} onChange={e => setInnhold(e.target.value)} rows={10} className="w-full px-4 py-3 border rounded-lg" placeholder="Skriv artikkelen her..." />
            </div>
            <div className="flex space-x-4 pt-4 border-t">
              <button onClick={() => handleSave(true)} className="px-8 py-3 bg-[#16425b] text-white rounded-lg font-medium">{editingId ? 'Oppdater' : 'Publiser'}</button>
              <button onClick={() => handleSave(false)} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium">Lagre som kladd</button>
              <button onClick={resetForm} className="px-8 py-3 text-gray-600">Avbryt</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {artikler.length === 0 ? <div className="p-8 text-center text-gray-500">Ingen artikler ennå.</div> : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-6 py-4 text-sm font-semibold">Tittel</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Kategori</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Dato</th>
              <th className="text-right px-6 py-4 text-sm font-semibold">Handlinger</th>
            </tr></thead>
            <tbody className="divide-y">
              {artikler.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{a.tittel}</td>
                  <td className="px-6 py-4 text-gray-600">{a.kategori}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 text-xs font-medium rounded-full ${a.publisert ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{a.publisert ? 'Publisert' : 'Kladd'}</span></td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{a.opprettet}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleToggle(a.id)} className={`text-sm font-medium ${a.publisert ? 'text-yellow-600' : 'text-green-600'}`}>{a.publisert ? 'Avpubliser' : 'Publiser'}</button>
                    <button onClick={() => handleEdit(a)} className="text-[#16425b] font-medium text-sm">Rediger</button>
                    <button onClick={() => handleDelete(a.id)} className="text-red-600 font-medium text-sm">Slett</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showToast && <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">{toastMsg}</div>}
    </div>
  )
}
