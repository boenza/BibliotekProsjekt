'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import VarselBanner from '@/components/VarselBanner'
import ReserverModal from '@/components/ReserverModal'
import PublicHeader from '@/components/PublicHeader'

// Sjangre som matcher faktisk data i API
const GENRES = ['Alle', 'Roman', 'Sakprosa', 'Klassiker', 'Poesi']

interface Tilgjengelighet {
  filial: string
  status: string
  antall: number
}

interface Book {
  id: string
  tittel: string
  forfatter: string
  sjanger: string
  bildeUrl: string | null
  isbn: string | null
  beskrivelse: string | null
  utgitt: string | null
  språk: string[]
  formater: string[]
  tilgjengelighet: Tilgjengelighet[]
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
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailBook, setDetailBook] = useState<Book | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => { fetchBooks() }, [])

  useEffect(() => {
    const timer = setTimeout(() => { fetchBooks() }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedGenre])

  const fetchBooks = async () => {
    setIsSearching(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedGenre !== 'Alle') params.set('sjanger', selectedGenre)

      const response = await fetch(`/api/katalog?${params}`)
      if (!response.ok) throw new Error('Failed to fetch books')
      const data = await response.json()
      setBøker(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching books:', error)
      setBøker([])
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const getTotalTilgjengelig = (book: Book) => {
    if (!book.tilgjengelighet) return 0
    return book.tilgjengelighet.reduce((sum, t) => sum + t.antall, 0)
  }

  const harDigitalFormat = (book: Book) => {
    return book.formater?.some(f => f === 'E-bok' || f === 'Lydbok')
  }

  const handleReserver = (book: Book) => {
    setSelectedBook(book)
    setShowReserverModal(true)
  }

  const handleShowDetail = (book: Book) => {
    setDetailBook(book)
    setShowDetailModal(true)
  }

  const handleReservasjonSuccess = () => {
    setSuccessMessage('Reservasjon opprettet! Se den på Min side.')
    setTimeout(() => setSuccessMessage(''), 5000)
    fetchBooks()
  }

  const filteredBooks = bøker.filter(book => {
    if (showAvailableOnly && getTotalTilgjengelig(book) === 0) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <div className="container-custom py-4">
        <VarselBanner />
        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span className="font-medium">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">×</button>
          </div>
        )}
      </div>

      <main className="container-custom py-8">
        {/* Søkefelt */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl shadow-sm text-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
            placeholder="Søk etter tittel, forfatter eller ISBN..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-sm font-medium text-gray-500">Sjanger:</span>
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedGenre === genre
                  ? 'bg-[#16425b] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {genre}
            </button>
          ))}
          <div className="ml-auto">
            <label className="flex items-center space-x-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-[#16425b] rounded focus:ring-[#16425b]"
              />
              <span className="text-gray-600">Kun ledige</span>
            </label>
          </div>
        </div>

        {/* Resultat-teller */}
        <p className="text-sm text-gray-500 mb-4">
          {isSearching ? 'Søker...' : `${filteredBooks.length} treff`}
        </p>

        {/* Bokliste */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Laster katalog...</div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Ingen treff</p>
            <button onClick={() => { setSearchQuery(''); setSelectedGenre('Alle'); setShowAvailableOnly(false) }}
              className="mt-4 text-[#16425b] hover:underline text-sm">
              Nullstill søk
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBooks.map(book => {
              const tilgjengelig = getTotalTilgjengelig(book)
              const harDigital = harDigitalFormat(book)

              return (
                <div key={book.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                  onClick={() => handleShowDetail(book)}
                >
                  <div className="flex">
                    {/* Bilde/placeholder — kompakt */}
                    <div className="w-24 sm:w-32 flex-shrink-0 bg-gradient-to-br from-[#16425b] to-[#2c5f7a] flex items-center justify-center">
                      {book.bildeUrl ? (
                        <img src={book.bildeUrl} alt={book.tittel} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-3xl">📚</span>
                      )}
                    </div>

                    {/* Innhold */}
                    <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{book.tittel}</h3>
                        <p className="text-gray-600 text-sm mt-0.5">{book.forfatter}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{book.sjanger}</span>
                          {book.utgitt && <span className="text-xs text-gray-400">{book.utgitt}</span>}
                          {book.formater?.map(f => (
                            <span key={f} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              f === 'E-bok' ? 'bg-blue-50 text-blue-700' :
                              f === 'Lydbok' ? 'bg-purple-50 text-purple-700' :
                              'bg-gray-50 text-gray-600'
                            }`}>{f}</span>
                          ))}
                        </div>
                        {book.beskrivelse && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-1 hidden sm:block">{book.beskrivelse}</p>
                        )}
                      </div>

                      {/* Status + knapper */}
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-2 flex-shrink-0">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                          tilgjengelig > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {tilgjengelig > 0 ? `${tilgjengelig} ledig` : 'Utlånt'}
                        </span>

                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {tilgjengelig > 0 ? (
                            <button onClick={() => handleReserver(book)}
                              className="px-4 py-2 bg-[#16425b] text-white text-sm rounded-lg hover:bg-[#1a5270] transition-colors font-medium">
                              Bestill
                            </button>
                          ) : (
                            <button onClick={() => handleReserver(book)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors font-medium">
                              Sett i kø
                            </button>
                          )}
                          {harDigital && tilgjengelig > 0 && (
                            <Link href="/digitalt"
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium">
                              Lån digitalt
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Postvisning — Detaljmodal */}
      {showDetailModal && detailBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{detailBook.tittel}</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex gap-6 mb-6">
                {/* Bilde */}
                <div className="w-32 h-44 flex-shrink-0 bg-gradient-to-br from-[#16425b] to-[#2c5f7a] rounded-lg flex items-center justify-center">
                  {detailBook.bildeUrl ? (
                    <img src={detailBook.bildeUrl} alt={detailBook.tittel} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-white text-5xl">📚</span>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{detailBook.tittel}</h3>
                  <p className="text-lg text-gray-600 mb-3">{detailBook.forfatter}</p>
                  
                  <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
                    <div><span className="text-gray-500">Sjanger:</span> <span className="font-medium text-gray-900">{detailBook.sjanger}</span></div>
                    {detailBook.utgitt && <div><span className="text-gray-500">Utgitt:</span> <span className="font-medium text-gray-900">{detailBook.utgitt}</span></div>}
                    {detailBook.isbn && <div><span className="text-gray-500">ISBN:</span> <span className="font-mono text-gray-900">{detailBook.isbn}</span></div>}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {detailBook.formater?.map(f => (
                      <span key={f} className={`text-xs px-3 py-1 rounded-full font-medium ${
                        f === 'E-bok' ? 'bg-blue-100 text-blue-800' :
                        f === 'Lydbok' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>{f}</span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {detailBook.språk?.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded border border-gray-200">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Beskrivelse */}
              {detailBook.beskrivelse && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Om verket</h4>
                  <p className="text-gray-700 leading-relaxed">{detailBook.beskrivelse}</p>
                </div>
              )}

              {/* Tilgjengelighet per filial */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Tilgjengelighet</h4>
                <div className="space-y-2">
                  {detailBook.tilgjengelighet?.map(t => (
                    <div key={t.filial} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">📍</span>
                        <span className="text-sm font-medium text-gray-900">{t.filial}</span>
                      </div>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        t.status === 'Tilgjengelig' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.status === 'Tilgjengelig' ? `${t.antall} tilgjengelig` : 'Utlånt'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Handlinger */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => { setShowDetailModal(false); handleReserver(detailBook) }}
                  className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium">
                  {getTotalTilgjengelig(detailBook) > 0 ? 'Bestill' : 'Sett i kø'}
                </button>
                {harDigitalFormat(detailBook) && (
                  <Link href="/digitalt"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Lån digitalt
                  </Link>
                )}
                <button onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium">
                  Lukk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
