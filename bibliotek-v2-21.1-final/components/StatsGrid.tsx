'use client'

interface StatsGridProps {
  booksThisYear: number
  eventsAttended: number
  readingStreak: number
  totalPages: number
}

export default function StatsGrid({ booksThisYear, eventsAttended, readingStreak, totalPages }: StatsGridProps) {
  const stats = [
    { label: 'Bøker lest i år', value: booksThisYear, icon: '📚' },
    { label: 'Arrangementer deltatt', value: eventsAttended, icon: '🎭' },
    { label: 'Dagers lesestreak', value: readingStreak, icon: '🔥' },
    { label: 'Sider lest totalt', value: totalPages.toLocaleString(), icon: '📖' }
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
          <div className="text-4xl mb-2">{stat.icon}</div>
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
