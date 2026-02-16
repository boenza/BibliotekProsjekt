'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

/* ───── Admin Design Tokens (inline, no CSS file needed) ───── */
const admin = {
  bg: '#f5f6f8',
  sidebar: '#161829',
  sidebarHover: 'rgba(255,255,255,0.06)',
  sidebarActive: 'rgba(99,102,241,0.15)',
  sidebarBorder: 'rgba(255,255,255,0.06)',
  primary: '#6366f1',    // indigo
  primaryDark: '#4f46e5',
  primarySoft: 'rgba(99,102,241,0.08)',
  accent: '#8b5cf6',     // violet
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  ink: '#1e293b',
  inkSoft: '#475569',
  inkMuted: '#94a3b8',
  border: 'rgba(0,0,0,0.06)',
  card: '#ffffff',
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}

/* ───── SVG Icons ───── */
const icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  star: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  article: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  building: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>,
  alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  monitor: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  scissors: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  share: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  collection: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>,
  logout: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  external: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  lock: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  library: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  chevronRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>,
}

/* ───── Navigation ───── */
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: icons.dashboard },
  { name: 'Anbefalinger', href: '/admin/innhold/anbefalinger', icon: icons.star },
  { name: 'Artikler', href: '/admin/innhold/artikler', icon: icons.article },
  { name: 'Arrangementer', href: '/admin/arrangementer', icon: icons.calendar },
  { name: 'Tjenester', href: '/admin/tjenester', icon: icons.building },
  { name: 'Varsler', href: '/admin/varsler', icon: icons.alert },
  { name: 'Nyhetsbrev', href: '/admin/nyhetsbrev', icon: icons.mail },
  { name: 'Infoskjerm', href: '/admin/infoskjerm', icon: icons.monitor },
  { name: 'Bilderedigering', href: '/admin/bilder/redigering', icon: icons.scissors },
  { name: 'Deling', href: '/admin/deling', icon: icons.share },
  { name: 'Samling', href: '/admin/samling', icon: icons.collection },
  { name: 'Innstillinger', href: '/admin/innstillinger', icon: icons.settings },
]

/* ───── Section groupings ───── */
const sections = [
  { label: 'Oversikt', items: navigation.slice(0, 1) },
  { label: 'Innhold', items: navigation.slice(1, 4) },
  { label: 'Kommunikasjon', items: navigation.slice(4, 8) },
  { label: 'Verktøy', items: navigation.slice(8, 11) },
  { label: 'System', items: navigation.slice(11) },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username && password) {
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('Vennligst fyll ut brukernavn og passord')
    }
  }

  /* ═══════ LOGIN SCREEN ═══════ */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: `linear-gradient(135deg, ${admin.sidebar} 0%, #1e2140 50%, #2d1b69 100%)`, fontFamily: admin.font }}>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative w-full max-w-sm">
          {/* Logo card */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', color: admin.primary }}>
              {icons.library}
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Bergen Bibliotek</h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(148,163,184,0.6)' }}>Innholdsadministrasjon</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="rounded-2xl p-6 space-y-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>

            {loginError && (
              <div className="p-3 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'rgba(148,163,184,0.5)' }}>Brukernavn</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} autoFocus placeholder="admin"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'rgba(148,163,184,0.5)' }}>Passord</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <button type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01] hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, ${admin.primary}, ${admin.accent})` }}>
              Logg inn
            </button>
          </form>

          <p className="text-center text-[10px] mt-5" style={{ color: 'rgba(148,163,184,0.3)' }}>
            Demo: brukernavn «admin» / passord «admin»
          </p>
        </div>
      </div>
    )
  }

  /* ═══════ ADMIN SHELL ═══════ */
  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-60'
  const mainMargin = sidebarCollapsed ? 'ml-16' : 'ml-60'

  return (
    <div className="min-h-screen" style={{ background: admin.bg, fontFamily: admin.font }}>
      {/* ─── Sidebar ─── */}
      <div className={`fixed inset-y-0 left-0 ${sidebarWidth} transition-all duration-200 z-30 flex flex-col`}
        style={{ background: admin.sidebar }}>

        {/* Logo */}
        <div className="h-14 flex items-center px-4 flex-shrink-0" style={{ borderBottom: `1px solid ${admin.sidebarBorder}` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)', color: admin.primary }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3">
              <div className="text-sm font-bold text-white tracking-tight">CMS Admin</div>
              <div className="text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>Bergen Bibliotek</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {sections.map(section => (
            <div key={section.label}>
              {!sidebarCollapsed && (
                <div className="px-3 mb-1 text-[9px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: 'rgba(148,163,184,0.3)' }}>{section.label}</div>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  return (
                    <Link key={item.name} href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
                      style={{
                        background: isActive ? admin.sidebarActive : 'transparent',
                        color: isActive ? '#a5b4fc' : 'rgba(226, 232, 240, 0.75)',
                      }}
                      title={sidebarCollapsed ? item.name : undefined}>
                      <span className="flex-shrink-0" style={{ color: isActive ? '#a5b4fc' : 'rgba(148,163,184,0.5)' }}>{item.icon}</span>
                      {!sidebarCollapsed && item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="flex-shrink-0 p-3" style={{ borderTop: `1px solid ${admin.sidebarBorder}` }}>
          <div className={`flex items-center gap-2.5 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}>
              {icons.user}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">{username || 'Admin'}</div>
                <div className="text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>Redaktør</div>
              </div>
            )}
            {!sidebarCollapsed && (
              <button onClick={() => setIsLoggedIn(false)} className="p-1.5 rounded-md transition-colors hover:bg-white/5"
                style={{ color: 'rgba(148,163,184,0.3)' }} title="Logg ut">
                {icons.logout}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main content area ─── */}
      <div className={`${mainMargin} transition-all duration-200`}>
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 sticky top-0 z-20"
          style={{ background: 'rgba(245,246,248,0.85)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${admin.border}` }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
              style={{ color: admin.inkMuted }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-xs" style={{ color: admin.inkMuted }}>
              <span>Admin</span>
              {pathname !== '/admin' && (
                <>
                  {icons.chevronRight}
                  <span className="font-medium" style={{ color: admin.ink }}>
                    {navigation.find(n => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.name || 'Side'}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
              style={{ background: admin.primarySoft, color: admin.primary }}>
              {icons.external} Se nettside
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
