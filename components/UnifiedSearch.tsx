'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchResult {
  physical: Array<{
    id: string
    type: string
    title: string
    author: string
    genre: string
    available: boolean
    location: string
  }>
  digital: Array<{
    id: string
    type: string
    title: string
    author: string | null
    subtype: string
    provider: string
    location: string
  }>
  events: Array<{
    id: string
    type: string
    title: string
    category: string
    date: string
    time: string
    location: string
  }>
}

interface UnifiedSearchProps {
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

export default function UnifiedSearch({ 
  placeholder = "Søk etter bøker, e-bøker, filmer, arrangementer...", 
  autoFocus = false,
  className = ""
}: UnifiedSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults(null)
      setIsOpen(false)
      return
    }

    const debounce = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results)
        setIsOpen(true)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [query])

  const getIcon = (type: string) => {
    switch (type) {
      case 'physical_book': return '📚'
      case 'digital_book': return '📖'
      case 'digital_film': return '🎬'
      case 'event': return '📅'
      default: return '📄'
    }
  }

  const getTypeLabel = (item: any) => {
    if (item.type === 'digital_book') {
      return item.subtype === 'ebok' ? 'E-bok' : 'Lydbok'
    }
    if (item.type === 'digital_film') {
      return item.subtype === 'film' ? 'Film' : 'Serie'
    }
    if (item.type === 'physical_book') {
      return 'Bok'
    }
    return 'Arrangement'
  }

  const totalResults = results 
    ? results.physical.length + results.digital.length + results.events.length
    : 0

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:bg-white/20 focus:border-white/40 focus:outline-none placeholder-white/50 text-base font-medium transition-all"
          style={{ color: 'white' }}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#16425b]"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results && totalResults > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[500px] overflow-y-auto z-50">
          {/* Physical Books */}
          {results.physical.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Fysisk samling ({results.physical.length})
              </h3>
              {results.physical.map((item) => (
                <Link
                  key={item.id}
                  href={`/katalog?id=${item.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-2xl">{getIcon(item.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{item.title}</div>
                    <div className="text-sm text-gray-600 truncate">{item.author}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                        {item.genre}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.available 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.available ? 'Ledig' : 'Utlånt'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Digital Content */}
          {results.digital.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Digitalt innhold ({results.digital.length})
              </h3>
              {results.digital.map((item) => (
                <Link
                  key={item.id}
                  href={`/digitalt?id=${item.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-2xl">{getIcon(item.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{item.title}</div>
                    {item.author && (
                      <div className="text-sm text-gray-600 truncate">{item.author}</div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                        {getTypeLabel(item)}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {item.provider === 'biblio' ? 'Biblio' : 'Filmoteket'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Events */}
          {results.events.length > 0 && (
            <div className="p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Arrangementer ({results.events.length})
              </h3>
              {results.events.map((item) => (
                <Link
                  key={item.id}
                  href={`/arrangementer?id=${item.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-2xl">{getIcon(item.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{item.title}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString('nb-NO')} kl {item.time}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        📍 {item.location}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="p-3 bg-gray-50 text-center text-sm text-gray-600 border-t border-gray-100">
            Viser {totalResults} resultater for "{query}"
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && results && totalResults === 0 && query.length >= 2 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 p-6 text-center z-50">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-600">Ingen resultater for "{query}"</p>
          <p className="text-sm text-gray-500 mt-1">Prøv et annet søkeord</p>
        </div>
      )}
    </div>
  )
}
