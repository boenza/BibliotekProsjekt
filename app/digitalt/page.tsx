'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import VarselBanner from '@/components/VarselBanner'
import PublicHeader from '@/components/PublicHeader'

type TabType = 'ebøker' | 'lydbøker' | 'film'

interface DigitalItem {
  id: string
  tittel: string
  forfatter?: string
  regissør?: string | null
  type: string
  coverUrl: string | null
  beskrivelse: string | null
  utgivelsesår: number | null
  sjanger: string
  tilgjengelig: boolean
  leverandør: string
  lenkeTilInnhold: string
  varighet?: string | null
}

export default function DigitaltInnholdPage() {
  const { status } = useSession()
  const isLoggedIn = status === 'authenticated'
  const [activeTab, setActiveTab] = useState<TabType>('ebøker')
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<DigitalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchContent() }, [activeTab, searchQuery])

  const fetchContent = async () => {
    setIsLoading(true)
    try {
      let url = '/api/digitalt?'
      if (activeTab === 'ebøker') url += 'type=books&subType=ebok'
      else if (activeTab === 'lydbøker') url += 'type=books&subType=lydbok'
      else if (activeTab === 'film') url += 'type=films'
      if (searchQuery) url += `&søk=${encodeURIComponent(searchQuery)}`

      const response = await fetch(url)
      const data = await response.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching digital content:', error)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const getTabIcon = (tab: TabType) => {
    switch (tab) { case 'ebøker': return '📖'; case 'lydbøker': return '🎧'; case 'film': return '🎬' }
  }

  const getProviderName = (provider: string) => {
    switch (provider) { case 'biblio': return 'Biblio'; case 'filmoteket': return 'Filmoteket'; default: return provider }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <div className="container-custom py-4"><VarselBanner /></div>

      <main className="container-custom py-8">
        {/* Login-banner — vises KUN når brukeren IKKE er innlogget */}
        {!isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <span className="text-4xl">ℹ️</span>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-2">Tilgang til digitalt innhold</h3>
                <p className="text-blue-800 text-sm mb-3">
                  Alt digitalt innhold er gratis for lånekortinnehavere ved Bergen Offentlige Bibliotek. 
                  Logg inn med ditt lånekort for å få tilgang til tusenvis av e-bøker, lydbøker og filmer.
                </p>
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Logg inn med lånekort
                  </Link>
                  <a href="#" className="text-blue-700 hover:underline text-sm font-medium">Ikke lånekort? Bli medlem her →</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Innlogget-banner */}
        {isLoggedIn && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center space-x-3">
            <span className="text-xl">✅</span>
            <p className="text-green-800 text-sm font-medium">Du er innlogget — alle digitale tjenester er tilgjengelige med ett klikk.</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-6 border-b border-gray-200">
          {(['ebøker', 'lydbøker', 'film'] as TabType[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab ? 'text-[#16425b] border-[#16425b]' : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}>
              <span className="mr-2">{getTabIcon(tab)}</span>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <p className="text-gray-600">{isLoading ? 'Søker...' : <><strong>{items.length}</strong> {activeTab}</>}</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Laster innhold...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Ingen resultater funnet</p>
            <button onClick={() => setSearchQuery('')} className="mt-4 text-[#16425b] hover:underline">Nullstill søk</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[2/3] relative bg-gradient-to-br from-[#16425b] to-[#2c5f7a] flex items-center justify-center">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt={item.tittel} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-6xl">{getTabIcon(activeTab)}</span>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                    {getProviderName(item.leverandør)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{item.tittel}</h3>
                  <p className="text-gray-600 text-sm mb-2">{item.forfatter || item.regissør}</p>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{item.sjanger}</span>
                    {item.utgivelsesår && <span className="text-xs text-gray-500">{item.utgivelsesår}</span>}
                  </div>
                  {item.varighet && <p className="text-xs text-gray-500 mb-3">⏱️ {item.varighet}</p>}
                  {item.beskrivelse && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.beskrivelse}</p>}
                  <a href={item.lenkeTilInnhold} target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center bg-[#16425b] text-white py-2 rounded-lg hover:bg-[#1a5270] transition-colors font-medium">
                    {activeTab === 'film' ? 'Se nå' : 'Les/lytt nå'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info om tjenestene */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">📚</span>
              <h3 className="text-xl font-bold text-gray-900">Biblio</h3>
            </div>
            <p className="text-gray-600 mb-4">Tilgang til tusenvis av norske og internasjonale e-bøker og lydbøker. Lån direkte til din enhet og les/lytt offline.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Ubegrenset utlån</li><li>✓ Les på mobil, nettbrett eller PC</li>
              <li>✓ Automatisk retur etter låneperioden</li><li>✓ Ingen forsinkelsesgebyrer</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">🎬</span>
              <h3 className="text-xl font-bold text-gray-900">Filmoteket</h3>
            </div>
            <p className="text-gray-600 mb-4">Stream norske og internasjonale filmer og serier. Stort utvalg av klassikere og nye utgivelser.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ HD-kvalitet streaming</li><li>✓ Norsk film og TV-serier</li>
              <li>✓ Dokumentarer og barneprogrammer</li><li>✓ Ingen ekstra kostnader</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
