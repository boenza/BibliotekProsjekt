'use client'

import { useState, useEffect } from 'react'
import BildeVelger from '@/components/BildeVelger'

interface Tjeneste {
  id: string
  tittel: string
  beskrivelse: string
  kategori: string
  ikon: string
  bildeUrl: string | null
  kontaktInfo: string
  lenke: string
  publisert: boolean
  rekkefølge: number
}

/* ───── SVG Icons (UI) ───── */
const ic = {
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>,
  image: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>,
  pin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
}

/* ───── Service Icon System ─────
   Replaces emoji with named SVG icons. Each service stores an icon key (string).
   Renders via getServiceIcon(). Backwards-compatible: unknown keys show a default. */
const SERVICE_ICONS: Record<string, { label: string; svg: JSX.Element }> = {
  building: { label: 'Bygg/Rom', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg> },
  printer: { label: 'Utstyr', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> },
  sprout: { label: 'Natur/Bærekraft', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg> },
  backpack: { label: 'Barn/Unge', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z"/><path d="M9 6V4a3 3 0 0 1 6 0v2"/><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/></svg> },
  book: { label: 'Bøker', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg> },
  search: { label: 'Søk/Veiledning', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
  phone: { label: 'Mobil/App', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
  laptop: { label: 'Data/PC', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg> },
  palette: { label: 'Kunst/Kreativt', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg> },
  music: { label: 'Musikk/Lyd', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
  gamepad: { label: 'Spill/Gaming', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg> },
  clipboard: { label: 'Skjema/Tjeneste', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/></svg> },
  puzzle: { label: 'Aktivitet', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.618 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02z"/></svg> },
  accessibility: { label: 'Tilgjengelighet', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/></svg> },
  globe: { label: 'Språk/Flerspråklig', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
  newspaper: { label: 'Avis/Tidsskrift', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5"/></svg> },
}

const ICON_KEYS = Object.keys(SERVICE_ICONS)
const KATEGORIER = ['Rom og utstyr', 'Digitale tjenester', 'For barn og unge', 'For skoler og barnehager', 'Veiledning', 'Annet']

/** Render service icon by key. Falls back to clipboard for unknown keys. */
function getServiceIcon(key: string, size = 20) {
  return SERVICE_ICONS[key]?.svg || SERVICE_ICONS.clipboard.svg
}

export default function TjenesterPage() {
  const [tjenester, setTjenester] = useState<Tjeneste[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterKat, setFilterKat] = useState('Alle')

  const [tittel, setTittel] = useState('')
  const [beskrivelse, setBeskrivelse] = useState('')
  const [kategori, setKategori] = useState(KATEGORIER[0])
  const [ikon, setIkon] = useState('clipboard')
  const [bildeUrl, setBildeUrl] = useState('')
  const [kontaktInfo, setKontaktInfo] = useState('')
  const [lenke, setLenke] = useState('')

  const [showBildeVelger, setShowBildeVelger] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const res = await fetch('/api/tjenester'); const data = await res.json(); if (Array.isArray(data)) setTjenester(data) }
    catch (e) { console.error(e) } finally { setIsLoading(false) }
  }

  const toast = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3500) }

  const resetForm = () => {
    setEditingId(null); setTittel(''); setBeskrivelse('')
    setKategori(KATEGORIER[0]); setIkon('clipboard'); setBildeUrl('')
    setKontaktInfo(''); setLenke('')
  }

  const handleEdit = (tj: Tjeneste) => {
    setEditingId(tj.id); setTittel(tj.tittel); setBeskrivelse(tj.beskrivelse)
    setKategori(tj.kategori); setIkon(tj.ikon); setBildeUrl(tj.bildeUrl || '')
    setKontaktInfo(tj.kontaktInfo); setLenke(tj.lenke)
    setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async (publiser: boolean) => {
    if (!tittel) { alert('Tittel er påkrevd!'); return }
    const payload = { tittel, beskrivelse, kategori, ikon, bildeUrl: bildeUrl || null, kontaktInfo, lenke, publisert: publiser }
    try {
      const res = editingId
        ? await fetch('/api/tjenester', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...payload }) })
        : await fetch('/api/tjenester', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        resetForm(); setShowForm(false); fetchData()
        toast(editingId ? 'Oppdatert!' : publiser ? 'Publisert!' : 'Lagret som kladd')
      }
    } catch { toast('Feil') }
  }

  const handleToggle = async (id: string, current: boolean) => {
    await fetch('/api/tjenester', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, publisert: !current }) })
    fetchData(); toast(current ? 'Avpublisert' : 'Publisert!')
  }

  const handleDelete = async (id: string, tittel: string) => {
    if (!confirm(`Slette «${tittel}»?`)) return
    await fetch(`/api/tjenester?id=${id}`, { method: 'DELETE' })
    fetchData(); toast('Slettet')
  }

  const moveItem = async (id: string, dir: 'up' | 'down') => {
    const idx = tjenester.findIndex(t => t.id === id)
    const swap = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= tjenester.length) return
    const copy = [...tjenester];
    [copy[idx], copy[swap]] = [copy[swap], copy[idx]]
    await Promise.all([
      fetch('/api/tjenester', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: copy[idx].id, rekkefølge: idx + 1 }) }),
      fetch('/api/tjenester', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: copy[swap].id, rekkefølge: swap + 1 }) }),
    ])
    fetchData()
  }

  const filtrerte = filterKat === 'Alle' ? tjenester : tjenester.filter(t => t.kategori === filterKat)
  const katStats = KATEGORIER.map(k => ({ k, n: tjenester.filter(t => t.kategori === k).length }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tjenester</h1>
          <p className="mt-2 text-gray-600">Bibliotekets tjenestetilbud — studierom, utstyr, veiledning m.m.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">
          {showForm ? 'Lukk' : '+ Ny tjeneste'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3">
        {katStats.map(({ k, n }) => (
          <button key={k} onClick={() => setFilterKat(filterKat === k ? 'Alle' : k)}
            className={`bg-white rounded-xl p-3 border text-left transition-all ${
              filterKat === k ? 'border-[#16425b] ring-1 ring-[#16425b]/20' : 'border-gray-200 hover:border-gray-300'
            }`}>
            <div className="text-xs text-gray-500 truncate">{k}</div>
            <div className="text-xl font-bold">{n}</div>
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="flex items-center gap-1.5 text-lg font-semibold mb-4">
            {editingId ? <>{ic.edit} Rediger tjeneste</> : <>{ic.plus} Ny tjeneste</>}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tittel *</label>
                <input type="text" value={tittel} onChange={e => setTittel(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-lg"
                  placeholder="F.eks. Studierom, 3D-printer..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select value={kategori} onChange={e => setKategori(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                  {KATEGORIER.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
            </div>

            {/* Ikon-velger */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ikon</label>
              <div className="flex flex-wrap gap-2">
                {ICON_KEYS.map(key => (
                  <button key={key} onClick={() => setIkon(key)}
                    title={SERVICE_ICONS[key].label}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                      ikon === key ? 'border-[#16425b] bg-[#16425b]/5 scale-110 text-[#16425b]' : 'border-gray-200 hover:border-gray-300 text-gray-500'
                    }`}>
                    {SERVICE_ICONS[key].svg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
              <textarea value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                placeholder="Beskriv tjenesten, hva den inkluderer, hvem den er for..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktinfo / hvordan bestille</label>
                <input type="text" value={kontaktInfo} onChange={e => setKontaktInfo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="F.eks. Bestill via app, oppmøte i skranken..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lenke (valgfri)</label>
                <input type="text" value={lenke} onChange={e => setLenke(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="/tjenester/studierom" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bilde (valgfritt)</label>
              <div className="flex items-center space-x-3">
                <input type="text" value={bildeUrl} onChange={e => setBildeUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="Bilde-URL" />
                <button onClick={() => setShowBildeVelger(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 font-medium text-sm whitespace-nowrap">
                  {ic.image} Velg fra bibliotek
                </button>
              </div>
              {bildeUrl && (
                <div className="mt-2 flex items-start space-x-3">
                  <img src={bildeUrl} alt="" className="h-20 rounded-lg object-cover border" />
                  <button onClick={() => setBildeUrl('')} className="text-xs text-red-500">Fjern</button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t">
              <button onClick={() => handleSave(true)} className="px-6 py-2.5 bg-[#16425b] text-white rounded-lg font-medium">{editingId ? 'Oppdater og publiser' : 'Publiser'}</button>
              <button onClick={() => handleSave(false)} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium">Lagre som kladd</button>
              <button onClick={() => { resetForm(); setShowForm(false) }} className="px-6 py-2.5 text-gray-600">Avbryt</button>
            </div>
          </div>
        </div>
      )}

      {showBildeVelger && (
        <BildeVelger gjeldendeBildeUrl={bildeUrl}
          onVelg={(url) => { setBildeUrl(url); setShowBildeVelger(false) }}
          onLukk={() => setShowBildeVelger(false)} />
      )}

      {/* Filter-tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        {['Alle', ...KATEGORIER].map(k => (
          <button key={k} onClick={() => setFilterKat(k)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filterKat === k ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
            }`}>
            {k}
          </button>
        ))}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">Laster...</div>
      ) : filtrerte.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">Ingen tjenester i denne kategorien</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtrerte.map((tj, idx) => (
            <div key={tj.id}
              className={`bg-white rounded-xl border p-5 transition-all ${
                tj.publisert ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60'
              }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {tj.bildeUrl ? (
                    <img src={tj.bildeUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-500">
                      {getServiceIcon(tj.ikon)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-gray-500">{getServiceIcon(tj.ikon)}</span>
                      <h3 className="font-semibold text-gray-900">{tj.tittel}</h3>
                    </div>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{tj.kategori}</span>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{tj.beskrivelse}</p>
                    {tj.kontaktInfo && (
                      <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">{ic.pin} {tj.kontaktInfo}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-1">
                  <button onClick={() => moveItem(tj.id, 'up')} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20 text-sm">&uarr;</button>
                  <button onClick={() => moveItem(tj.id, 'down')} disabled={idx === filtrerte.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20 text-sm">&darr;</button>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${tj.publisert ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {tj.publisert ? 'Publisert' : 'Kladd'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleToggle(tj.id, tj.publisert)}
                    className={`text-xs font-medium ${tj.publisert ? 'text-yellow-600' : 'text-green-600'}`}>
                    {tj.publisert ? 'Avpubliser' : 'Publiser'}
                  </button>
                  <button onClick={() => handleEdit(tj)} className="text-xs text-[#16425b] font-medium">Rediger</button>
                  <button onClick={() => handleDelete(tj.id, tj.tittel)} className="text-xs text-red-600 font-medium">Slett</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showToast && <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">{toastMsg}</div>}
    </div>
  )
}
