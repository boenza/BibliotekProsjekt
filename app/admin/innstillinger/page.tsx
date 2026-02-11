'use client'

import { useState } from 'react'

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
          <h3 className="text-lg font-semibold mb-4">📚 Bibliotekinfo</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Navn</label><input type="text" value={bibliotekNavn} onChange={e => setBibliotekNavn(e.target.value)} className="w-full px-4 py-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">E-post</label><input type="text" value={epost} onChange={e => setEpost(e.target.value)} className="w-full px-4 py-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label><input type="text" value={telefon} onChange={e => setTelefon(e.target.value)} className="w-full px-4 py-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label><input type="text" value={adresse} onChange={e => setAdresse(e.target.value)} className="w-full px-4 py-3 border rounded-lg" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4">⚙️ Låneregler</h3>
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
        <h3 className="text-lg font-semibold mb-4">🔗 Integrasjoner</h3>
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
      {showToast && <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">✅ Innstillinger lagret</div>}
    </div>
  )
}
