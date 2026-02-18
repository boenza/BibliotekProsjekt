'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import UnifiedSearch from './UnifiedSearch'

const NAV_ITEMS = [
  { href: '/katalog', label: 'Katalog', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
  )},
  { href: '/digitalt', label: 'Digitalt', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>
  )},
  { href: '/arrangementer', label: 'Arrangementer', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
  )},
  { href: '/tjenester', label: 'Tjenester', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/></svg>
  )},
  { href: '/aktuelt', label: 'Aktuelt', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8m8-4h-8m8 8h-8"/></svg>
  )},
  { href: '/apningstider', label: 'Åpningstider', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
  )},
]

export default function PublicHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(15, 61, 84, 0.97)'
            : 'linear-gradient(180deg, #0f3d54 0%, #0f3d54 100%)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 4px 24px rgba(10, 42, 60, 0.2)' : 'none',
        }}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between gap-4 py-3">
            {/* Logo — Bergen Offentlige Bibliotek SVG */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
              {!logoError ? (
                <img
                  src="/bergen-logo.svg"
                  alt="Bergen Offentlige Bibliotek"
                  className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                  style={{ filter: 'brightness(0) invert(1)' }}
                  onError={() => setLogoError(true)}
                />
              ) : (
                /* Fallback if logo file not found */
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #1a7a9e 0%, #d4e4ed 100%)' }}
                >
                  <span className="text-sm font-bold" style={{ color: '#0f3d54', fontFamily: 'var(--font-display)' }}>BB</span>
                </div>
              )}
              
            </Link>

            {/* Search — center */}
            <div className="flex-1 max-w-md hidden lg:block">
              <UnifiedSearch />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-200"
                  style={{
                    color: isActive(item.href) ? '#ffffff' : 'rgba(255,255,255,0.65)',
                    background: isActive(item.href) ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {item.icon}
                  {item.label}
                  {isActive(item.href) && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{ background: 'linear-gradient(90deg, #1a7a9e, #d4e4ed)' }}
                    />
                  )}
                </Link>
              ))}

              {/* Min side — prominent */}
              <Link
                href="/min-side"
                className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg text-[13.5px] font-semibold transition-all duration-200"
                style={{
                  background: isActive('/min-side')
                    ? 'rgba(255,255,255,0.95)'
                    : 'rgba(255,255,255,0.12)',
                  color: isActive('/min-side') ? '#0f3d54' : '#ffffff',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
                  e.currentTarget.style.color = '#0f3d54'
                }}
                onMouseLeave={e => {
                  if (!isActive('/min-side')) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                    e.currentTarget.style.color = '#ffffff'
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>
                </svg>
                Min side
              </Link>
            </nav>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Meny"
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden border-t border-white/10 animate-fade-in"
            style={{ background: 'rgba(15, 61, 84, 0.98)' }}
          >
            <div className="container-custom py-4 space-y-1">
              <div className="mb-3">
                <UnifiedSearch />
              </div>
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: isActive(item.href) ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    background: isActive(item.href) ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <Link
                href="/min-side"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg text-sm font-semibold bg-white/10 text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>
                </svg>
                Min side
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
