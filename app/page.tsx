'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import VarselBanner from '@/components/VarselBanner'

interface Arrangement {
  id: string
  tittel: string
  dato: string
  klokkeslett: string
  kategori: string
}

export default function HomePage() {
  const [kommendeArrangementer, setKommendeArrangementer] = useState<Arrangement[]>([])

  useEffect(() => {
    fetchKommendeArrangementer()
  }, [])

  const fetchKommendeArrangementer = async () => {
    try {
      const response = await fetch('/api/arrangementer')
      const data = await response.json()
      
      if (Array.isArray(data)) {
        // Vis kun de 3 neste arrangementene
        setKommendeArrangementer(data.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching arrangementer:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-[#16425b] text-white">
        <div className="container-custom">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-3xl">📚</span>
              <div>
                <h1 className="text-2xl font-bold">Bergen Bibliotek</h1>
                <p className="text-xs text-white/70">Felles Formidlingsløsning</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="hover:text-white/80 transition-colors font-medium">
                Hjem
              </Link>
              <Link href="/katalog" className="hover:text-white/80 transition-colors">
                Katalog
              </Link>
              <Link href="/digitalt" className="hover:text-white/80 transition-colors">
                Digitalt innhold
              </Link>
              <Link href="/arrangementer" className="hover:text-white/80 transition-colors">
                Arrangementer
              </Link>
              <Link 
                href="/min-side" 
                className="bg-white text-[#16425b] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Min side
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Varsler */}
      <div className="container-custom py-4">
        <VarselBanner />
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#16425b] to-[#2d6a8e] text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h2 className="text-5xl font-bold mb-6">
              Velkommen til Bergen Bibliotek
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Utforsk tusenvis av bøker, e-bøker, lydbøker og filmer. 
              Delta på arrangementer og oppdag nye favoritter.
            </p>
            <div className="flex items-center space-x-4">
              <Link 
                href="/katalog"
                className="bg-white text-[#16425b] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                Søk i katalogen
              </Link>
              <Link 
                href="/digitalt"
                className="bg-[#8b5cf6] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#7c3aed] transition-colors"
              >
                Digitalt innhold
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="container-custom py-12">
        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Link 
            href="/katalog"
            className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow group"
          >
            <div className="text-5xl mb-4">📖</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#16425b] transition-colors">
              Søk i katalogen
            </h3>
            <p className="text-gray-600">
              Finn bøker, tidsskrifter og mer i vår samling
            </p>
          </Link>

          <Link 
            href="/digitalt"
            className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow group"
          >
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#8b5cf6] transition-colors">
              Digitalt innhold
            </h3>
            <p className="text-gray-600">
              E-bøker, lydbøker og streaming helt gratis
            </p>
          </Link>

          <Link 
            href="/arrangementer"
            className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition-shadow group"
          >
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#10b981] transition-colors">
              Arrangementer
            </h3>
            <p className="text-gray-600">
              Forfattermøter, kurs og aktiviteter for alle
            </p>
          </Link>
        </div>

        {/* Kommende Arrangementer */}
        {kommendeArrangementer.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold text-gray-900">Kommende arrangementer</h3>
              <Link href="/arrangementer" className="text-[#16425b] hover:underline font-medium">
                Se alle →
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {kommendeArrangementer.map(arr => (
                <div key={arr.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
                  <span className="inline-block px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium mb-3">
                    {arr.kategori}
                  </span>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {arr.tittel}
                  </h4>
                  <div className="text-gray-600 text-sm space-y-1">
                    <p>📅 {new Date(arr.dato).toLocaleDateString('nb-NO', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p>🕐 {arr.klokkeslett}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Info Boxes */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">Åpningstider</h3>
            <div className="space-y-2 text-blue-800">
              <div className="flex justify-between">
                <span>Mandag - Fredag:</span>
                <span className="font-medium">10:00 - 20:00</span>
              </div>
              <div className="flex justify-between">
                <span>Lørdag:</span>
                <span className="font-medium">10:00 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span>Søndag:</span>
                <span className="font-medium">Stengt</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-8 border border-green-200">
            <h3 className="text-2xl font-bold text-green-900 mb-4">Bli medlem</h3>
            <p className="text-green-800 mb-4">
              Det er gratis å bli medlem ved Bergen Bibliotek. Med lånekort får du tilgang til:
            </p>
            <ul className="space-y-2 text-green-800">
              <li>✓ Låne bøker og andre medier</li>
              <li>✓ E-bøker og lydbøker via Biblio</li>
              <li>✓ Streaming på Filmoteket</li>
              <li>✓ Påmelding til arrangementer</li>
            </ul>
            <Link 
              href="/login"
              className="mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Bli medlem nå
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Bergen Bibliotek</h4>
              <p className="text-gray-400 text-sm">
                Felles Formidlingsløsning<br />
                Strømgaten 6<br />
                5015 Bergen
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Kontakt</h4>
              <p className="text-gray-400 text-sm">
                Telefon: 55 56 85 60<br />
                E-post: post@bergen.bibliotek.no
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">For ansatte</h4>
              <Link 
                href="/admin" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                → CMS/Admin innlogging
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© 2026 Bergen Bibliotek • Built with Next.js 16, React 19, TypeScript & Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

