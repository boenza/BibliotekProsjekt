'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ───── Admin tokens (shared with layout) ───── */
const admin = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primarySoft: 'rgba(99,102,241,0.08)',
  accent: '#8b5cf6',
  success: '#10b981',
  successSoft: 'rgba(16,185,129,0.08)',
  warning: '#f59e0b',
  warningSoft: 'rgba(245,158,11,0.08)',
  danger: '#ef4444',
  dangerSoft: 'rgba(239,68,68,0.06)',
  ink: '#1e293b',
  inkSoft: '#475569',
  inkMuted: '#94a3b8',
  border: 'rgba(0,0,0,0.06)',
  card: '#ffffff',
}

/* ───── SVG Icons ───── */
const icons = {
  star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  article: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  trendUp: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  refresh: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>,
  alertTriangle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
}

/* ───── Stats data ───── */
const stats = [
  { name: 'Publiserte anbefalinger', value: '127', change: '+12%', icon: icons.star, color: admin.primary, bg: admin.primarySoft },
  { name: 'Kommende arrangementer', value: '23', change: '+5', icon: icons.calendar, color: admin.accent, bg: 'rgba(139,92,246,0.08)' },
  { name: 'Artikler denne mnd.', value: '45', change: '+18%', icon: icons.article, color: admin.success, bg: admin.successSoft },
  { name: 'Aktive brukere', value: '8 429', change: '+24%', icon: icons.users, color: admin.warning, bg: admin.warningSoft },
]

/* ───── Activity data ───── */
const recentActivity = [
  { action: 'Ny anbefaling publisert', item: 'Nordlys i november', user: 'Anna Hansen', time: '10 min', color: admin.primary },
  { action: 'Arrangement opprettet', item: 'Forfattermøte: Jo Nesbø', user: 'Lars Berg', time: '1 time', color: admin.accent },
  { action: 'Artikkel redigert', item: 'Sommerlesetips 2026', user: 'Kari Olsen', time: '2 timer', color: admin.success },
  { action: 'Arrangement publisert', item: 'Kodeklubb for ungdom', user: 'Erik Svendsen', time: '3 timer', color: admin.warning },
]

/* ───── Quick actions ───── */
const quickActions = [
  { label: 'Ny anbefaling', desc: 'Anbefal en bok', href: '/admin/innhold/anbefalinger', icon: icons.star, color: admin.primary },
  { label: 'Nytt arrangement', desc: 'Opprett event', href: '/admin/arrangementer', icon: icons.calendar, color: admin.accent },
  { label: 'Ny artikkel', desc: 'Skriv innhold', href: '/admin/innhold/artikler', icon: icons.article, color: admin.success },
  { label: 'Statistikk', desc: 'Se rapporter', href: '/admin/statistikk', icon: icons.chart, color: admin.warning },
]

export default function AdminDashboard() {
  const [isNullstilling, setIsNullstilling] = useState(false)
  const [nullstillResult, setNullstillResult] = useState<string | null>(null)
  const [showNullstillConfirm, setShowNullstillConfirm] = useState(false)

  const handleNullstill = async () => {
    setIsNullstilling(true)
    setNullstillResult(null)
    try {
      const response = await fetch('/api/nullstill', { method: 'POST' })
      const data = await response.json()
      setNullstillResult(data.success
        ? 'Nullstilling fullført! Alle testdata er tilbakestilt.'
        : 'Nullstilling delvis fullført: ' + (data.message || 'Noen elementer ble ikke funnet'))
    } catch (error) {
      console.error('Nullstilling error:', error)
      setNullstillResult('Feil ved nullstilling. Sjekk konsollen.')
    } finally { setIsNullstilling(false); setShowNullstillConfirm(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: admin.ink }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: admin.inkMuted }}>Oversikt over bibliotekets aktivitet og innhold.</p>
      </div>

      {/* ═══════ STATS ═══════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.name} className="rounded-xl p-5" style={{ background: admin.card, border: `1px solid ${admin.border}` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: admin.inkMuted }}>{stat.name}</p>
                <p className="text-2xl font-bold mt-1.5 tracking-tight" style={{ color: admin.ink }}>{stat.value}</p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: admin.success }}>
              {icons.trendUp}
              <span>{stat.change}</span>
              <span className="font-normal" style={{ color: admin.inkMuted }}>fra forrige mnd.</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* ═══════ RECENT ACTIVITY ═══════ */}
        <div className="lg:col-span-3 rounded-xl p-5" style={{ background: admin.card, border: `1px solid ${admin.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: admin.ink }}>Siste aktivitet</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: admin.primarySoft, color: admin.primary }}>Siste 24t</span>
          </div>
          <div className="space-y-1">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 py-3 group"
                style={{ borderBottom: idx < recentActivity.length - 1 ? `1px solid ${admin.border}` : 'none' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: activity.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: admin.ink }}>{activity.action}</p>
                  </div>
                  <p className="text-xs truncate" style={{ color: admin.inkMuted }}>{activity.item}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] font-medium" style={{ color: admin.inkSoft }}>{activity.user}</p>
                  <p className="text-[10px]" style={{ color: admin.inkMuted }}>{activity.time} siden</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ QUICK ACTIONS ═══════ */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: admin.card, border: `1px solid ${admin.border}` }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: admin.ink }}>Hurtighandlinger</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(action => (
              <Link key={action.label} href={action.href}
                className="p-3.5 rounded-xl text-left transition-all hover:scale-[1.02] group"
                style={{ border: `1.5px solid ${admin.border}` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 transition-colors"
                  style={{ background: `color-mix(in srgb, ${action.color} 8%, transparent)`, color: action.color }}>
                  {action.icon}
                </div>
                <div className="text-[13px] font-semibold group-hover:text-indigo-600 transition-colors" style={{ color: admin.ink }}>{action.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: admin.inkMuted }}>{action.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ NULLSTILLING ═══════ */}
      <div className="rounded-xl p-5" style={{ background: admin.dangerSoft, border: `1px solid rgba(239,68,68,0.1)` }}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.1)', color: admin.danger }}>
              {icons.refresh}
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: '#991b1b' }}>Nullstilling — testmiljø</h3>
              <p className="text-xs mt-1 max-w-lg" style={{ color: '#b91c1c' }}>
                Tilbakestill testmiljøet mellom brukertester. Sletter testlånere, reservasjoner, påmeldinger, anbefalinger, arrangementer og varsler.
              </p>
              <details className="mt-2">
                <summary className="text-[10px] font-medium cursor-pointer" style={{ color: '#dc2626' }}>Vis detaljer</summary>
                <ul className="mt-1.5 space-y-0.5 text-[10px]" style={{ color: '#b91c1c' }}>
                  <li className="flex items-center gap-1">{icons.check} Testlånere (A. Olsen og testbrukere)</li>
                  <li className="flex items-center gap-1">{icons.check} Reservasjoner gjort i testen</li>
                  <li className="flex items-center gap-1">{icons.check} Påmeldinger til arrangementer</li>
                  <li className="flex items-center gap-1">{icons.check} Anbefalinger opprettet i CMS</li>
                  <li className="flex items-center gap-1">{icons.check} Arrangementer opprettet i CMS</li>
                  <li className="flex items-center gap-1">{icons.check} Varsler opprettet i CMS</li>
                </ul>
              </details>
            </div>
          </div>
          <div className="flex-shrink-0">
            {!showNullstillConfirm ? (
              <button onClick={() => setShowNullstillConfirm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.02]"
                style={{ background: admin.danger }}>
                Nullstill testmiljø
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleNullstill} disabled={isNullstilling}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                  style={{ background: '#991b1b' }}>
                  {isNullstilling ? 'Nullstiller...' : 'Bekreft'}
                </button>
                <button onClick={() => setShowNullstillConfirm(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#991b1b' }}>
                  Avbryt
                </button>
              </div>
            )}
          </div>
        </div>
        {nullstillResult && (
          <div className="mt-3 p-3 rounded-lg text-xs font-medium"
            style={{
              background: nullstillResult.includes('fullført') ? admin.successSoft : admin.warningSoft,
              color: nullstillResult.includes('fullført') ? '#065f46' : '#92400e',
              border: `1px solid ${nullstillResult.includes('fullført') ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`,
            }}>
            {nullstillResult}
          </div>
        )}
      </div>
    </div>
  )
}
