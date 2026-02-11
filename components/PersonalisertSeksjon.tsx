'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Anbefaling {
  id: string
  tittel: string
  forfatter: string
  beskrivelse: string
  bildeUrl: string | null
  sjanger: string
}

/**
 * PersonalisertSeksjon — "Anbefalt for deg"
 * 
 * Vises KUN for innloggede brukere (L-8).
 * 
 * BILDER:
 * Komponenten bruker bildeUrl fra anbefalingene. For å legge til egne bilder:
 * 
 * 1. Legg bildefiler i: public/images/anbefalinger/
 * 2. Navngivning: bruk slug av tittel, f.eks:
 *    - "dei-sju-dorene.jpg"
 *    - "nordlys-i-november.jpg"
 *    - "fuglane.jpg"
 * 3. Format: JPG eller WebP, 400×600px (stående) eller 600×400px (liggende)
 * 4. Bildene refereres da som: /images/anbefalinger/dei-sju-dorene.jpg
 * 
 * Alternativt: Bruk eksterne URL-er (Unsplash, Bokkilden, etc.) i bildeUrl-feltet
 * i CMS-en under /admin/innhold/anbefalinger.
 */
export default function PersonalisertSeksjon() {
  const { data: session, status } = useSession()
  const [anbefalinger, setAnbefalinger] = useState<Anbefaling[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPersonalisert()
    } else {
      setIsLoading(false)
    }
  }, [status])

  const fetchPersonalisert = async () => {
    try {
      // Hent fra katalog — i produksjon ville dette vært personalisert basert på lånehistorikk
      const res = await fetch('/api/katalog?antall=4')
      const data = await res.json()
      if (Array.isArray(data)) {
        setAnbefalinger(data.slice(0, 4).map((bok: any) => ({
          id: bok.id,
          tittel: bok.tittel,
          forfatter: bok.forfatter,
          beskrivelse: bok.beskrivelse || '',
          bildeUrl: bok.bildeUrl || null,
          sjanger: bok.sjanger || 'Roman',
        })))
      }
    } catch (error) {
      console.error('Personalisert fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Vis ingenting for uinnloggede
  if (status !== 'authenticated' || isLoading || anbefalinger.length === 0) return null

  return (
    <section className="py-12 bg-gradient-to-r from-[#16425b]/5 to-[#2a6a8e]/5">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">✨</span>
              <h2 className="text-3xl font-bold text-gray-900">Anbefalt for deg</h2>
            </div>
            <p className="text-gray-600">
              Basert på dine interesser, {session?.user?.name?.split(' ')[0] || 'kjære låner'}
            </p>
          </div>
          <Link href="/katalog" className="text-[#16425b] hover:text-[#1a5270] font-medium">
            Se alle →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {anbefalinger.map(anbefaling => (
            <Link href={`/katalog?q=${encodeURIComponent(anbefaling.tittel)}`} key={anbefaling.id}
              className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all group border border-gray-100">
              
              {/* Bildecontainer */}
              <div className="h-52 bg-gradient-to-br from-[#16425b] to-[#2c5f7a] relative overflow-hidden">
                {anbefaling.bildeUrl ? (
                  <img
                    src={anbefaling.bildeUrl}
                    alt={anbefaling.tittel}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => {
                      // Fallback: skjul bildet og vis placeholder
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white/80">
                      <div className="text-5xl mb-2">📖</div>
                      <div className="text-sm">{anbefaling.sjanger}</div>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-amber-400 text-amber-900 text-xs rounded-full font-medium shadow-sm">
                    ✨ For deg
                  </span>
                </div>
              </div>

              {/* Tekst */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 group-hover:text-[#16425b] transition-colors line-clamp-1">
                  {anbefaling.tittel}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{anbefaling.forfatter}</p>
                {anbefaling.beskrivelse && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{anbefaling.beskrivelse}</p>
                )}
                <p className="text-sm text-[#16425b] font-medium mt-3 group-hover:underline">
                  Se i katalogen →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
