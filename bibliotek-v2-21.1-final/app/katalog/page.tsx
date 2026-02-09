'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import VarselBanner from '@/components/VarselBanner'
import ReserverModal from '@/components/ReserverModal'
import PublicHeader from '@/components/PublicHeader'

const GENRES = ['Alle', 'Skjønnlitteratur', 'Krim', 'Fantasy', 'Fakta', 'Barn', 'Ungdom']

interface Book {
  id: string
  tittel: string
  forfatter: string
  sjanger: string
  bildeUrl: string | null
  tilgjengelig: number
  antallEks: number
  isbn: string | null
  beskrivelse: string | null
}

export default function KatalogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Alle')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [bøker, setBøker] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showReserverModal, setShowReserverModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Initial load
  useEffect(() => {
    fetchBooks()
  }, [])

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || selectedGenre !== 'Alle') {
        fetchBooks()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedGenre])

  const fetchBooks = async () => {
    setIsSearching(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedGenre !== 'Alle') params.set('sjanger', selectedGenre)

      const response = await fetch(`/api/katalog?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch books')
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setBøker(data)
      } else {
        setBøker([])
      }
    } catch (error) {
      console.error('Error fetching books:', error)
      setBøker([])
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const handleReserver = (book: Book) => {
    setSelectedBook(book)
    setShowReserverModal(true)
  }

  const handleReservasjonSuccess = () => {
    setSuccessMessage('Bok reservert! Se reservasjon på Min side.')
    setTimeout(() => setSuccessMessage(''), 5000)
    
    // Refresh books for å oppdatere tilgjengelighet
    fetchBooks()
  }

  const filteredBooks = bøker.filter(book => {
    const matchesAvailability = !showAvailableOnly || book.tilgjengelig > 0
    return matchesAvailability
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PublicHeader />

      {/* Varsler */}
      <div className="container-custom py-4">
        <VarselBanner />
        
        {/* Success message */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center justify-between">
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
      </div>

      <main className="container-custom py-12">
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
            {isSearching ? (
              'Søker...'
            ) : (
              <>Viser <strong>{filteredBooks.length}</strong> {filteredBooks.length === bøker.length ? '' : `av ${bøker.length}`} bøker</>
            )}
          </p>
        </div>

        {/* Books grid */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Laster katalog...
          </div>
        ) : filteredBooks.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <div key={book.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[2/3] relative">
                  {book.bildeUrl ? (
                    <img
                      src={book.bildeUrl}
                      alt={book.tittel}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#16425b] to-[#2c5f7a] flex items-center justify-center">
                      <span className="text-white text-6xl">📚</span>
                    </div>
                  )}
                  {book.tilgjengelig === 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Utlånt
                    </div>
                  )}
                  {book.tilgjengelig > 0 && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {book.tilgjengelig} ledig{book.tilgjengelig > 1 ? 'e' : ''}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                    {book.tittel}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{book.forfatter}</p>
                  
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {book.sjanger}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {book.tilgjengelig > 0 ? (
                      <button 
                        onClick={() => handleReserver(book)}
                        className="flex-1 bg-[#16425b] text-white py-2 rounded-lg hover:bg-[#1a5270] transition-colors font-medium"
                      >
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
        )}
      </main>

      {/* Reserver Modal */}
      {selectedBook && (
        <ReserverModal
          isOpen={showReserverModal}
          onClose={() => setShowReserverModal(false)}
          bok={{
            id: selectedBook.id,
            tittel: selectedBook.tittel,
            forfatter: selectedBook.forfatter,
            isbn: selectedBook.isbn || '',
            coverUrl: selectedBook.bildeUrl || undefined
          }}
          onSuccess={handleReservasjonSuccess}
        />
      )}
    </div>
  )
}
