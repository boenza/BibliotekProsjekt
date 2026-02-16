'use client'

import { useState } from 'react'

/* ───── SVG Icons ───── */
const ic = {
  book: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  link: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
}

export default function InnstillingerPage() {
  const [bibliotekNavn, setBibliotekNavn] = useState('Bergen Offentlige Bibliotek')
  const [epost, setEpost] = useState('post@bergen.bibliotek.no')
  const [telefon, setTelefon] = useState('55 56 85 60')
  const [adresse, setAdresse] = useState('Strømgaten 6, 5015 Bergen')
  const [farge, setFarge] = useState('#16425b')
  const [maxLån, setMaxLån] = useState(20)
  const [lånePeriode, setLånePeriode] = useState(28)
  const [maxFornyelser, setMaxFornyelser] = useState(3)
  const [showToast, setShowToast] = useState(false)

  const handleSave = () => { setShowToast(true); setTimeout(() => setShowToast(false), 3000) }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-gray-900">Innstillinger</h1><p className="mt-2 text-gray-600">Konfigurer systemet</p></div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="flex items-center gap-1.5 text-lg font-semibold mb-4">{ic.book} Bibliotekinfo</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Navn</label><input type="text" value={bibliotekNavn} onChange={e => setBibliotekNavn(e.target.value)} className="w-full px-4 py-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">E-post</label><input type="text" value={epost} onChange={e => setEpost(e.target.value)} className="w-full px-4 py-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label><input type="text" value={telefon} onChange={e => setTelefon(e.target.value)} className="w-full px-4 py-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label><input type="text" value={adresse} onChange={e => setAdresse(e.target.value)} className="w-full px-4 py-3 border rounded-lg" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="flex items-center gap-1.5 text-lg font-semibold mb-4">{ic.settings} Låneregler</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Maks samtidige lån</label><input type="number" value={maxLån} onChange={e => setMaxLån(parseInt(e.target.value))} className="w-full px-4 py-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Utlånsperiode (dager)</label><input type="number" value={lånePeriode} onChange={e => setLånePeriode(parseInt(e.target.value))} className="w-full px-4 py-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Maks fornyelser</label><input type="number" value={maxFornyelser} onChange={e => setMaxFornyelser(parseInt(e.target.value))} className="w-full px-4 py-3 border rounded-lg" /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profilfarge</label>
              <div className="flex items-center space-x-3">
                <input type="color" value={farge} onChange={e => setFarge(e.target.value)} className="w-12 h-12 rounded border cursor-pointer" />
                <span className="text-sm text-gray-600 font-mono">{farge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h3 className="flex items-center gap-1.5 text-lg font-semibold mb-4">{ic.link} Integrasjoner</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { navn: 'Biblio', status: 'Tilkoblet', farge: 'green' },
            { navn: 'Filmoteket', status: 'Tilkoblet', farge: 'green' },
            { navn: 'NCIP/SIP2 (ILS)', status: 'Demo-modus', farge: 'yellow' },
            { navn: 'Lånekort-SSO (OIDC)', status: 'Demo-modus', farge: 'yellow' },
            { navn: 'PressReader', status: 'Ikke konfigurert', farge: 'gray' },
            { navn: 'BookBites', status: 'Ikke konfigurert', farge: 'gray' },
          ].map(int => (
            <div key={int.navn} className="p-4 border rounded-lg">
              <div className="font-medium text-gray-900 mb-1">{int.navn}</div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${int.farge}-100 text-${int.farge}-800`}>{int.status}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className="px-8 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">Lagre innstillinger</button>
      {showToast && <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">Innstillinger lagret</div>}
    </div>
  )
}
