'use client'

interface StatsGridProps {
  booksThisYear: number
  eventsAttended: number
  readingStreak: number
  totalPages: number
}

const statsIcons = {
  books: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  theater: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  flame: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  bookOpen: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
}

export default function StatsGrid({ booksThisYear, eventsAttended, readingStreak, totalPages }: StatsGridProps) {
  const stats = [
    { label: 'Bøker lest i år', value: booksThisYear, icon: statsIcons.books },
    { label: 'Arrangementer deltatt', value: eventsAttended, icon: statsIcons.theater },
    { label: 'Dagers lesestreak', value: readingStreak, icon: statsIcons.flame },
    { label: 'Sider lest totalt', value: totalPages.toLocaleString(), icon: statsIcons.bookOpen }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div 
          key={i}
          className="relative overflow-hidden rounded-xl p-6 text-white text-center"
          style={{
            background: 'linear-gradient(135deg, #16425b 0%, #2a6a8e 100%)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex justify-center mb-2 opacity-90">{stat.icon}</div>
          <div className="text-4xl font-bold mb-1">{stat.value}</div>
          <div className="text-sm opacity-90">{stat.label}</div>
          
          {/* Decorative circle */}
          <div 
            className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'white' }}
          />
        </div>
      ))}
    </div>
  )
}
