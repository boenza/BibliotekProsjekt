'use client'

import { useState, useEffect } from 'react'

interface Arrangement { id: string; tittel: string; beskrivelse: string; dato: string; klokkeslett: string; sted: string; kategori: string }
interface Anbefaling { id: string; tittel: string; forfatter: string | null; beskrivelse: string; bildeUrl: string | null }

export default function InfoskjermPage() {
  const [arrangementer, setArrangementer] = useState<Arrangement[]>([])
  const [anbefalinger, setAnbefalinger] = useState<Anbefaling[]>([])
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [visningsModus, setVisningsModus] = useState<'arrangementer' | 'anbefalinger' | 'kombinert'>('kombinert')
  const [rotasjonstid, setRotasjonstid] = useState(10)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetchContent()
  }, [])

  // Auto-rotasjon i fullskjerm
  useEffect(() => {
    if (!showFullscreen) return
    const slides = getSlides()
    if (slides.length <= 1) return
    
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, rotasjonstid * 1000)
    
    return () => clearInterval(timer)
  }, [showFullscreen, rotasjonstid, arrangementer, anbefalinger, visningsModus])

  const fetchContent = async () => {
    try {
      const [arrRes, anbRes] = await Promise.all([
        fetch('/api/arrangementer'),
        fetch('/api/anbefalinger')
      ])
      const arrData = await arrRes.json()
      const anbData = await anbRes.json()
      if (Array.isArray(arrData)) setArrangementer(arrData)
      if (Array.isArray(anbData)) setAnbefalinger(anbData)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getSlides = () => {
    const slides: { type: string; data: any }[] = []
    if (visningsModus === 'arrangementer' || visningsModus === 'kombinert') {
      arrangementer.forEach(a => slides.push({ type: 'arrangement', data: a }))
    }
    if (visningsModus === 'anbefalinger' || visningsModus === 'kombinert') {
      anbefalinger.forEach(a => slides.push({ type: 'anbefaling', data: a }))
    }
    return slides
  }

  const slides = getSlides()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Infoskjerm</h1>
          <p className="mt-2 text-gray-600">Forhåndsvis innhold for infoskjermer i bibliotekets lokaler</p>
        </div>
        <button onClick={() => { setShowFullscreen(true); setCurrentSlide(0) }}
          className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium">
          🖥️ Åpne fullskjerm
        </button>
      </div>

      {/* Innstillinger */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">⚙️ Visningsinnstillinger</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visningsmodus</label>
            <select value={visningsModus} onChange={(e) => setVisningsModus(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg">
              <option value="kombinert">Kombinert (arrangementer + anbefalinger)</option>
              <option value="arrangementer">Kun arrangementer</option>
              <option value="anbefalinger">Kun anbefalinger</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rotasjonstid (sekunder)</label>
            <input type="number" value={rotasjonstid} onChange={(e) => setRotasjonstid(parseInt(e.target.value) || 10)}
              min={5} max={60}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex items-end">
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 w-full">
              📊 {slides.length} elementer i rotasjon
            </div>
          </div>
        </div>
      </div>

      {/* Mini-forhåndsvisning */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">👁️ Forhåndsvisning</h3>
        <div className="aspect-video bg-gradient-to-br from-[#16425b] to-[#2c5f7a] rounded-xl overflow-hidden relative">
          {slides.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/60 text-lg">
              Ingen innhold å vise. Opprett arrangementer eller anbefalinger først.
            </div>
          ) : (
            <div className="p-12 flex flex-col justify-center h-full text-white">
              {slides[currentSlide]?.type === 'arrangement' && (
                <>
                  <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4 w-fit">
                    📅 {slides[currentSlide].data.kategori}
                  </div>
                  <h2 className="text-4xl font-bold mb-3">{slides[currentSlide].data.tittel}</h2>
                  <p className="text-xl text-white/80 mb-2">
                    {new Date(slides[currentSlide].data.dato).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })} kl {slides[currentSlide].data.klokkeslett}
                  </p>
                  <p className="text-lg text-white/70">📍 {slides[currentSlide].data.sted}</p>
                  <p className="text-white/60 mt-4 line-clamp-2">{slides[currentSlide].data.beskrivelse}</p>
                </>
              )}
              {slides[currentSlide]?.type === 'anbefaling' && (
                <>
                  <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4 w-fit">
                    ⭐ Anbefaling
                  </div>
                  <h2 className="text-4xl font-bold mb-3">{slides[currentSlide].data.tittel}</h2>
                  {slides[currentSlide].data.forfatter && (
                    <p className="text-xl text-white/80 mb-4">{slides[currentSlide].data.forfatter}</p>
                  )}
                  <p className="text-white/60 line-clamp-3">{slides[currentSlide].data.beskrivelse}</p>
                </>
              )}

              {/* Slide indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${i === currentSlide ? 'bg-white' : 'bg-white/30'}`} />
                ))}
              </div>

              {/* Navigation arrows */}
              <button onClick={() => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xl">
                ‹
              </button>
              <button onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xl">
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Innhold-liste */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">📅 Arrangementer ({arrangementer.length})</h3>
          <div className="space-y-2">
            {arrangementer.slice(0, 5).map(arr => (
              <div key={arr.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                <span className="font-medium">{arr.tittel}</span>
                <span className="text-gray-500 ml-2">{new Date(arr.dato).toLocaleDateString('nb-NO')}</span>
              </div>
            ))}
            {arrangementer.length === 0 && <p className="text-gray-400 text-sm">Ingen arrangementer</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">⭐ Anbefalinger ({anbefalinger.length})</h3>
          <div className="space-y-2">
            {anbefalinger.slice(0, 5).map(anb => (
              <div key={anb.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                <span className="font-medium">{anb.tittel}</span>
                {anb.forfatter && <span className="text-gray-500 ml-2">av {anb.forfatter}</span>}
              </div>
            ))}
            {anbefalinger.length === 0 && <p className="text-gray-400 text-sm">Ingen anbefalinger</p>}
          </div>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#16425b] to-[#0a2a3a]">
          <button onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 z-10 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm">
            ✕ Lukk (ESC)
          </button>

          {slides.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/60 text-2xl">
              Ingen innhold å vise
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full p-16 text-white">
              {/* Library logo area */}
              <div className="absolute top-8 left-8 flex items-center space-x-3">
                <span className="text-4xl">📚</span>
                <span className="text-2xl font-bold text-white/80">Bergen Bibliotek</span>
              </div>

              {slides[currentSlide]?.type === 'arrangement' && (
                <div className="text-center max-w-4xl">
                  <div className="inline-block px-6 py-3 bg-white/10 rounded-full text-lg font-medium mb-6">
                    📅 {slides[currentSlide].data.kategori}
                  </div>
                  <h1 className="text-6xl font-bold mb-6">{slides[currentSlide].data.tittel}</h1>
                  <p className="text-3xl text-white/80 mb-3">
                    {new Date(slides[currentSlide].data.dato).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-2xl text-white/70 mb-3">🕐 kl {slides[currentSlide].data.klokkeslett}</p>
                  <p className="text-2xl text-white/70 mb-8">📍 {slides[currentSlide].data.sted}</p>
                  <p className="text-xl text-white/50 max-w-2xl mx-auto">{slides[currentSlide].data.beskrivelse}</p>
                </div>
              )}

              {slides[currentSlide]?.type === 'anbefaling' && (
                <div className="text-center max-w-4xl">
                  <div className="inline-block px-6 py-3 bg-white/10 rounded-full text-lg font-medium mb-6">
                    ⭐ Anbefaling fra biblioteket
                  </div>
                  <h1 className="text-6xl font-bold mb-4">{slides[currentSlide].data.tittel}</h1>
                  {slides[currentSlide].data.forfatter && (
                    <p className="text-3xl text-white/80 mb-8">{slides[currentSlide].data.forfatter}</p>
                  )}
                  <p className="text-xl text-white/50 max-w-2xl mx-auto">{slides[currentSlide].data.beskrivelse}</p>
                </div>
              )}

              {/* Fullscreen slide indicators */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3">
                {slides.map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-full transition-colors ${i === currentSlide ? 'bg-white' : 'bg-white/20'}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
