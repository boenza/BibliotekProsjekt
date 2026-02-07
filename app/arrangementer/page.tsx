'use client'

import { useState } from 'react'
import Link from 'next/link'

const CATEGORIES = ['Alle', 'Forfattermøte', 'Barn', 'Ungdom', 'Kurs', 'Konsert']

const SAMPLE_EVENTS = [
  { id: 1, title: 'Forfattermøte: Jo Nesbø', date: '2026-02-12', time: '18:00', category: 'Forfattermøte', branch: 'Hovedbiblioteket', spots: 120, registered: 98, img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=400&fit=crop' },
  { id: 2, title: 'Eventyrtime for de minste', date: '2026-02-08', time: '10:30', category: 'Barn', branch: 'Fana', spots: 25, registered: 18, img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop' },
  { id: 3, title: 'Kodeklubb for ungdom', date: '2026-02-10', time: '15:00', category: 'Ungdom', branch: 'Åsane', spots: 20, registered: 15, img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop' },
  { id: 4, title: 'Introduksjon til digital foto', date: '2026-02-14', time: '17:00', category: 'Kurs', branch: 'Loddefjord', spots: 15, registered: 8, img: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=400&fit=crop' },
]

export default function ArrangementerPage() {
  const [selectedCategory, setSelectedCategory] = useState('Alle')

  const filteredEvents = SAMPLE_EVENTS.filter(event =>
    selectedCategory === 'Alle' || event.category === selectedCategory
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
        <div className="space-y-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={event.img}
                    alt={event.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium">
                          {event.category}
                        </span>
                        <span className="text-gray-600">📍 {event.branch}</span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {event.title}
                      </h2>
                      
                      <div className="flex items-center space-x-6 text-gray-600 mb-4">
                        <span>📅 {event.date}</span>
                        <span>🕐 {event.time}</span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            {event.registered} / {event.spots} plasser opptatt
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {Math.round((event.registered / event.spots) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#10b981] h-2 rounded-full transition-all"
                            style={{ width: `${(event.registered / event.spots) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <button className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium">
                          Meld deg på
                        </button>
                        <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#16425b] transition-colors font-medium">
                          Legg til kalender
                        </button>
                        <button className="px-4 py-3 text-gray-600 hover:text-gray-900">
                          ♡ Favoritt
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Ingen arrangementer funnet</p>
          </div>
        )}
      </main>
    </div>
  )
}
