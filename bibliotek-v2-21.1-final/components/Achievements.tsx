'use client'

import { useState } from 'react'

interface Achievement {
  id: number
  name: string
  desc: string
  icon: string
  unlocked: boolean
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: 'Bokorm', desc: 'Lest 10 bøker', icon: '🐛', unlocked: true },
  { id: 2, name: 'Kulturelskeren', desc: 'Deltatt på 5 arrangementer', icon: '🎭', unlocked: true },
  { id: 3, name: 'Allsidig', desc: 'Lest 3 ulike sjangre', icon: '🌈', unlocked: false },
  { id: 4, name: 'Punktlig', desc: 'Levert 10 bøker i tide', icon: '⏰', unlocked: true },
  { id: 5, name: 'Oppdageren', desc: 'Besøkt alle filialer', icon: '🗺️', unlocked: false },
  { id: 6, name: 'Sosial', desc: 'Delt 5 bokanbefalinger', icon: '💬', unlocked: false },
  { id: 7, name: 'Nattleser', desc: 'Lånt 5 e-bøker', icon: '🌙', unlocked: true },
  { id: 8, name: 'Filmelsker', desc: 'Sett 10 filmer fra Filmoteket', icon: '🎬', unlocked: false }
]

export default function Achievements() {
  const [showAll, setShowAll] = useState(false)
  
  const displayedAchievements = showAll ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 4)
  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
              Prestasjoner
            </h2>
            <p className="text-sm text-gray-600">
              {unlockedCount} av {ACHIEVEMENTS.length} låst opp
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-[#16425b] transition-colors text-sm font-medium"
        >
          {showAll ? 'Vis færre' : 'Vis alle'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedAchievements.map(achievement => (
          <div
            key={achievement.id}
            className={`
              border-2 rounded-xl p-5 text-center transition-all
              ${achievement.unlocked 
                ? 'border-[#16425b] bg-gradient-to-br from-[#16425b]/5 to-[#2a6a8e]/5' 
                : 'border-gray-200 opacity-50'
              }
            `}
          >
            <div className="text-5xl mb-3">{achievement.icon}</div>
            <div className="font-bold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              {achievement.name}
            </div>
            <div className="text-sm text-gray-600">{achievement.desc}</div>
            
            {achievement.unlocked && (
              <div className="mt-3 text-xs font-medium text-[#2d7a50] flex items-center justify-center gap-1">
                <span>✓</span> Låst opp
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
