'use client'

import { useState } from 'react'

interface Achievement {
  id: number
  name: string
  desc: string
  icon: React.ReactNode
  unlocked: boolean
}

/* ───── Achievement SVG Icons ───── */
const aIc = {
  bookworm: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M12 6v7"/><path d="M8 13c1-1 2.5-1 4 0s3 1 4 0"/></svg>,
  culture: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  versatile: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
  punctual: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  explorer: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  social: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  nightOwl: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  filmLover: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>,
  trophy: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  check: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>,
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: 'Bokorm', desc: 'Lest 10 bøker', icon: aIc.bookworm, unlocked: true },
  { id: 2, name: 'Kulturelskeren', desc: 'Deltatt på 5 arrangementer', icon: aIc.culture, unlocked: true },
  { id: 3, name: 'Allsidig', desc: 'Lest 3 ulike sjangre', icon: aIc.versatile, unlocked: false },
  { id: 4, name: 'Punktlig', desc: 'Levert 10 bøker i tide', icon: aIc.punctual, unlocked: true },
  { id: 5, name: 'Oppdageren', desc: 'Besøkt alle filialer', icon: aIc.explorer, unlocked: false },
  { id: 6, name: 'Sosial', desc: 'Delt 5 bokanbefalinger', icon: aIc.social, unlocked: false },
  { id: 7, name: 'Nattleser', desc: 'Lånt 5 e-bøker', icon: aIc.nightOwl, unlocked: true },
  { id: 8, name: 'Filmelsker', desc: 'Sett 10 filmer fra Filmoteket', icon: aIc.filmLover, unlocked: false },
]

export default function Achievements() {
  const [showAll, setShowAll] = useState(false)
  
  const displayedAchievements = showAll ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 4)
  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-[#16425b]">{aIc.trophy}</span>
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
            <div className="flex justify-center mb-3 text-gray-600">{achievement.icon}</div>
            <div className="font-bold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              {achievement.name}
            </div>
            <div className="text-sm text-gray-600">{achievement.desc}</div>
            
            {achievement.unlocked && (
              <div className="mt-3 text-xs font-medium text-[#2d7a50] flex items-center justify-center gap-1">
                {aIc.check} Låst opp
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
