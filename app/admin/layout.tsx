'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Anbefalinger', href: '/admin/innhold/anbefalinger', icon: '⭐' },
  { name: 'Artikler', href: '/admin/innhold/artikler', icon: '📝' },
  { name: 'Arrangementer', href: '/admin/arrangementer', icon: '📅' },
  { name: 'Samling', href: '/admin/samling', icon: '📚' },
  { name: 'Innstillinger', href: '/admin/innstillinger', icon: '⚙️' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-[#16425b] text-white">
        <div className="flex items-center justify-center h-16 bg-[#1a5270]">
          <h1 className="text-xl font-bold">📚 CMS Admin</h1>
        </div>
        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              👤
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Admin</div>
              <div className="text-xs text-white/60">Bergen Bibliotek</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Innholdsadministrasjon
          </h2>
          <button className="px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors">
            Se nettside →
          </button>
        </header>
        
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
