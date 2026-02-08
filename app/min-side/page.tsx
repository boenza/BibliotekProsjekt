'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Loan {
  id: string
  bokTittel: string
  forfatter: string
  utlånt: string
  forfallsdato: string
  filial: string
  fornyet: number
}

interface Reservation {
  id: string
  bokTittel: string
  forfatter: string
  plassering: number
  filial: string
  klar: boolean
}

interface Påmelding {
  id: string
  arrangementId: string
  navn: string
  epost: string
  antallPersoner: number
  kommentar: string | null
  påmeldt: string
  arrangement: {
    id: string
    tittel: string
    beskrivelse: string
    dato: string
    klokkeslett: string
    sted: string
    kategori: string
  }
}

export default function MinSidePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lån, setLån] = useState<Loan[]>([])
  const [reservasjoner, setReservasjoner] = useState<Reservation[]>([])
  const [påmeldinger, setPåmeldinger] = useState<Påmelding[]>([])
  const [isLoadingLoans, setIsLoadingLoans] = useState(true)
  const [isLoadingReservations, setIsLoadingReservations] = useState(true)
  const [isLoadingPåmeldinger, setIsLoadingPåmeldinger] = useState(true)

  // Redirect til login hvis ikke innlogget
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/min-side')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLoans()
      fetchReservations()
      fetchPåmeldinger()
    }
  }, [status])

  const fetchLoans = async () => {
    try {
      const response = await fetch('/api/laan')
      
      if (!response.ok) {
        throw new Error('Failed to fetch loans')
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setLån(data)
      }
    } catch (error) {
      console.error('Error fetching loans:', error)
    } finally {
      setIsLoadingLoans(false)
    }
  }

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservasjoner')
      
      if (!response.ok) {
        throw new Error('Failed to fetch reservations')
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setReservasjoner(data)
      }
    } catch (error) {
      console.error('Error fetching reservations:', error)
    } finally {
      setIsLoadingReservations(false)
    }
  }

  const fetchPåmeldinger = async () => {
    try {
      const response = await fetch('/api/pameldinger')
      
      if (!response.ok) {
        throw new Error('Failed to fetch påmeldinger')
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setPåmeldinger(data)
      }
    } catch (error) {
      console.error('Error fetching påmeldinger:', error)
    } finally {
      setIsLoadingPåmeldinger(false)
    }
  }

  const handleRenewLoan = async (lånId: string) => {
    try {
      const response = await fetch('/api/laan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lånId })
      })

      if (response.ok) {
        // Refresh loans list
        fetchLoans()
        alert('Lån fornyet!')
      } else {
        alert('Kunne ikke fornye lån')
      }
    } catch (error) {
      console.error('Error renewing loan:', error)
      alert('Noe gikk galt')
    }
  }

  const handleAvmeld = async (påmeldingId: string) => {
    if (!confirm('Er du sikker på at du vil avmelde deg fra dette arrangementet?')) {
      return
    }

    try {
      const response = await fetch(`/api/pameldinger?id=${påmeldingId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh påmeldinger list
        fetchPåmeldinger()
        alert('Du er nå avmeldt')
      } else {
        alert('Kunne ikke avmelde')
      }
    } catch (error) {
      console.error('Error canceling påmelding:', error)
      alert('Noe gikk galt')
    }
  }

  const isOverdue = (forfallsdato: string) => {
    return new Date(forfallsdato) < new Date()
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Vis loading mens autentisering sjekkes
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-600">Laster...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#16425b] text-white py-6">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Bergen Bibliotek</h1>
              <p className="text-white/80 mt-1">Min side</p>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="hover:text-white/80">Hjem</Link>
              <Link href="/katalog" className="hover:text-white/80">Katalog</Link>
              <Link href="/arrangementer" className="hover:text-white/80">Arrangementer</Link>
              <Link href="/min-side" className="font-semibold">Min side</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-[#16425b] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt={session.user.name || ''} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{session?.user?.name}</h2>
                <p className="text-gray-600">
                  Lånekort: {(session?.user as any)?.bibliotekkortnummer || '---'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Aktive lån</div>
                  <div className="text-2xl font-bold text-gray-900">{lån.length}</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Reservasjoner</div>
                  <div className="text-2xl font-bold text-gray-900">{reservasjoner.length}</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Påmeldinger</div>
                  <div className="text-2xl font-bold text-gray-900">{påmeldinger.length}</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Gebyrer</div>
                  <div className="text-2xl font-bold text-gray-900">0 kr</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium mb-3">
                  Endre profil
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  Logg ut
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Loans */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mine lån</h3>
              
              {isLoadingLoans ? (
                <div className="text-center py-8 text-gray-500">
                  Laster lån...
                </div>
              ) : lån.length > 0 ? (
                <div className="space-y-4">
                  {lån.map(loan => (
                    <div key={loan.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                      isOverdue(loan.forfallsdato) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{loan.bokTittel}</h4>
                        <p className="text-sm text-gray-600">{loan.forfatter}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {loan.filial}
                        </p>
                        <p className={`text-sm mt-1 ${
                          isOverdue(loan.forfallsdato) ? 'text-red-600 font-medium' : 'text-gray-500'
                        }`}>
                          Forfaller: {new Date(loan.forfallsdato).toLocaleDateString('nb-NO')}
                          {isOverdue(loan.forfallsdato) && ' ⚠️ Forfalt!'}
                        </p>
                        {loan.fornyet > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Fornyet {loan.fornyet} {loan.fornyet === 1 ? 'gang' : 'ganger'}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleRenewLoan(loan.id)}
                          disabled={isOverdue(loan.forfallsdato)}
                          className="px-4 py-2 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Forny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Ingen aktive lån</p>
              )}
            </div>

            {/* Reservations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mine reservasjoner</h3>
              
              {isLoadingReservations ? (
                <div className="text-center py-8 text-gray-500">
                  Laster reservasjoner...
                </div>
              ) : reservasjoner.length > 0 ? (
                <div className="space-y-4">
                  {reservasjoner.map(reservation => (
                    <div key={reservation.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                      reservation.klar ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{reservation.bokTittel}</h4>
                          {reservation.klar && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                              Klar!
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{reservation.forfatter}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {reservation.filial}
                        </p>
                        {!reservation.klar && (
                          <p className="text-sm text-gray-500 mt-1">
                            Plassering i kø: <strong>#{reservation.plassering}</strong>
                          </p>
                        )}
                      </div>
                      <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors">
                        Avbestill
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Ingen aktive reservasjoner</p>
              )}
            </div>

            {/* Påmeldinger */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mine påmeldinger</h3>
              
              {isLoadingPåmeldinger ? (
                <div className="text-center py-8 text-gray-500">
                  Laster påmeldinger...
                </div>
              ) : påmeldinger.length > 0 ? (
                <div className="space-y-4">
                  {påmeldinger.map(påmelding => {
                    const arrangementDato = new Date(påmelding.arrangement.dato)
                    const erPassert = arrangementDato < new Date()
                    
                    return (
                      <div key={påmelding.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                        erPassert ? 'border-gray-300 bg-gray-50' : 'border-[#16425b]/20 bg-[#16425b]/5'
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{påmelding.arrangement.tittel}</h4>
                            {erPassert && (
                              <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-full font-medium">
                                Avholdt
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{påmelding.arrangement.kategori}</p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700">
                              📅 {arrangementDato.toLocaleDateString('nb-NO', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-gray-700">
                              🕐 {påmelding.arrangement.klokkeslett}
                            </p>
                            <p className="text-sm text-gray-700">
                              📍 {påmelding.arrangement.sted}
                            </p>
                            <p className="text-sm text-gray-700">
                              👥 {påmelding.antallPersoner} {påmelding.antallPersoner === 1 ? 'person' : 'personer'}
                            </p>
                          </div>
                          {påmelding.kommentar && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                              Kommentar: {påmelding.kommentar}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Påmeldt: {new Date(påmelding.påmeldt).toLocaleDateString('nb-NO')}
                          </p>
                        </div>
                        {!erPassert && (
                          <button 
                            onClick={() => handleAvmeld(påmelding.id)}
                            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors"
                          >
                            Avmeld
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Ingen aktive påmeldinger</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
