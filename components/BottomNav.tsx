'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

/* ───── Tab configuration ───── */
const TABS = [
  {
    key: 'hjem',
    label: 'Hjem',
    href: '/',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active
          ? <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" />
          : <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>
        }
      </svg>
    ),
  },
  {
    key: 'katalog',
    label: 'Katalog',
    href: '/katalog',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active
          ? <path d="M11 4a1 1 0 0 1 2 0v14.5a1 1 0 0 1-2 0V4zM4 7a2 2 0 0 1 2-2h3v14H6a2 2 0 0 1-2-2V7zm11-2h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3V5z" />
          : <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" /><circle cx="11" cy="11" r="0" /></>
        }
      </svg>
    ),
  },
  {
    key: 'digitalt',
    label: 'Digitalt',
    href: '/digitalt',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active
          ? <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M12 17v4" stroke="currentColor" strokeWidth="2" fill="none" /></>
          : <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" /></>
        }
      </svg>
    ),
  },
  {
    key: 'arrangementer',
    label: 'Events',
    href: '/arrangementer',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active
          ? <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" fill="none" /></>
          : <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>
        }
      </svg>
    ),
  },
  {
    key: 'min-side',
    label: 'Min side',
    href: '/min-side',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        {active
          ? <><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></>
          : <><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></>
        }
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { status } = useSession()

  // Ikke vis på admin-sider eller login
  if (pathname?.startsWith('/admin') || pathname === '/login') return null

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Spacer for å hindre at innhold skjules bak nav */}
      <div className="h-20 md:hidden" />

      {/* Navigasjon — kun mobil */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
          {TABS.map(tab => {
            const active = isActive(tab.href)
            // Vis liten dot for innlogging
            const showDot = tab.key === 'min-side' && status === 'authenticated'

            return (
              <Link
                key={tab.key}
                href={tab.href}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all relative"
                style={{
                  color: active ? 'var(--ocean, #0f3d54)' : 'var(--ink-muted, #8a9bae)',
                  minWidth: '56px',
                }}
              >
                <div className="relative">
                  {tab.icon(active)}
                  {showDot && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                      style={{ background: 'var(--forest, #2d6b4e)' }} />
                  )}
                </div>
                <span
                  className="text-[10px] font-medium leading-tight"
                  style={{
                    color: active ? 'var(--ocean, #0f3d54)' : 'var(--ink-muted, #8a9bae)',
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {tab.label}
                </span>
                {/* Aktiv indikator */}
                {active && (
                  <div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                    style={{ background: 'var(--ocean, #0f3d54)' }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
