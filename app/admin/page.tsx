'use client'

import Link from 'next/link'

export default function AdminDashboard() {
  const stats = [
    { name: 'Publiserte anbefalinger', value: '127', change: '+12%', icon: '⭐' },
    { name: 'Kommende arrangementer', value: '23', change: '+5', icon: '📅' },
    { name: 'Artikler denne måneden', value: '45', change: '+18%', icon: '📝' },
    { name: 'Aktive brukere', value: '8,429', change: '+24%', icon: '👥' },
  ]

  const recentActivity = [
    { action: 'Ny anbefaling publisert', item: 'Nordlys i november', user: 'Anna Hansen', time: '10 min siden' },
    { action: 'Arrangement opprettet', item: 'Forfattermøte: Jo Nesbø', user: 'Lars Berg', time: '1 time siden' },
    { action: 'Artikkel redigert', item: 'Sommerlesetips 2026', user: 'Kari Olsen', time: '2 timer siden' },
    { action: 'Arrangement publisert', item: 'Kodeklubb for ungdom', user: 'Erik Svendsen', time: '3 timer siden' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Velkommen tilbake! Her er en oversikt over bibliotekets aktivitet.</p>
        </div>
        <Link 
          href="/katalog"
          className="px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors"
        >
          Se nettside →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-green-600 mt-2">↗ {stat.change}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Siste aktivitet</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.item}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hurtighandlinger</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              href="/admin/innhold/anbefalinger"
              className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-[#16425b] hover:bg-[#16425b]/5 transition-all"
            >
              <div className="text-2xl mb-2">⭐</div>
              <div className="font-medium text-gray-900">Ny anbefaling</div>
              <div className="text-xs text-gray-500 mt-1">Anbefal en bok</div>
            </Link>
            
            <Link 
              href="/admin/arrangementer"
              className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-[#16425b] hover:bg-[#16425b]/5 transition-all"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium text-gray-900">Nytt arrangement</div>
              <div className="text-xs text-gray-500 mt-1">Opprett event</div>
            </Link>
            
            <Link 
              href="/admin/innhold/artikler"
              className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-[#16425b] hover:bg-[#16425b]/5 transition-all"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium text-gray-900">Ny artikkel</div>
              <div className="text-xs text-gray-500 mt-1">Skriv innhold</div>
            </Link>
            
            <Link 
              href="/admin/statistikk"
              className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-[#16425b] hover:bg-[#16425b]/5 transition-all"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-900">Statistikk</div>
              <div className="text-xs text-gray-500 mt-1">Se rapporter</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
