'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Anbefalinger', href: '/admin/innhold/anbefalinger', icon: '⭐' },
  { name: 'Artikler', href: '/admin/innhold/artikler', icon: '📝' },
  { name: 'Arrangementer', href: '/admin/arrangementer', icon: '📅' },
  { name: 'Varsler', href: '/admin/varsler', icon: '⚠️' },
  { name: 'Nyhetsbrev', href: '/admin/nyhetsbrev', icon: '✉️' },
  { name: 'Infoskjerm', href: '/admin/infoskjerm', icon: '🖥️' },
  { name: 'Deling', href: '/admin/deling', icon: '🔄' },
  { name: 'Samling', href: '/admin/samling', icon: '📚' },
  { name: 'Innstillinger', href: '/admin/innstillinger', icon: '⚙️' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo login — brukertesten krever innlogging til CMS (A-1)
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true)
      setLoginError('')
    } else if (username && password) {
      // Aksepter alle for demo
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('Vennligst fyll ut brukernavn og passord')
    }
  }

  // CMS Login screen (A-1)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#16425b] to-[#2c5f7a] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-2xl font-bold text-gray-900">CMS Admin</h1>
            <p className="text-gray-600 mt-2">Bergen Bibliotek — Publiseringsverktøy</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brukernavn</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="admin"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium text-lg"
            >
              Logg inn
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Demo: brukernavn «admin» / passord «admin»
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-[#16425b] text-white overflow-y-auto">
        <div className="flex items-center justify-center h-16 bg-[#1a5270]">
          <h1 className="text-xl font-bold">📚 CMS Admin</h1>
        </div>
        <nav className="mt-6 px-4 space-y-1">
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
                <span className="text-lg mr-3">{item.icon}</span>
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
              <div className="text-sm font-medium">{username || 'Admin'}</div>
              <div className="text-xs text-white/60">Bergen Bibliotek</div>
            </div>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="w-full mt-3 py-2 text-xs text-white/60 hover:text-white transition-colors"
          >
            Logg ut
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Innholdsadministrasjon
          </h2>
          <div className="flex items-center space-x-3">
            <Link href="/" target="_blank" className="px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors text-sm">
              Se nettside →
            </Link>
          </div>
        </header>
        
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
