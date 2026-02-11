'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Anbefaling {
  id: string
  tittel: string
  forfatter: string | null
  beskrivelse: string
  bildeUrl: string | null
  publisert: boolean
}

export default function AnbefalingerSeksjon() {
  const [anbefalinger, setAnbefalinger] = useState<Anbefaling[]>([])
  const [selectedAnbefaling, setSelectedAnbefaling] = useState<Anbefaling | null>(null)

  useEffect(() => {
    const fetchAnbefalinger = async () => {
      try {
        const response = await fetch('/api/anbefalinger')
        const data = await response.json()
        if (Array.isArray(data)) {
          setAnbefalinger(data.filter((a: Anbefaling) => a.publisert).slice(0, 4))
        }
      } catch (error) {
        console.error('Error fetching anbefalinger:', error)
      }
    }
    fetchAnbefalinger()
  }, [])

  if (anbefalinger.length === 0) return null

  return (
    <>
      <section className="container-custom py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Våre ansatte anbefaler</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {anbefalinger.map(anbefaling => (
            <button
              key={anbefaling.id}
              onClick={() => setSelectedAnbefaling(anbefaling)}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all text-left group border border-gray-100"
            >
              {anbefaling.bildeUrl ? (
                <div className="h-40 overflow-hidden">
                  <img src={anbefaling.bildeUrl} alt={anbefaling.tittel}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-[#16425b] to-[#2c5f7a] flex items-center justify-center">
                  <span className="text-white text-4xl">📖</span>
                </div>
              )}
              <div className="p-4">
                <span className="inline-block px-2 py-0.5 bg-[#16425b]/10 text-[#16425b] rounded text-xs font-medium mb-2">Anbefaling</span>
                <h3 className="font-bold text-gray-900 leading-tight group-hover:text-[#16425b] transition-colors">{anbefaling.tittel}</h3>
                {anbefaling.forfatter && <p className="text-gray-500 text-sm mt-1">{anbefaling.forfatter}</p>}
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{anbefaling.beskrivelse}</p>
                <span className="text-[#16425b] text-sm font-medium mt-3 inline-block group-hover:underline">Les mer →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Detaljmodal */}
      {selectedAnbefaling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAnbefaling(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {selectedAnbefaling.bildeUrl && (
              <div className="h-56 overflow-hidden rounded-t-2xl">
                <img src={selectedAnbefaling.bildeUrl} alt={selectedAnbefaling.tittel} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-8">
              <span className="inline-block px-3 py-1 bg-[#16425b]/10 text-[#16425b] rounded-full text-sm font-medium mb-3">⭐ Anbefaling fra biblioteket</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedAnbefaling.tittel}</h2>
              {selectedAnbefaling.forfatter && (
                <p className="text-lg text-gray-600 mb-4">{selectedAnbefaling.forfatter}</p>
              )}
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedAnbefaling.beskrivelse}</p>

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <Link href={`/katalog?q=${encodeURIComponent(selectedAnbefaling.tittel)}`}
                  className="px-5 py-2.5 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium text-sm">
                  Finn i samlingen
                </Link>
                <button onClick={() => setSelectedAnbefaling(null)}
                  className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium text-sm">
                  Lukk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
