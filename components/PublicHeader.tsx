'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PublicHeader() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="bg-[#16425b] text-white">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-3">
            <span className="text-3xl">📚</span>
            <div>
              <h1 className="text-2xl font-bold">Bergen Bibliotek</h1>
              <p className="text-xs text-white/70">Felles Formidlingsløsning</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`transition-colors font-medium ${
                isActive('/') && pathname === '/' 
                  ? 'text-white border-b-2 border-white pb-1' 
                  : 'hover:text-white/80'
              }`}
            >
              Hjem
            </Link>
            <Link 
              href="/katalog" 
              className={`transition-colors ${
                isActive('/katalog') 
                  ? 'text-white border-b-2 border-white pb-1' 
                  : 'hover:text-white/80'
              }`}
            >
              Katalog
            </Link>
            <Link 
              href="/digitalt" 
              className={`transition-colors ${
                isActive('/digitalt') 
                  ? 'text-white border-b-2 border-white pb-1' 
                  : 'hover:text-white/80'
              }`}
            >
              Digitalt innhold
            </Link>
            <Link 
              href="/arrangementer" 
              className={`transition-colors ${
                isActive('/arrangementer') 
                  ? 'text-white border-b-2 border-white pb-1' 
                  : 'hover:text-white/80'
              }`}
            >
              Arrangementer
            </Link>
            <Link 
              href="/min-side" 
              className="bg-white text-[#16425b] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Min side
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
