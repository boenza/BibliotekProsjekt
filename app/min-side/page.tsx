'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import QRLånekort from '@/components/QRLånekort'
import Toast from '@/components/Toast'
import StatsGrid from '@/components/StatsGrid'
import Achievements from '@/components/Achievements'

interface Loan {
  id: string; bokTittel: string; forfatter: string; utlånt: string; forfallsdato: string; filial: string; fornyet: number
}
interface Reservation {
  id: string; bokTittel: string; forfatter: string; plassering: number; filial: string; klar: boolean
}
interface Påmelding {
  id: string; arrangementId: string; navn: string; epost: string; antallPersoner: number; kommentar: string | null; påmeldt: string
  arrangement: { id: string; tittel: string; beskrivelse: string; dato: string; klokkeslett: string; sted: string; kategori: string }
}

export default function MinSidePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lån, setLån] = useState<Loan[]>([])
  const [reservasjoner, setReservasjoner] = useState<Reservation[]>([])
  const [påmeldinger, setPåmeldinger] = useState<Påmelding[]>([])
  const [activeTab, setActiveTab] = useState<'lån' | 'reservasjoner' | 'påmeldinger' | 'digitalt' | 'varslinger'>('lån')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [isLoadingLoans, setIsLoadingLoans] = useState(true)
  const [isLoadingReservations, setIsLoadingReservations] = useState(true)
  const [isLoadingPåmeldinger, setIsLoadingPåmeldinger] = useState(true)

  // Profil-redigering
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [profilNavn, setProfilNavn] = useState('')
  const [profilEpost, setProfilEpost] = useState('')
  const [profilTelefon, setProfilTelefon] = useState('912 34 567')
  const [profilFilial, setProfilFilial] = useState('Bergen Hovedbibliotek')

  // Varslingsinnstillinger
  const [varslingskanal, setVarslingskanal] = useState<'epost' | 'sms' | 'push'>('epost')
  const [varslingstyper, setVarslingstyper] = useState({
    lånForfaller: true, reservasjonKlar: true, arrangementer: true, nyhetsbrev: false, anbefalinger: true,
  })

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message); setToastType(type)
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/min-side')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLoans(); fetchReservations(); fetchPåmeldinger()
      setProfilNavn(session?.user?.name || '')
      setProfilEpost(session?.user?.email || '')
    }
  }, [status])

  const fetchLoans = async () => {
    try { const res = await fetch('/api/laan'); if (!res.ok) throw new Error(); const data = await res.json(); if (Array.isArray(data)) setLån(data) }
    catch (e) { console.error(e) } finally { setIsLoadingLoans(false) }
  }
  const fetchReservations = async () => {
    try { const res = await fetch('/api/reservasjoner'); if (!res.ok) throw new Error(); const data = await res.json(); if (Array.isArray(data)) setReservasjoner(data) }
    catch (e) { console.error(e) } finally { setIsLoadingReservations(false) }
  }
  const fetchPåmeldinger = async () => {
    try { const res = await fetch('/api/pameldinger'); if (!res.ok) throw new Error(); const data = await res.json(); if (Array.isArray(data)) setPåmeldinger(data) }
    catch (e) { console.error(e) } finally { setIsLoadingPåmeldinger(false) }
  }

  const handleRenewLoan = async (lånId: string) => {
    try {
      const res = await fetch('/api/laan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lånId }) })
      if (res.ok) { fetchLoans(); showToast('Lånet er fornyet! ✓') } else showToast('Kunne ikke fornye', 'error')
    } catch (e) { showToast('Noe gikk galt', 'error') }
  }

  const handleAvmeld = async (id: string) => {
    if (!confirm('Avmelde fra arrangementet?')) return
    try {
      const res = await fetch(`/api/pameldinger?id=${id}`, { method: 'DELETE' })
      if (res.ok) { fetchPåmeldinger(); showToast('Avmeldt') } else showToast('Feil', 'error')
    } catch (e) { showToast('Noe gikk galt', 'error') }
  }

  const handleSaveProfile = () => {
    setShowProfileEdit(false)
    showToast('Profil oppdatert!')
  }

  const handleSaveVarslinger = () => {
    showToast(`Varslinger oppdatert — sendes via ${varslingskanal === 'epost' ? 'e-post' : varslingskanal === 'sms' ? 'SMS' : 'push'}`)
  }

  const isOverdue = (d: string) => new Date(d) < new Date()
  const handleLogout = async () => { await signOut({ callbackUrl: '/' }) }

  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="text-4xl mb-4">📚</div><p className="text-gray-600">Laster...</p></div></div>
  }

  const digitaleTjenester = [
    { id: 'biblio', navn: 'Biblio', beskrivelse: 'E-bøker og lydbøker', ikon: '📱', url: 'https://www.biblio.no', farge: 'bg-blue-500' },
    { id: 'filmoteket', navn: 'Filmoteket', beskrivelse: 'Norsk film og dokumentar', ikon: '🎬', url: 'https://www.filmoteket.no', farge: 'bg-purple-500' },
    { id: 'pressreader', navn: 'PressReader', beskrivelse: 'Aviser og magasiner', ikon: '📰', url: 'https://www.pressreader.com', farge: 'bg-red-500' },
    { id: 'bookbites', navn: 'BookBites', beskrivelse: 'Lydbøker for barn', ikon: '🎧', url: 'https://www.bookbites.no', farge: 'bg-green-500' },
    { id: 'ereolen', navn: 'eReolen', beskrivelse: 'Danske e-bøker', ikon: '📖', url: 'https://ereolen.dk', farge: 'bg-yellow-500' },
    { id: 'libby', navn: 'Libby', beskrivelse: 'Engelske e-bøker', ikon: '🌐', url: 'https://www.overdrive.com', farge: 'bg-indigo-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <main className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-[#16425b] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl">
                  {session?.user?.image ? <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" /> : <span>👤</span>}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{profilNavn || session?.user?.name}</h2>
                <p className="text-gray-600">Lånekort: {(session?.user as any)?.bibliotekkortnummer || '---'}</p>
              </div>

              <div className="mb-6">
                <QRLånekort userNumber={(session?.user as any)?.bibliotekkortnummer || '0000000000'} userName={session?.user?.name || 'Bruker'} />
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-600 mb-1">Aktive lån</div><div className="text-2xl font-bold">{lån.length}</div></div>
                <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-600 mb-1">Reservasjoner</div><div className="text-2xl font-bold">{reservasjoner.length}</div></div>
                <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-600 mb-1">Påmeldinger</div><div className="text-2xl font-bold">{påmeldinger.length}</div></div>
                <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-600 mb-1">Gebyrer</div><div className="text-2xl font-bold">0 kr</div></div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button onClick={() => setShowProfileEdit(true)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium mb-3">
                  Endre profil
                </button>
                <button onClick={handleLogout} className="w-full py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">Logg ut</button>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            <StatsGrid booksThisYear={12} eventsAttended={5} readingStreak={7} totalPages={3420} />
            <Achievements />

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-4 px-6 overflow-x-auto">
                  {([
                    { key: 'lån', label: `Mine lån (${lån.length})` },
                    { key: 'reservasjoner', label: `Reservasjoner (${reservasjoner.length})` },
                    { key: 'påmeldinger', label: `Påmeldinger (${påmeldinger.length})` },
                    { key: 'digitalt', label: '📱 Digitalt bibliotek' },
                    { key: 'varslinger', label: '🔔 Varslinger' },
                  ] as const).map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeTab === tab.key ? 'border-[#16425b] text-[#16425b]' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}>{tab.label}</button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Lån */}
                {activeTab === 'lån' && (
                  <div>
                    {isLoadingLoans ? <div className="text-center py-8 text-gray-500">Laster lån...</div>
                    : lån.length > 0 ? (
                      <div className="space-y-4">{lån.map(loan => (
                        <div key={loan.id} className={`flex items-center justify-between p-4 border rounded-lg ${isOverdue(loan.forfallsdato) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{loan.bokTittel}</h4>
                            <p className="text-sm text-gray-600">{loan.forfatter}</p>
                            <p className="text-sm text-gray-500 mt-1">📍 {loan.filial}</p>
                            <p className={`text-sm mt-1 ${isOverdue(loan.forfallsdato) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                              Forfaller: {new Date(loan.forfallsdato).toLocaleDateString('nb-NO')}{isOverdue(loan.forfallsdato) && ' ⚠️ Forfalt!'}
                            </p>
                            {loan.fornyet > 0 && <p className="text-xs text-gray-400 mt-1">Fornyet {loan.fornyet} {loan.fornyet===1?'gang':'ganger'}</p>}
                          </div>
                          <button onClick={() => handleRenewLoan(loan.id)} disabled={isOverdue(loan.forfallsdato)}
                            className="px-4 py-2 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] disabled:opacity-50 disabled:cursor-not-allowed">Forny</button>
                        </div>
                      ))}</div>
                    ) : <p className="text-gray-500 text-center py-8">Ingen aktive lån</p>}
                  </div>
                )}

                {/* Reservasjoner */}
                {activeTab === 'reservasjoner' && (
                  <div>
                    {isLoadingReservations ? <div className="text-center py-8 text-gray-500">Laster...</div>
                    : reservasjoner.length > 0 ? (
                      <div className="space-y-4">{reservasjoner.map(r => (
                        <div key={r.id} className={`flex items-center justify-between p-4 border rounded-lg ${r.klar ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold">{r.bokTittel}</h4>
                              {r.klar && <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">Klar!</span>}
                            </div>
                            <p className="text-sm text-gray-600">{r.forfatter}</p>
                            <p className="text-sm text-gray-500 mt-1">📍 {r.filial}</p>
                            {!r.klar && <p className="text-sm text-gray-500 mt-1">Kø: <strong>#{r.plassering}</strong></p>}
                          </div>
                          <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-500 hover:text-red-600">Avbestill</button>
                        </div>
                      ))}</div>
                    ) : <p className="text-gray-500 text-center py-8">Ingen reservasjoner</p>}
                  </div>
                )}

                {/* Påmeldinger */}
                {activeTab === 'påmeldinger' && (
                  <div>
                    {isLoadingPåmeldinger ? <div className="text-center py-8 text-gray-500">Laster...</div>
                    : påmeldinger.length > 0 ? (
                      <div className="space-y-4">{påmeldinger.map(p => {
                        const dato = new Date(p.arrangement.dato); const passert = dato < new Date()
                        return (
                          <div key={p.id} className={`flex items-center justify-between p-4 border rounded-lg ${passert ? 'border-gray-300 bg-gray-50' : 'border-[#16425b]/20 bg-[#16425b]/5'}`}>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold">{p.arrangement.tittel}</h4>
                                {passert && <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-full">Avholdt</span>}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{p.arrangement.kategori}</p>
                              <p className="text-sm text-gray-700">📅 {dato.toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                              <p className="text-sm text-gray-700">🕐 {p.arrangement.klokkeslett} · 📍 {p.arrangement.sted}</p>
                              <p className="text-sm text-gray-700">👥 {p.antallPersoner} {p.antallPersoner===1?'person':'personer'}</p>
                            </div>
                            {!passert && <button onClick={() => handleAvmeld(p.id)} className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-500 hover:text-red-600">Avmeld</button>}
                          </div>
                        )
                      })}</div>
                    ) : <p className="text-gray-500 text-center py-8">Ingen påmeldinger</p>}
                  </div>
                )}

                {/* Digitalt */}
                {activeTab === 'digitalt' && (
                  <div>
                    <p className="text-gray-600 mb-4">Med ditt lånekort har du gratis tilgang til disse digitale tjenestene.</p>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                      <p className="text-sm text-green-800">✅ Du er logget inn — alle tjenester er tilgjengelige</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {digitaleTjenester.map(t => (
                        <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer"
                          className="block p-4 border rounded-xl hover:border-[#16425b]/30 hover:shadow-md transition-all group">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`w-10 h-10 ${t.farge} rounded-lg flex items-center justify-center text-white text-xl`}>{t.ikon}</div>
                            <div><h4 className="font-semibold group-hover:text-[#16425b]">{t.navn}</h4><p className="text-sm text-gray-500">{t.beskrivelse}</p></div>
                          </div>
                          <p className="text-xs text-[#16425b] font-medium mt-2">Åpne med lånekort-SSO →</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Varslinger */}
                {activeTab === 'varslinger' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Varslingsinnstillinger</h3>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Foretrukket varslingskanal</label>
                      <div className="grid grid-cols-3 gap-3">
                        {([
                          { key: 'epost', label: 'E-post', icon: '📧', desc: 'Varsler på e-post' },
                          { key: 'sms', label: 'SMS', icon: '💬', desc: 'Varsler via SMS' },
                          { key: 'push', label: 'Push-varsel', icon: '🔔', desc: 'Varsler i appen' },
                        ] as const).map(k => (
                          <button key={k.key} onClick={() => setVarslingskanal(k.key)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${varslingskanal === k.key ? 'border-[#16425b] bg-[#16425b]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                            <div className="text-2xl mb-2">{k.icon}</div>
                            <div className="font-medium">{k.label}</div>
                            <div className="text-xs text-gray-500">{k.desc}</div>
                            {varslingskanal === k.key && <div className="mt-2 text-xs font-medium text-[#16425b]">✓ Valgt</div>}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Hva vil du bli varslet om?</label>
                      <div className="space-y-3">
                        {[
                          { key: 'lånForfaller', label: 'Lån som snart forfaller', desc: '3 dager før forfall' },
                          { key: 'reservasjonKlar', label: 'Reservasjon klar', desc: 'Når boken er tilgjengelig' },
                          { key: 'arrangementer', label: 'Påmeldte arrangementer', desc: 'Påminnelse dagen før' },
                          { key: 'nyhetsbrev', label: 'Nyhetsbrev', desc: 'Månedlig oppdatering' },
                          { key: 'anbefalinger', label: 'Personlige anbefalinger', desc: 'Basert på interesser' },
                        ].map(type => (
                          <label key={type.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div><div className="font-medium">{type.label}</div><div className="text-sm text-gray-500">{type.desc}</div></div>
                            <div className="relative">
                              <input type="checkbox" checked={varslingstyper[type.key as keyof typeof varslingstyper]}
                                onChange={e => setVarslingstyper(prev => ({ ...prev, [type.key]: e.target.checked }))} className="sr-only" />
                              <div className={`w-11 h-6 rounded-full transition-colors ${varslingstyper[type.key as keyof typeof varslingstyper] ? 'bg-[#16425b]' : 'bg-gray-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${varslingstyper[type.key as keyof typeof varslingstyper] ? 'ml-[22px]' : 'ml-[2px]'}`} />
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleSaveVarslinger} className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">Lagre innstillinger</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Profil-redigering modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowProfileEdit(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Rediger profil</h3>
              <button onClick={() => setShowProfileEdit(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
                <input type="text" value={profilNavn} onChange={e => setProfilNavn(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                <input type="email" value={profilEpost} onChange={e => setProfilEpost(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input type="tel" value={profilTelefon} onChange={e => setProfilTelefon(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foretrukket filial</label>
                <select value={profilFilial} onChange={e => setProfilFilial(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]">
                  <option>Bergen Hovedbibliotek</option>
                  <option>Loddefjord bibliotek</option>
                  <option>Fana bibliotek</option>
                  <option>Åsane bibliotek</option>
                  <option>Fyllingsdalen bibliotek</option>
                </select>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Lånekort: <strong>{(session?.user as any)?.bibliotekkortnummer || '---'}</strong></p>
                <p className="text-xs text-gray-500 mt-1">Kortnummer kan ikke endres. Kontakt biblioteket ved behov.</p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button onClick={() => setShowProfileEdit(false)} className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium">Avbryt</button>
              <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">Lagre endringer</button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
    </div>
  )
}
