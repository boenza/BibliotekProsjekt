'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface PersonligAnbefaling {
  id: string
  tittel: string
  forfatter: string
  grunn: string
  sjanger: string
}

export default function PersonalisertSeksjon() {
  const { data: session, status } = useSession()
  const [anbefalinger, setAnbefalinger] = useState<PersonligAnbefaling[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      // Simuler personaliserte anbefalinger basert på brukerens aktivitet
      setTimeout(() => {
        setAnbefalinger([
          {
            id: 'pers-1',
            tittel: 'Fugletribunalet',
            forfatter: 'Agnes Ravatn',
            grunn: 'Fordi du reserverte «Dei sju dørene»',
            sjanger: 'Roman',
          },
          {
            id: 'pers-2',
            tittel: 'Operasjon Sjølvdisiplin',
            forfatter: 'Agnes Ravatn',
            grunn: 'Mer fra Agnes Ravatn',
            sjanger: 'Sakprosa',
          },
          {
            id: 'pers-3',
            tittel: 'Fuglane',
            forfatter: 'Tarjei Vesaas',
            grunn: 'Populær blant lesere med lignende smak',
            sjanger: 'Klassiker',
          },
          {
            id: 'pers-4',
            tittel: 'Doppler',
            forfatter: 'Erlend Loe',
            grunn: 'Anbefalt av Bergen Bibliotek',
            sjanger: 'Roman',
          },
        ])
        setIsLoading(false)
      }, 500)
    } else {
      setIsLoading(false)
    }
  }, [status])

  if (status !== 'authenticated') return null

  return (
    <section className="py-12 bg-gradient-to-br from-[#16425b]/5 to-[#2c5f7a]/5">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Anbefalt for deg, {session?.user?.name?.split(' ')[0]}
            </h2>
            <p className="text-gray-600 mt-1">Basert på dine lån og interesser</p>
          </div>
          <Link href="/katalog" className="text-[#16425b] hover:text-[#1a5270] font-medium text-sm">
            Se alle →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {anbefalinger.map(bok => (
              <div key={bok.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="h-48 bg-gradient-to-br from-[#16425b] to-[#2c5f7a] flex items-center justify-center p-6">
                  <div className="text-center text-white">
                    <div className="text-5xl mb-2">📖</div>
                    <p className="text-sm text-white/70">{bok.sjanger}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                      ✨ {bok.grunn}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-[#16425b] transition-colors">
                    {bok.tittel}
                  </h3>
                  <p className="text-sm text-gray-600">{bok.forfatter}</p>
                  <div className="mt-4 flex space-x-2">
                    <Link href={`/katalog?q=${encodeURIComponent(bok.tittel)}`}
                      className="flex-1 text-center py-2 bg-[#16425b] text-white text-sm rounded-lg hover:bg-[#1a5270] transition-colors font-medium">
                      Se i katalog
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
