'use client'

import { useMemo } from 'react'

interface QRLånekortProps {
  userNumber: string
  userName: string
}

export default function QRLånekort({ userNumber, userName }: QRLånekortProps) {
  // Generate QR pattern from user number (deterministic)
  const qrPattern = useMemo(() => {
    const seed = userNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const pattern: number[] = []
    
    // Generate 64 pixels (8x8 grid)
    for (let i = 0; i < 64; i++) {
      const value = Math.sin(seed * (i + 1) * 9301 + 49297) * 43758.5453
      pattern.push((value - Math.floor(value)) > 0.5 ? 1 : 0)
    }
    
    return pattern
  }, [userNumber])

  return (
    <div className="bg-gradient-to-br from-[#16425b] to-[#0e2f42] rounded-2xl p-8 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative flex items-center gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💳</span>
            <h3 className="text-xl font-bold">Digitalt lånekort</h3>
          </div>
          
          <p className="text-white/70 text-sm mb-4">
            Vis QR-koden i biblioteket for å låne og hente
          </p>
          
          <div className="space-y-2">
            <div className="text-white/90">
              <div className="text-xs uppercase tracking-wider text-white/60 mb-1">Kortnummer</div>
              <div className="text-2xl font-light tracking-[0.2em] font-mono">{userNumber}</div>
            </div>
            
            <div className="text-white/90">
              <div className="text-xs uppercase tracking-wider text-white/60 mb-1">Navn</div>
              <div className="text-lg font-medium">{userName}</div>
            </div>
          </div>
        </div>
        
        {/* QR Code */}
        <div className="bg-white rounded-2xl p-4 shadow-2xl">
          <div className="w-36 h-36 grid grid-cols-8 gap-0.5">
            {qrPattern.map((pixel, i) => (
              <div
                key={i}
                className={`rounded-sm ${pixel ? 'bg-gray-900' : 'bg-transparent'}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Badge */}
      <div className="mt-6 flex items-center gap-2 text-xs text-white/60">
        <span>🔒</span>
        <span>Sikker identifikasjon via Bergen Bibliotek</span>
      </div>
    </div>
  )
}
