'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import QRLånekort from '@/components/QRLånekort'
import Toast from '@/components/Toast'

/* ───── interfaces ───── */
interface Loan { id: string; bokTittel: string; forfatter: string; utlånt: string; forfallsdato: string; filial: string; fornyet: number }
interface Reservation { id: string; bokTittel: string; forfatter: string; plassering: number; filial: string; klar: boolean }
interface Påmelding {
  id: string; arrangementId: string; navn: string; epost: string; antallPersoner: number; kommentar: string | null; påmeldt: string
  arrangement: { id: string; tittel: string; beskrivelse: string; dato: string; klokkeslett: string; sted: string; kategori: string; bildeUrl?: string | null }
}

/* ───── SVG icon helpers ───── */
const icons = {
  book: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  bookmark: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  user: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>,
  pin: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>,
  x: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  flame: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  pages: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>,
  trophy: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  lock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  mail: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  message: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
}

/* ───── Achievements data — SVG-only ───── */
const ACHIEVEMENTS = [
  { id: 1, name: 'Bokorm', desc: 'Lest 10 bøker i år', unlocked: true,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="1.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M8 7h8"/><path d="M8 11h6"/></svg> },
  { id: 2, name: 'Sosial leser', desc: 'Deltatt på 5 arrangementer', unlocked: true,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ocean)" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 3, name: 'Leseløve', desc: '7 dager på rad', unlocked: true,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--terracotta)" strokeWidth="1.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> },
  { id: 4, name: 'Utforsker', desc: 'Prøvd 3 sjangre', unlocked: true,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--fjord)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg> },
  { id: 5, name: 'Nattleser', desc: 'Lån etter kl. 22', unlocked: false,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg> },
  { id: 6, name: 'Polyglot', desc: 'Lån på 3 språk', unlocked: false,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg> },
  { id: 7, name: 'Maraton', desc: 'Lest 5 000 sider', unlocked: false,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> },
  { id: 8, name: 'Mentor', desc: 'Anbefalt 10 bøker', unlocked: false,
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg> },
]

/* ───── Tab definitions ───── */
const TABS = [
  { key: 'lån' as const, label: 'Mine lån', icon: icons.book },
  { key: 'reservasjoner' as const, label: 'Reservasjoner', icon: icons.bookmark },
  { key: 'påmeldinger' as const, label: 'Påmeldinger', icon: icons.calendar },
  { key: 'varslinger' as const, label: 'Varslinger', icon: icons.bell },
]

/* ───── Category colors for event thumbnails ───── */
const KATEGORI_FARGER: Record<string, string> = {
  'Foredrag': 'linear-gradient(135deg, var(--ocean) 0%, var(--fjord) 100%)',
  'Barn': 'linear-gradient(135deg, #e8a87c 0%, #d89563 100%)',
  'Verksted': 'linear-gradient(135deg, var(--forest) 0%, #3a8a68 100%)',
  'Forfatter': 'linear-gradient(135deg, #5b4a8a 0%, #7b6aaa 100%)',
  'Konsert': 'linear-gradient(135deg, var(--terracotta) 0%, #d97c5a 100%)',
  'Utstilling': 'linear-gradient(135deg, #2a6b7c 0%, #3d8a9e 100%)',
}

/* ───── Thumbnail components ───── */
function BookThumb({ bildeUrl, tittel }: { bildeUrl?: string | null; tittel: string }) {
  if (bildeUrl) {
    return (
      <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0"
        style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
        <img src={bildeUrl} alt={tittel} className="w-full h-full object-cover" />
      </div>
    )
  }
  return (
    <div className="w-10 h-14 rounded-lg flex-shrink-0 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, var(--ocean) 0%, var(--fjord) 100%)', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
      </svg>
    </div>
  )
}

function EventThumb({ kategori, bildeUrl }: { kategori: string; bildeUrl?: string | null }) {
  if (bildeUrl) {
    return (
      <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0"
        style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
        <img src={bildeUrl} alt="" className="w-full h-full object-cover" />
      </div>
    )
  }
  const bg = KATEGORI_FARGER[kategori] || 'linear-gradient(135deg, var(--ocean) 0%, var(--fjord) 100%)'
  return (
    <div className="w-10 h-14 rounded-lg flex-shrink-0 flex items-center justify-center"
      style={{ background: bg, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    </div>
  )
}

export default function MinSidePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lån, setLån] = useState<Loan[]>([])
  const [reservasjoner, setReservasjoner] = useState<Reservation[]>([])
  const [påmeldinger, setPåmeldinger] = useState<Påmelding[]>([])
  const [activeTab, setActiveTab] = useState<'lån' | 'reservasjoner' | 'påmeldinger' | 'varslinger'>('lån')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [isLoadingLoans, setIsLoadingLoans] = useState(true)
  const [isLoadingRes, setIsLoadingRes] = useState(true)
  const [isLoadingPåm, setIsLoadingPåm] = useState(true)
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [profilNavn, setProfilNavn] = useState('')
  const [profilEpost, setProfilEpost] = useState('')
  const [profilTelefon, setProfilTelefon] = useState('912 34 567')
  const [profilFilial, setProfilFilial] = useState('Bergen Hovedbibliotek')
  const [varslingskanal, setVarslingskanal] = useState<'epost' | 'sms' | 'push'>('epost')
  const [varslingstyper, setVarslingstyper] = useState({
    lånForfaller: true, reservasjonKlar: true, arrangementer: true, nyhetsbrev: false, anbefalinger: true,
  })
  // ── Bokomslag-oppslag fra katalog ──
  const [bokBilder, setBokBilder] = useState<Record<string, string>>({})

  const showToast = (m: string, t: 'success' | 'error' | 'info' = 'success') => { setToastMessage(m); setToastType(t) }

  useEffect(() => { if (status === 'unauthenticated') router.push('/login?callbackUrl=/min-side') }, [status, router])
  useEffect(() => {
    if (status === 'authenticated') {
      fetchLoans(); fetchRes(); fetchPåm(); fetchBokBilder()
      setProfilNavn(session?.user?.name || ''); setProfilEpost(session?.user?.email || '')
    }
  }, [status])

  const fetchLoans = async () => { try { const r = await fetch('/api/laan'); const d = await r.json(); if (Array.isArray(d)) setLån(d) } catch {} finally { setIsLoadingLoans(false) } }
  const fetchRes = async () => { try { const r = await fetch('/api/reservasjoner'); const d = await r.json(); if (Array.isArray(d)) setReservasjoner(d) } catch {} finally { setIsLoadingRes(false) } }
  const fetchPåm = async () => { try { const r = await fetch('/api/pameldinger'); const d = await r.json(); if (Array.isArray(d)) setPåmeldinger(d) } catch {} finally { setIsLoadingPåm(false) } }

  // Hent bokomslag fra katalog-API for å matche med lån/reservasjoner
  const fetchBokBilder = async () => {
    try {
      const r = await fetch('/api/katalog')
      const data = await r.json()
      if (Array.isArray(data)) {
        const map: Record<string, string> = {}
        data.forEach((bok: any) => {
          if (bok.bildeUrl) {
            map[bok.tittel.toLowerCase()] = bok.bildeUrl
          }
        })
        setBokBilder(map)
      }
    } catch {}
  }

  const getBokBilde = (tittel: string): string | null => {
    return bokBilder[tittel.toLowerCase()] || null
  }

  const handleRenew = async (id: string) => {
    try { const r = await fetch('/api/laan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lånId: id }) })
      if (r.ok) { fetchLoans(); showToast('Lånet er fornyet!') } else showToast('Kunne ikke fornye', 'error') } catch { showToast('Noe gikk galt', 'error') }
  }
  const handleAvmeld = async (id: string) => {
    if (!confirm('Avmelde fra arrangementet?')) return
    try { const r = await fetch(`/api/pameldinger?id=${id}`, { method: 'DELETE' })
      if (r.ok) { fetchPåm(); showToast('Avmeldt') } else showToast('Feil', 'error') } catch { showToast('Noe gikk galt', 'error') }
  }
  const isOverdue = (d: string) => new Date(d) < new Date()
  const daysLeft = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)

  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--white-warm)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--mist)' }}>
        <svg className="animate-pulse" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ocean)" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
      </div>
    </div>
  }

  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length
  const displayedAch = showAllAchievements ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 4)

  return (
    <div className="min-h-screen" style={{ background: 'var(--white-warm, #fdfcfa)' }}>
      <PublicHeader />

      {/* ═══════ PROFILE HEADER ═══════ */}
      <div style={{ background: 'linear-gradient(135deg, var(--ocean-deep, #0a2a3c) 0%, var(--ocean, #0f3d54) 60%, var(--fjord, #1a7a9e) 100%)' }}>
        <div className="container-custom py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {session?.user?.image
                ? <img src={session.user.image} alt="" className="w-full h-full rounded-2xl object-cover" />
                : icons.user}
            </div>
            {/* Name + meta */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {profilNavn || session?.user?.name}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(212,228,237,0.6)' }}>
                Lånekort: {(session?.user as any)?.bibliotekkortnummer || '---'} · {profilFilial}
              </p>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setShowQR(true)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zm4 0h3v3h-3zm-4 4h3v3h-3zm4 0h3v3h-3z"/></svg>
                Vis lånekort
              </button>
              <button onClick={() => setShowProfileEdit(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-[1.05]"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                {icons.edit}
              </button>
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-[1.05]"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,200,200,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {icons.logout}
              </button>
            </div>
          </div>

          {/* ─── Quick stats strip ─── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
            {[
              { label: 'Aktive lån', value: lån.length, accent: 'rgba(212,228,237,0.9)' },
              { label: 'Reservasjoner', value: reservasjoner.length, accent: 'rgba(212,228,237,0.9)' },
              { label: 'Påmeldinger', value: påmeldinger.length, accent: 'rgba(212,228,237,0.9)' },
              { label: 'Gebyrer', value: '0 kr', accent: 'rgba(130,220,170,0.9)' },
              { label: 'Lesestreak', value: '7d', accent: 'rgba(255,180,140,0.9)' },
            ].map(s => (
              <div key={s.label} className="rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(212,228,237,0.45)' }}>{s.label}</div>
                <div className="text-xl font-bold mt-0.5" style={{ fontFamily: 'var(--font-display)', color: s.accent }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="container-custom py-8 pb-16 space-y-8">

        {/* ═══════ READING PROGRESS ═══════ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Bøker i år', value: '12', sub: 'mål: 24', pct: 50, color: 'var(--ocean)',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ocean)" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg> },
            { label: 'Arrangementer', value: '5', sub: 'denne sesongen', pct: 62, color: 'var(--fjord)',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--fjord)" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
            { label: 'Lesestreak', value: '7', sub: 'dager på rad', pct: 100, color: 'var(--terracotta)',
              icon: icons.flame },
            { label: 'Sider lest', value: '3 420', sub: 'totalt', pct: 68, color: 'var(--forest)',
              icon: icons.pages },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in srgb, ${s.color} 8%, transparent)` }}>{s.icon}</div>
                <span className="text-xs font-medium" style={{ color: s.color }}>{s.pct}%</span>
              </div>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{s.value}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--ink-muted)' }}>{s.label} · {s.sub}</div>
              <div className="w-full h-1 rounded-full mt-3" style={{ background: 'var(--mist)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* ═══════ ACHIEVEMENTS ═══════ */}
        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(199,91,63,0.08)' }}>
                {icons.trophy}
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Prestasjoner</h2>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{unlockedCount} av {ACHIEVEMENTS.length} låst opp</p>
              </div>
            </div>
            <button onClick={() => setShowAllAchievements(!showAllAchievements)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'var(--mist)', color: 'var(--ink-soft)' }}>
              {showAllAchievements ? 'Vis færre' : 'Vis alle'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {displayedAch.map(a => (
              <div key={a.id} className="rounded-xl p-4 text-center transition-all"
                style={{
                  border: a.unlocked ? '1.5px solid rgba(15,61,84,0.15)' : '1.5px solid rgba(0,0,0,0.06)',
                  background: a.unlocked ? 'rgba(15,61,84,0.02)' : 'transparent',
                  opacity: a.unlocked ? 1 : 0.45,
                }}>
                <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
                  style={{ background: a.unlocked ? 'rgba(15,61,84,0.06)' : 'var(--mist)' }}>
                  {a.icon}
                </div>
                <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{a.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--ink-muted)' }}>{a.desc}</div>
                {a.unlocked ? (
                  <div className="flex items-center justify-center gap-1 mt-2 text-[10px] font-medium" style={{ color: 'var(--forest)' }}>{icons.check} Låst opp</div>
                ) : (
                  <div className="flex items-center justify-center gap-1 mt-2 text-[10px]" style={{ color: 'var(--ink-muted)' }}>{icons.lock} Låst</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ CONTENT TABS ═══════ */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="flex overflow-x-auto px-2 pt-2 gap-1" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            {TABS.map(tab => {
              const count = tab.key === 'lån' ? lån.length : tab.key === 'reservasjoner' ? reservasjoner.length : tab.key === 'påmeldinger' ? påmeldinger.length : null
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all"
                  style={{
                    color: activeTab === tab.key ? 'var(--ocean)' : 'var(--ink-muted)',
                    borderBottom: activeTab === tab.key ? '2px solid var(--ocean)' : '2px solid transparent',
                    background: activeTab === tab.key ? 'rgba(15,61,84,0.03)' : 'transparent',
                  }}>
                  {tab.icon} {tab.label}{count !== null ? ` (${count})` : ''}
                </button>
              )
            })}
          </div>

          <div className="p-6">
            {/* ─── LÅN ─── */}
            {activeTab === 'lån' && (
              isLoadingLoans ? <p className="text-center py-8 text-sm" style={{ color: 'var(--ink-muted)' }}>Laster lån...</p>
              : lån.length > 0 ? (
                <div className="space-y-3">{lån.map(loan => {
                  const dl = daysLeft(loan.forfallsdato)
                  const overdue = dl < 0
                  const soon = !overdue && dl <= 3
                  return (
                    <div key={loan.id} className="flex items-center gap-3 p-4 rounded-xl transition-all"
                      style={{
                        border: `1px solid ${overdue ? 'rgba(220,38,38,0.2)' : soon ? 'rgba(180,130,20,0.15)' : 'rgba(0,0,0,0.06)'}`,
                        background: overdue ? 'rgba(220,38,38,0.02)' : soon ? 'rgba(180,130,20,0.02)' : 'transparent',
                      }}>
                      {/* Book thumbnail */}
                      <BookThumb bildeUrl={getBokBilde(loan.bokTittel)} tittel={loan.bokTittel} />
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{loan.bokTittel}</h4>
                          <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{loan.forfatter}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--ink-muted)' }}>
                            <span className="flex items-center gap-1">{icons.pin} {loan.filial}</span>
                            <span className="font-medium" style={{
                              color: overdue ? 'var(--danger, #dc2626)' : soon ? 'var(--warning, #b07a24)' : 'var(--ink-muted)',
                            }}>
                              {overdue ? `Forfalt ${Math.abs(dl)}d siden` : soon ? `${dl}d igjen` : `Frist: ${new Date(loan.forfallsdato).toLocaleDateString('nb-NO')}`}
                            </span>
                            {loan.fornyet > 0 && <span>Fornyet {loan.fornyet}x</span>}
                          </div>
                        </div>
                        <button onClick={() => handleRenew(loan.id)} disabled={overdue}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 flex-shrink-0"
                          style={{ background: 'var(--ocean)' }}>Forny</button>
                      </div>
                    </div>
                  )
                })}</div>
              ) : <EmptyState icon={icons.book} text="Ingen aktive lån" link="/katalog" linkText="Utforsk katalogen" />
            )}

            {/* ─── RESERVASJONER ─── */}
            {activeTab === 'reservasjoner' && (
              isLoadingRes ? <p className="text-center py-8 text-sm" style={{ color: 'var(--ink-muted)' }}>Laster...</p>
              : reservasjoner.length > 0 ? (
                <div className="space-y-3">{reservasjoner.map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ border: `1px solid ${r.klar ? 'rgba(45,107,78,0.2)' : 'rgba(0,0,0,0.06)'}`, background: r.klar ? 'rgba(45,107,78,0.02)' : 'transparent' }}>
                    {/* Book thumbnail */}
                    <BookThumb bildeUrl={getBokBilde(r.bokTittel)} tittel={r.bokTittel} />
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{r.bokTittel}</h4>
                          {r.klar && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ background: 'var(--forest)' }}>Klar for henting</span>}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>{r.forfatter}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--ink-muted)' }}>
                          <span className="flex items-center gap-1">{icons.pin} {r.filial}</span>
                          {!r.klar && <span>Kø: <strong>#{r.plassering}</strong></span>}
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 hover:text-red-600 hover:border-red-200"
                        style={{ border: '1px solid rgba(0,0,0,0.1)', color: 'var(--ink-soft)' }}>Avbestill</button>
                    </div>
                  </div>
                ))}</div>
              ) : <EmptyState icon={icons.bookmark} text="Ingen reservasjoner" link="/katalog" linkText="Søk i katalogen" />
            )}

            {/* ─── PÅMELDINGER ─── */}
            {activeTab === 'påmeldinger' && (
              isLoadingPåm ? <p className="text-center py-8 text-sm" style={{ color: 'var(--ink-muted)' }}>Laster...</p>
              : påmeldinger.length > 0 ? (
                <div className="space-y-3">{påmeldinger.map(p => {
                  const dato = new Date(p.arrangement.dato); const passert = dato < new Date()
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ border: `1px solid ${passert ? 'rgba(0,0,0,0.06)' : 'rgba(15,61,84,0.12)'}`, background: passert ? 'var(--mist)' : 'rgba(15,61,84,0.02)', opacity: passert ? 0.6 : 1 }}>
                      {/* Event thumbnail */}
                      <EventThumb kategori={p.arrangement.kategori} bildeUrl={p.arrangement.bildeUrl} />
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{p.arrangement.tittel}</h4>
                            {passert && <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--ink-muted)' }}>Avholdt</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--ink-muted)' }}>
                            <span className="flex items-center gap-1">{icons.calendar} {dato.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                            <span className="flex items-center gap-1">{icons.clock} {p.arrangement.klokkeslett}</span>
                            <span className="flex items-center gap-1">{icons.pin} {p.arrangement.sted}</span>
                            <span>{p.antallPersoner} {p.antallPersoner === 1 ? 'person' : 'pers.'}</span>
                          </div>
                        </div>
                        {!passert && <button onClick={() => handleAvmeld(p.id)}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 hover:text-red-600 hover:border-red-200"
                          style={{ border: '1px solid rgba(0,0,0,0.1)', color: 'var(--ink-soft)' }}>Avmeld</button>}
                      </div>
                    </div>
                  )
                })}</div>
              ) : <EmptyState icon={icons.calendar} text="Ingen påmeldinger" link="/arrangementer" linkText="Se arrangementer" />
            )}

            {/* ─── VARSLINGER ─── */}
            {activeTab === 'varslinger' && (
              <div>
                <div className="mb-6">
                  <label className="block text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--ink-muted)' }}>Foretrukket kanal</label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { key: 'epost' as const, label: 'E-post', desc: 'Via e-post', icon: icons.mail },
                      { key: 'sms' as const, label: 'SMS', desc: 'Via SMS', icon: icons.message },
                      { key: 'push' as const, label: 'Push', desc: 'I appen', icon: icons.bell },
                    ]).map(k => (
                      <button key={k.key} onClick={() => setVarslingskanal(k.key)}
                        className="p-4 rounded-xl text-left transition-all"
                        style={{
                          border: `2px solid ${varslingskanal === k.key ? 'var(--ocean)' : 'rgba(0,0,0,0.06)'}`,
                          background: varslingskanal === k.key ? 'rgba(15,61,84,0.03)' : 'transparent',
                        }}>
                        <div style={{ color: varslingskanal === k.key ? 'var(--ocean)' : 'var(--ink-muted)' }}>{k.icon}</div>
                        <div className="text-sm font-medium mt-2" style={{ color: 'var(--ink)' }}>{k.label}</div>
                        <div className="text-[10px]" style={{ color: 'var(--ink-muted)' }}>{k.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--ink-muted)' }}>Varsler</label>
                  <div className="space-y-2">
                    {[
                      { key: 'lånForfaller', label: 'Lån som snart forfaller', desc: '3 dager før forfall' },
                      { key: 'reservasjonKlar', label: 'Reservasjon klar', desc: 'Når boken er tilgjengelig' },
                      { key: 'arrangementer', label: 'Påmeldte arrangementer', desc: 'Påminnelse dagen før' },
                      { key: 'nyhetsbrev', label: 'Nyhetsbrev', desc: 'Månedlig oppdatering' },
                      { key: 'anbefalinger', label: 'Personlige anbefalinger', desc: 'Basert på interesser' },
                    ].map(t => (
                      <label key={t.key} className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors hover:bg-gray-50"
                        style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                        <div><div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{t.label}</div><div className="text-[10px]" style={{ color: 'var(--ink-muted)' }}>{t.desc}</div></div>
                        <div className="relative">
                          <input type="checkbox" checked={varslingstyper[t.key as keyof typeof varslingstyper]}
                            onChange={e => setVarslingstyper(prev => ({ ...prev, [t.key]: e.target.checked }))} className="sr-only" />
                          <div className="w-10 h-5 rounded-full transition-colors" style={{ background: varslingstyper[t.key as keyof typeof varslingstyper] ? 'var(--ocean)' : '#d1d5db' }}>
                            <div className="w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5"
                              style={{ marginLeft: varslingstyper[t.key as keyof typeof varslingstyper] ? '22px' : '2px' }} />
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <button onClick={() => showToast(`Varslinger oppdatert — sendes via ${varslingskanal === 'epost' ? 'e-post' : varslingskanal === 'sms' ? 'SMS' : 'push'}`)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--ocean)' }}>Lagre innstillinger</button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ═══════ QR MODAL ═══════ */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(10,42,60,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowQR(false)}>
          <div className="rounded-2xl max-w-lg w-full animate-scale-in p-8"
            style={{ background: '#fff', boxShadow: '0 24px 80px rgba(10,42,60,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Digitalt lånekort</h3>
              <button onClick={() => setShowQR(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">{icons.x}</button>
            </div>
            <div className="[&>div]:rounded-2xl [&>div]:overflow-hidden">
              <QRLånekort
                userNumber={(session?.user as any)?.bibliotekkortnummer || '0000000000'}
                userName={session?.user?.name || 'Bruker'}
              />
            </div>
            <p className="text-xs text-center mt-4" style={{ color: 'var(--ink-muted)' }}>Vis denne koden i skranken for utlån</p>
          </div>
        </div>
      )}

      {/* ═══════ PROFILE EDIT MODAL ═══════ */}
      {showProfileEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(10,42,60,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowProfileEdit(false)}>
          <div className="rounded-2xl max-w-lg w-full animate-scale-in"
            style={{ background: '#fff', boxShadow: '0 24px 80px rgba(10,42,60,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Rediger profil</h3>
              <button onClick={() => setShowProfileEdit(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">{icons.x}</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Navn', value: profilNavn, set: setProfilNavn, type: 'text' },
                { label: 'E-post', value: profilEpost, set: setProfilEpost, type: 'email' },
                { label: 'Telefon', value: profilTelefon, set: setProfilTelefon, type: 'tel' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>{f.label}</label>
                  <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                    style={{ border: '1px solid rgba(0,0,0,0.08)', color: 'var(--ink)' }} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-muted)' }}>Foretrukket filial</label>
                <select value={profilFilial} onChange={e => setProfilFilial(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{ border: '1px solid rgba(0,0,0,0.08)', color: 'var(--ink)' }}>
                  <option>Bergen Hovedbibliotek</option><option>Loddefjord bibliotek</option>
                  <option>Fana bibliotek</option><option>Åsane bibliotek</option><option>Fyllingsdalen bibliotek</option>
                </select>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--mist)' }}>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Lånekort: <strong>{(session?.user as any)?.bibliotekkortnummer || '---'}</strong> — kan ikke endres her</p>
              </div>
            </div>
            <div className="p-6 flex justify-end gap-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <button onClick={() => setShowProfileEdit(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ color: 'var(--ink-soft)' }}>Avbryt</button>
              <button onClick={() => { setShowProfileEdit(false); showToast('Profil oppdatert!') }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--ocean)' }}>Lagre</button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
    </div>
  )
}

/* ───── Empty state component ───── */
function EmptyState({ icon, text, link, linkText }: { icon: React.ReactNode; text: string; link: string; linkText: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--mist)', color: 'var(--ink-muted)' }}>{icon}</div>
      <p className="text-sm mb-2" style={{ color: 'var(--ink-muted)' }}>{text}</p>
      <Link href={link} className="text-sm font-medium" style={{ color: 'var(--ocean)' }}>{linkText} →</Link>
    </div>
  )
}
