'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PåmeldingModal from '@/components/PåmeldingModal'

const CATEGORIES = ['Alle', 'Forfattermøte', 'Barn', 'Ungdom', 'Kurs', 'Konsert', 'Bokklubb']

interface Arrangement {
  id: string
  tittel: string
  beskrivelse: string
  dato: string
  klokkeslett: string
  sted: string
  kategori: string
  bildeUrl: string | null
  kapasitet: number
  påmeldte: number
  publisert: boolean
}

export default function ArrangementerPage() {
  const [selectedCategory, setSelectedCategory] = useState('Alle')
  const [arrangementer, setArrangementer] = useState<Arrangement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedArrangement, setSelectedArrangement] = useState<Arrangement | null>(null)
  const [showPåmeldingModal, setShowPåmeldingModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchArrangementer()
  }, [])

  const fetchArrangementer = async () => {
    try {
      const response = await fetch('/api/arrangementer')
      
      if (!response.ok) {
        throw new Error('Failed to fetch arrangementer')
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setArrangementer(data)
      } else {
        setArrangementer([])
      }
    } catch (error) {
      console.error('Error fetching arrangementer:', error)
      setArrangementer([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleMeldPå = (arrangement: Arrangement) => {
    setSelectedArrangement(arrangement)
    setShowPåmeldingModal(true)
  }

  const handlePåmeldingSuccess = () => {
    setSuccessMessage('Du er nå påmeldt! Se påmeldinger på Min side.')
    setTimeout(() => setSuccessMessage(''), 5000)
    
    // Refresh arrangementer for å oppdatere påmeldte-count
    fetchArrangementer()
  }

  const filteredEvents = arrangementer.filter(event =>
    event.publisert && (selectedCategory === 'Alle' || event.kategori === selectedCategory)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#16425b] text-white py-6">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Bergen Bibliotek</h1>
              <p className="text-white/80 mt-1">Arrangementer</p>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="hover:text-white/80">Hjem</Link>
              <Link href="/katalog" className="hover:text-white/80">Katalog</Link>
              <Link href="/arrangementer" className="font-semibold">Arrangementer</Link>
              <Link href="/min-side" className="hover:text-white/80">Min side</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container-custom py-12">
        {/* Success message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✓</span>
              <span className="font-medium">{successMessage}</span>
            </div>
            <button 
              onClick={() => setSuccessMessage('')}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Category filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">Kategori:</span>
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#16425b] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Events list */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Laster arrangementer...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {selectedCategory === 'Alle' 
                ? 'Ingen kommende arrangementer.'
                : `Ingen arrangementer i kategorien "${selectedCategory}".`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map(event => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="md:flex">
                  {event.bildeUrl && (
                    <div className="md:w-1/3">
                      <img
                        src={event.bildeUrl}
                        alt={event.tittel}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                  )}
                  <div className={event.bildeUrl ? 'md:w-2/3 p-6' : 'w-full p-6'}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium">
                            {event.kategori}
                          </span>
                          <span className="text-gray-600">📍 {event.sted}</span>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {event.tittel}
                        </h2>
                        
                        <div className="flex items-center space-x-6 text-gray-600 mb-4">
                          <span>📅 {new Date(event.dato).toLocaleDateString('nb-NO')}</span>
                          <span>🕐 {event.klokkeslett}</span>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {event.beskrivelse}
                        </p>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              {event.påmeldte} / {event.kapasitet} plasser opptatt
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {event.kapasitet > 0 ? Math.round((event.påmeldte / event.kapasitet) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${event.kapasitet > 0 ? (event.påmeldte / event.kapasitet) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-4">
                      <button 
                        onClick={() => handleMeldPå(event)}
                        disabled={event.påmeldte >= event.kapasitet}
                        className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {event.påmeldte >= event.kapasitet ? 'Fullt' : 'Meld deg på'}
                      </button>
                      <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                        Les mer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Påmelding Modal */}
      {selectedArrangement && (
        <PåmeldingModal
          isOpen={showPåmeldingModal}
          onClose={() => setShowPåmeldingModal(false)}
          arrangement={selectedArrangement}
          onSuccess={handlePåmeldingSuccess}
        />
      )}
    </div>
  )
}
