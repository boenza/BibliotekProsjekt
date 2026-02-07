'use client'

import { useState } from 'react'
import Link from 'next/link'

const GENRES = ['Alle', 'Skjønnlitteratur', 'Krim', 'Fantasy', 'Fakta', 'Barn', 'Ungdom']

const SAMPLE_BOOKS = [
  { id: 1, title: 'Nordlys i november', author: 'Maja Lunde', genre: 'Skjønnlitteratur', rating: 4.8, available: true, cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop' },
  { id: 2, title: 'Bror din på prærien', author: 'Torvald Sund', genre: 'Skjønnlitteratur', rating: 4.2, available: false, cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop' },
  { id: 3, title: 'Vinterhav', author: 'Helene Uri', genre: 'Krim', rating: 4.6, available: true, cover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=450&fit=crop' },
  { id: 4, title: 'Det norske folket', author: 'Knut Hamsun', genre: 'Fakta', rating: 4.4, available: true, cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop' },
  { id: 5, title: 'Eventyrbok for barn', author: 'Astrid Lindgren', genre: 'Barn', rating: 4.9, available: true, cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=450&fit=crop' },
  { id: 6, title: 'Ungdom i opprør', author: 'Suzanne Collins', genre: 'Ungdom', rating: 4.5, available: false, cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=450&fit=crop' },
]

export default function KatalogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Alle')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  const filteredBooks = SAMPLE_BOOKS.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'Alle' || book.genre === selectedGenre
    const matchesAvailability = !showAvailableOnly || book.available
    return matchesSearch && matchesGenre && matchesAvailability
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#16425b] text-white py-6">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Bergen Bibliotek</h1>
              <p className="text-white/80 mt-1">Søk i vår samling</p>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="hover:text-white/80">Hjem</Link>
              <Link href="/katalog" className="font-semibold">Katalog</Link>
              <Link href="/arrangementer" className="hover:text-white/80">Arrangementer</Link>
              <Link href="/min-side" className="hover:text-white/80">Min side</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container-custom py-12">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <input
            type="text"
            placeholder="Søk etter tittel, forfatter eller ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-[#16425b] focus:ring-2 focus:ring-[#16425b]/20 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-700">Sjanger:</span>
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedGenre === genre
                      ? 'bg-[#16425b] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="w-5 h-5 text-[#16425b] rounded focus:ring-[#16425b]"
              />
              <span className="text-gray-700">Vis kun ledige</span>
            </label>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Viser <strong>{filteredBooks.length}</strong> av {SAMPLE_BOOKS.length} bøker
          </p>
        </div>

        {/* Books grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <div key={book.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[2/3] relative">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                {!book.available && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Utlånt
                  </div>
                )}
                {book.available && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Ledig
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      {i < Math.floor(book.rating) ? '★' : '☆'}
                    </span>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">{book.rating}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {book.available ? (
                    <button className="flex-1 bg-[#16425b] text-white py-2 rounded-lg hover:bg-[#1a5270] transition-colors font-medium">
                      Reserver
                    </button>
                  ) : (
                    <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                      Se kø
                    </button>
                  )}
                  <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-[#16425b] transition-colors">
                    ♡
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Ingen bøker funnet</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedGenre('Alle')
                setShowAvailableOnly(false)
              }}
              className="mt-4 text-[#16425b] hover:underline"
            >
              Nullstill søk
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
