'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <div 
      className="relative overflow-hidden text-white py-20 px-6 text-center mb-12"
      style={{
        background: 'linear-gradient(135deg, #16425b 0%, #2a6a8e 100%)'
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />
      
      <div className="relative max-w-4xl mx-auto">
        <h1 
          className="text-5xl md:text-6xl font-bold mb-4"
          style={{ 
            fontFamily: 'var(--font-serif)',
            letterSpacing: '-0.02em'
          }}
        >
          Bergen Offentlige Bibliotek
        </h1>
        
        <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Utforsk vårt store utvalg av bøker, e-bøker, lydbøker og arrangementer. 
          Din lokale møteplass for kultur og kunnskap.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#16425b] rounded-lg font-semibold hover:bg-gray-50 transition-all hover:scale-105 shadow-lg"
          >
            <span>🔍</span>
            Utforsk samlingen
          </Link>
          
          <Link
            href="/registrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2d7a50] text-white rounded-lg font-semibold hover:bg-[#236142] transition-all hover:scale-105 shadow-lg"
          >
            <span>📝</span>
            Bli medlem
          </Link>
          
          <Link
            href="/arrangementer"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
          >
            <span>📅</span>
            Se arrangementer
          </Link>
        </div>
      </div>
    </div>
  )
}
