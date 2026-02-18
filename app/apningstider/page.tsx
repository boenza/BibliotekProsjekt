'use client'

import { useState, useEffect, useMemo } from 'react'
import PublicHeader from '@/components/PublicHeader'

/* ═══════ BRANCH DATA ═══════ */
interface DagTid {
  dag: string
  åpner: string | null // null = stengt
  stenger: string | null
}

interface MeråpentTid {
  dager: string
  åpner: string
  stenger: string
}

interface Filial {
  id: string
  navn: string
  adresse: string
  telefon: string
  type: 'hoved' | 'bydel' | 'barn'
  gruppe?: string // e.g. "Årstadbibliotekene"
  åpningstider: DagTid[]
  meråpent?: MeråpentTid[]
  innlevering?: string
  merknad?: string
}

const FILIALER: Filial[] = [
  {
    id: 'hovedbiblioteket',
    navn: 'Hovedbiblioteket',
    adresse: 'Strømgaten 6, 5015 Bergen',
    telefon: '55 56 85 00',
    type: 'hoved',
    åpningstider: [
      { dag: 'Mandag', åpner: '09:00', stenger: '20:00' },
      { dag: 'Tirsdag', åpner: '09:00', stenger: '20:00' },
      { dag: 'Onsdag', åpner: '09:00', stenger: '20:00' },
      { dag: 'Torsdag', åpner: '09:00', stenger: '20:00' },
      { dag: 'Fredag', åpner: '09:00', stenger: '17:00' },
      { dag: 'Lørdag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Søndag', åpner: '12:00', stenger: '16:00' },
    ],
    innlevering: 'Innleveringsautomat ved inngangen mot Bystasjonen — alltid tilgjengelig utenom åpningstid.',
  },
  {
    id: 'fana',
    navn: 'Fana bibliotek',
    adresse: 'Tokanten, Nesttunveien 102, 5221 Nesttun',
    telefon: '55 56 85 00',
    type: 'bydel',
    åpningstider: [
      { dag: 'Mandag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Tirsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Onsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Torsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Fredag', åpner: '10:00', stenger: '16:30' },
      { dag: 'Lørdag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Søndag', åpner: null, stenger: null },
    ],
    meråpent: [
      { dager: 'Mandag – søndag', åpner: '07:00', stenger: '22:00' },
    ],
    innlevering: 'Døgnåpen luke ved inngangen.',
  },
  {
    id: 'fyllingsdalen',
    navn: 'Fyllingsdalen bibliotek',
    adresse: 'Folke Bernadottes vei 52, 5147 Fyllingsdalen',
    telefon: '55 56 85 00',
    type: 'bydel',
    åpningstider: [
      { dag: 'Mandag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Tirsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Onsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Torsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Fredag', åpner: '10:00', stenger: '16:30' },
      { dag: 'Lørdag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Søndag', åpner: null, stenger: null },
    ],
    innlevering: 'Kasse utenfor biblioteket i senterets åpningstid.',
  },
  {
    id: 'laksevag',
    navn: 'Laksevåg bibliotek',
    adresse: 'Damsgårdsallmenningen 1, 5160 Laksevåg',
    telefon: '55 56 85 00',
    type: 'bydel',
    åpningstider: [
      { dag: 'Mandag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Tirsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Onsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Torsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Fredag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Lørdag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Søndag', åpner: null, stenger: null },
    ],
    meråpent: [
      { dager: 'Mandag – søndag', åpner: '07:00', stenger: '22:00' },
    ],
    innlevering: 'Kasse utenfor biblioteket etter stengetid.',
  },
  {
    id: 'loddefjord',
    navn: 'Loddefjord bibliotek',
    adresse: 'Iskanten, Lyderhornsveien 353, 5171 Loddefjord',
    telefon: '55 56 85 00',
    type: 'bydel',
    åpningstider: [
      { dag: 'Mandag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Tirsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Onsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Torsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Fredag', åpner: '10:00', stenger: '16:30' },
      { dag: 'Lørdag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Søndag', åpner: null, stenger: null },
    ],
    meråpent: [
      { dager: 'Mandag – fredag', åpner: '07:00', stenger: '22:00' },
      { dager: 'Lørdag', åpner: '08:00', stenger: '22:00' },
      { dager: 'Søndag', åpner: '10:00', stenger: '22:00' },
    ],
    innlevering: 'Kasse utenfor biblioteket i senterets åpningstid.',
  },
  {
    id: 'landas',
    navn: 'Landås bibliotek',
    adresse: 'Nattlandsveien 76 A, 5094 Bergen',
    telefon: '55 56 85 00',
    type: 'bydel',
    gruppe: 'Årstadbibliotekene',
    åpningstider: [
      { dag: 'Mandag', åpner: '12:00', stenger: '19:00' },
      { dag: 'Tirsdag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Onsdag', åpner: '12:00', stenger: '19:00' },
      { dag: 'Torsdag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Fredag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Lørdag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Søndag', åpner: null, stenger: null },
    ],
  },
  {
    id: 'barnas-biblab',
    navn: 'Barnas BibLab',
    adresse: 'Vilhelm Bjerknes\' vei 4, 5081 Bergen',
    telefon: '55 56 85 00',
    type: 'barn',
    gruppe: 'Årstadbibliotekene',
    merknad: 'For deg mellom 6 og 13 år',
    åpningstider: [
      { dag: 'Mandag', åpner: '12:00', stenger: '18:00' },
      { dag: 'Tirsdag', åpner: '12:00', stenger: '18:00' },
      { dag: 'Onsdag', åpner: '12:00', stenger: '18:00' },
      { dag: 'Torsdag', åpner: '12:00', stenger: '18:00' },
      { dag: 'Fredag', åpner: '12:00', stenger: '16:00' },
      { dag: 'Lørdag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Søndag', åpner: null, stenger: null },
    ],
    innlevering: 'Kasse utenfor biblioteket i senterets åpningstid.',
  },
  {
    id: 'ny-krohnborg',
    navn: 'Ny-Krohnborg fellesbibliotek',
    adresse: 'Rogagaten 9, 5055 Bergen',
    telefon: '55 56 85 00',
    type: 'bydel',
    gruppe: 'Årstadbibliotekene',
    merknad: 'Lørdag: åpent i partallsuker',
    åpningstider: [
      { dag: 'Mandag', åpner: '12:00', stenger: '16:00' },
      { dag: 'Tirsdag', åpner: '12:00', stenger: '19:00' },
      { dag: 'Onsdag', åpner: '12:00', stenger: '16:00' },
      { dag: 'Torsdag', åpner: '12:00', stenger: '19:00' },
      { dag: 'Fredag', åpner: '12:00', stenger: '16:00' },
      { dag: 'Lørdag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Søndag', åpner: null, stenger: null },
    ],
  },
  {
    id: 'asane',
    navn: 'Åsane bibliotek',
    adresse: 'Åsane Senter 52, 5116 Ulset',
    telefon: '55 56 85 00',
    type: 'bydel',
    åpningstider: [
      { dag: 'Mandag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Tirsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Onsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Torsdag', åpner: '10:00', stenger: '19:00' },
      { dag: 'Fredag', åpner: '10:00', stenger: '16:30' },
      { dag: 'Lørdag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Søndag', åpner: null, stenger: null },
    ],
    meråpent: [
      { dager: 'Mandag – søndag', åpner: '07:00', stenger: '22:00' },
    ],
    innlevering: 'Innleveringskasse utenom bibliotekets åpningstid.',
  },
  {
    id: 'ytre-arna',
    navn: 'Ytre Arna bibliotek',
    adresse: 'Kulturhuset Sentrum, Peter Jebsens vei 4, 5265 Ytre Arna',
    telefon: '55 56 85 00',
    type: 'bydel',
    åpningstider: [
      { dag: 'Mandag', åpner: '12:00', stenger: '19:00' },
      { dag: 'Tirsdag', åpner: '12:00', stenger: '19:00' },
      { dag: 'Onsdag', åpner: null, stenger: null },
      { dag: 'Torsdag', åpner: '10:00', stenger: '15:00' },
      { dag: 'Fredag', åpner: null, stenger: null },
      { dag: 'Lørdag', åpner: '10:00', stenger: '16:00' },
      { dag: 'Søndag', åpner: null, stenger: null },
    ],
  },
]

/* ═══════ TIME HELPERS ═══════ */
const DAGER = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag']

function getNow() {
  // Use Norwegian timezone
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('nb-NO', {
    timeZone: 'Europe/Oslo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const dagFormatter = new Intl.DateTimeFormat('nb-NO', {
    timeZone: 'Europe/Oslo',
    weekday: 'long',
  })
  const timeStr = formatter.format(now)
  const dagStr = dagFormatter.format(now)
  // Capitalize first letter
  const dag = dagStr.charAt(0).toUpperCase() + dagStr.slice(1)
  return { dag, time: timeStr, minutterTotalt: parseInt(timeStr.split(':')[0]) * 60 + parseInt(timeStr.split(':')[1]) }
}

function tidTilMinutter(tid: string): number {
  const [h, m] = tid.split(':').map(Number)
  return h * 60 + m
}

type StatusType = 'åpent' | 'stenger-snart' | 'stengt' | 'meråpent'

interface FilialStatus {
  status: StatusType
  label: string
  stenger?: string
  minutter_igjen?: number
}

function getFilialStatus(filial: Filial, nå: { dag: string; minutterTotalt: number }): FilialStatus {
  const dagTid = filial.åpningstider.find(d => d.dag === nå.dag)

  // Check regular hours
  if (dagTid?.åpner && dagTid?.stenger) {
    const åpner = tidTilMinutter(dagTid.åpner)
    const stenger = tidTilMinutter(dagTid.stenger)
    if (nå.minutterTotalt >= åpner && nå.minutterTotalt < stenger) {
      const igjen = stenger - nå.minutterTotalt
      if (igjen <= 60) {
        return {
          status: 'stenger-snart',
          label: `Stenger kl. ${dagTid.stenger}`,
          stenger: dagTid.stenger,
          minutter_igjen: igjen,
        }
      }
      return { status: 'åpent', label: `Åpent til ${dagTid.stenger}`, stenger: dagTid.stenger }
    }
  }

  // Check meråpent hours
  if (filial.meråpent) {
    for (const m of filial.meråpent) {
      const åpner = tidTilMinutter(m.åpner)
      const stenger = tidTilMinutter(m.stenger)
      if (nå.minutterTotalt >= åpner && nå.minutterTotalt < stenger) {
        // Check if "dager" covers today
        const dagerStr = m.dager.toLowerCase()
        const erDekkende =
          dagerStr.includes('søndag') ||
          dagerStr.includes(nå.dag.toLowerCase()) ||
          dagerStr.includes('mandag – søndag') ||
          dagerStr.includes('mandag – fredag') && ['Mandag','Tirsdag','Onsdag','Torsdag','Fredag'].includes(nå.dag) ||
          dagerStr.includes('lørdag') && nå.dag === 'Lørdag'
        if (erDekkende) {
          return { status: 'meråpent', label: `Meråpent til ${m.stenger}`, stenger: m.stenger }
        }
      }
    }
  }

  // Find next opening
  const dagIndex = DAGER.indexOf(nå.dag)
  // Check if opening later today
  if (dagTid?.åpner) {
    const åpner = tidTilMinutter(dagTid.åpner)
    if (nå.minutterTotalt < åpner) {
      return { status: 'stengt', label: `Åpner kl. ${dagTid.åpner} i dag` }
    }
  }
  // Find next day with hours
  for (let i = 1; i <= 7; i++) {
    const nextDagIdx = (dagIndex + i) % 7
    const nextDag = DAGER[nextDagIdx]
    const nextTid = filial.åpningstider.find(d => d.dag === nextDag)
    if (nextTid?.åpner) {
      const dagNavn = i === 1 ? 'i morgen' : nextDag.toLowerCase()
      return { status: 'stengt', label: `Åpner ${dagNavn} kl. ${nextTid.åpner}` }
    }
  }

  return { status: 'stengt', label: 'Stengt' }
}

/* ═══════ ICONS ═══════ */
const icons = {
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  mapPin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  phone: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>,
  return: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H8"/></svg>,
  key: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>,
  children: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="2"/><path d="m14 20-2-8-2 8"/><path d="M6 12h12"/><path d="M12 12v-4"/></svg>,
  info: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
  chevron: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
}

/* ═══════ STATUS BADGE COMPONENT ═══════ */
function StatusBadge({ status }: { status: FilialStatus }) {
  const styles: Record<StatusType, { bg: string; text: string; dot: string; pulse?: boolean }> = {
    'åpent': {
      bg: 'rgba(45, 107, 78, 0.08)',
      text: 'var(--forest, #2d6b4e)',
      dot: '#2d6b4e',
      pulse: true,
    },
    'stenger-snart': {
      bg: 'rgba(217, 119, 6, 0.08)',
      text: '#b45309',
      dot: '#d97706',
      pulse: true,
    },
    'meråpent': {
      bg: 'rgba(15, 61, 84, 0.06)',
      text: 'var(--ocean, #0f3d54)',
      dot: '#1a7a9e',
      pulse: true,
    },
    'stengt': {
      bg: 'rgba(0, 0, 0, 0.04)',
      text: 'var(--ink-muted, #8a9aa8)',
      dot: '#b0bec5',
    },
  }
  const s = styles[status.status]
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="relative flex h-2 w-2">
        {s.pulse && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: s.dot }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: s.dot }}
        />
      </span>
      {status.status === 'åpent' ? 'Åpent nå' : status.status === 'stenger-snart' ? 'Stenger snart' : status.status === 'meråpent' ? 'Meråpent' : 'Stengt'}
    </span>
  )
}

/* ═══════ CLOSING COUNTDOWN BAR ═══════ */
function CountdownBar({ minutterIgjen }: { minutterIgjen: number }) {
  // 60 min = full bar -> 0 min = empty bar
  const pct = Math.max(0, Math.min(100, (minutterIgjen / 60) * 100))
  const color = minutterIgjen <= 15 ? '#dc2626' : minutterIgjen <= 30 ? '#d97706' : '#2d6b4e'
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

/* ═══════ FILIAL CARD ═══════ */
function FilialCard({ filial, nå }: { filial: Filial; nå: { dag: string; minutterTotalt: number } }) {
  const [expanded, setExpanded] = useState(false)
  const status = useMemo(() => getFilialStatus(filial, nå), [filial, nå])
  const dagIndex = DAGER.indexOf(nå.dag)

  // Sort days to start from today
  const sortedDager = useMemo(() => {
    const idx = filial.åpningstider.findIndex(d => d.dag === nå.dag)
    if (idx === -1) return filial.åpningstider
    return [...filial.åpningstider.slice(idx), ...filial.åpningstider.slice(0, idx)]
  }, [filial.åpningstider, nå.dag])

  const typeIcon = filial.type === 'hoved' ? icons.star : filial.type === 'barn' ? icons.children : icons.mapPin
  const typeColor = filial.type === 'hoved' ? 'var(--ocean, #0f3d54)' : filial.type === 'barn' ? 'var(--forest, #2d6b4e)' : 'var(--ink-muted, #8a9aa8)'

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: '#fff',
        border: status.status === 'åpent' ? '1px solid rgba(45,107,78,0.15)' : status.status === 'stenger-snart' ? '1px solid rgba(217,119,6,0.15)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: status.status === 'åpent' || status.status === 'stenger-snart' ? '0 2px 12px rgba(0,0,0,0.04)' : 'none',
      }}
    >
      {/* Main row */}
      <button
        className="w-full text-left p-4 sm:p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Type icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: status.status === 'åpent' ? 'rgba(45,107,78,0.08)' : status.status === 'stenger-snart' ? 'rgba(217,119,6,0.06)' : 'rgba(0,0,0,0.04)',
            color: status.status === 'åpent' ? 'var(--forest)' : status.status === 'stenger-snart' ? '#b45309' : typeColor,
          }}
        >
          {typeIcon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h3
                className="font-bold text-base leading-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink, #1a2a35)' }}
              >
                {filial.navn}
              </h3>
              {filial.merknad && (
                <span className="text-[11px] font-medium mt-0.5 block" style={{ color: 'var(--fjord, #1a7a9e)' }}>{filial.merknad}</span>
              )}
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Today's line + closing info */}
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted, #8a9aa8)' }}>
            {status.label}
          </p>

          {/* Countdown bar when closing within 60 min */}
          {status.status === 'stenger-snart' && status.minutter_igjen !== undefined && (
            <div className="mt-2 max-w-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium" style={{ color: '#b45309' }}>
                  {status.minutter_igjen} min igjen
                </span>
                <span className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>
                  Stenger {status.stenger}
                </span>
              </div>
              <CountdownBar minutterIgjen={status.minutter_igjen} />
            </div>
          )}

          {/* Address line */}
          <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: 'var(--ink-muted)' }}>
            {icons.mapPin}
            <span>{filial.adresse}</span>
          </div>
        </div>

        {/* Expand chevron */}
        <div
          className="flex-shrink-0 mt-1 transition-transform duration-300"
          style={{
            color: 'var(--ink-muted)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          {icons.chevron}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div
          className="px-4 sm:px-5 pb-5 pt-0 animate-fade-in"
          style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}
        >
          {/* Weekly schedule */}
          <div className="mt-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-muted)' }}>
              Ukens åpningstider
            </h4>
            <div className="space-y-1">
              {sortedDager.map((d, i) => {
                const erIDag = d.dag === nå.dag
                const erStengt = !d.åpner
                return (
                  <div
                    key={d.dag}
                    className="flex items-center justify-between py-2 px-3 rounded-lg transition-colors"
                    style={{
                      background: erIDag ? 'rgba(15,61,84,0.04)' : 'transparent',
                    }}
                  >
                    <span
                      className="text-sm"
                      style={{
                        color: erIDag ? 'var(--ocean)' : 'var(--ink-soft, #4a5e6d)',
                        fontWeight: erIDag ? 600 : 400,
                      }}
                    >
                      {d.dag}
                      {erIDag && (
                        <span className="text-[10px] ml-1.5 uppercase tracking-wider font-semibold" style={{ color: 'var(--fjord)' }}>
                          i dag
                        </span>
                      )}
                    </span>
                    <span
                      className="text-sm tabular-nums"
                      style={{
                        color: erStengt ? 'var(--ink-muted)' : erIDag ? 'var(--ocean)' : 'var(--ink-soft)',
                        fontWeight: erIDag ? 600 : 400,
                      }}
                    >
                      {erStengt ? 'Stengt' : `${d.åpner} – ${d.stenger}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Meråpent section */}
          {filial.meråpent && filial.meråpent.length > 0 && (
            <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(15,61,84,0.03)', border: '1px solid rgba(15,61,84,0.08)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: 'var(--ocean)' }}>{icons.key}</span>
                <h4 className="text-xs font-semibold" style={{ color: 'var(--ocean)' }}>Meråpent bibliotek</h4>
              </div>
              <p className="text-[11px] mb-2" style={{ color: 'var(--ink-muted)' }}>
                Tilgang utenom vanlig åpningstid — krever signert kontrakt
              </p>
              {filial.meråpent.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1">
                  <span style={{ color: 'var(--ink-soft)' }}>{m.dager}</span>
                  <span className="tabular-nums font-medium" style={{ color: 'var(--ocean)' }}>{m.åpner} – {m.stenger}</span>
                </div>
              ))}
            </div>
          )}

          {/* Contact & return info */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-muted)' }}>
              {icons.phone}
              <span>{filial.telefon}</span>
            </div>
            {filial.innlevering && (
              <div className="flex items-start gap-1.5 text-xs flex-1 min-w-[200px]" style={{ color: 'var(--ink-muted)' }}>
                {icons.return}
                <span>{filial.innlevering}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════ SUMMARY STAT ═══════ */
function SummaryStats({ filialer, nå }: { filialer: Filial[]; nå: { dag: string; minutterTotalt: number } }) {
  const statuses = filialer.map(f => getFilialStatus(f, nå))
  const antallÅpne = statuses.filter(s => s.status === 'åpent' || s.status === 'stenger-snart').length
  const antallMeråpne = statuses.filter(s => s.status === 'meråpent').length
  const antallStengt = statuses.filter(s => s.status === 'stengt').length

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <div className="rounded-xl p-4 text-center" style={{ background: antallÅpne > 0 ? 'rgba(45,107,78,0.06)' : 'rgba(0,0,0,0.03)', border: '1px solid rgba(45,107,78,0.1)' }}>
        <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--forest, #2d6b4e)', fontFamily: 'var(--font-display)' }}>{antallÅpne}</div>
        <div className="text-[11px] font-medium uppercase tracking-wider mt-1" style={{ color: 'var(--forest)' }}>Åpne nå</div>
      </div>
      <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(15,61,84,0.04)', border: '1px solid rgba(15,61,84,0.08)' }}>
        <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--ocean, #0f3d54)', fontFamily: 'var(--font-display)' }}>{antallMeråpne}</div>
        <div className="text-[11px] font-medium uppercase tracking-wider mt-1" style={{ color: 'var(--ocean)' }}>Meråpne</div>
      </div>
      <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--ink-muted, #8a9aa8)', fontFamily: 'var(--font-display)' }}>{antallStengt}</div>
        <div className="text-[11px] font-medium uppercase tracking-wider mt-1" style={{ color: 'var(--ink-muted)' }}>Stengt</div>
      </div>
    </div>
  )
}

/* ═══════ MAIN PAGE ═══════ */
export default function ÅpningstiderPage() {
  const [nå, setNå] = useState(getNow)
  const [filter, setFilter] = useState<'alle' | 'åpne' | 'meråpent'>('alle')

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setNå(getNow()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const filteredFilialer = useMemo(() => {
    if (filter === 'alle') return FILIALER
    return FILIALER.filter(f => {
      const s = getFilialStatus(f, nå)
      if (filter === 'åpne') return s.status === 'åpent' || s.status === 'stenger-snart'
      if (filter === 'meråpent') return s.status === 'meråpent'
      return true
    })
  }, [filter, nå])

  // Sort: open first, closing soon second, meråpent third, closed last
  const sortedFilialer = useMemo(() => {
    const order: Record<StatusType, number> = { 'åpent': 0, 'stenger-snart': 1, 'meråpent': 2, 'stengt': 3 }
    return [...filteredFilialer].sort((a, b) => {
      const sa = getFilialStatus(a, nå)
      const sb = getFilialStatus(b, nå)
      return order[sa.status] - order[sb.status]
    })
  }, [filteredFilialer, nå])

  return (
    <div className="min-h-screen" style={{ background: 'var(--white-warm, #fdfcfa)' }}>
      <PublicHeader />

      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg, var(--ocean-deep, #0a2a3c) 0%, var(--ocean, #0f3d54) 100%)' }}>
        <div className="container-custom py-10 md:py-14">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(212,228,237,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold text-white tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Åpningstider
              </h1>
              <p className="text-sm" style={{ color: 'rgba(212,228,237,0.6)' }}>
                {nå.dag} {nå.time} — Alle {FILIALER.length} bibliotek i Bergen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container-custom py-8 pb-16 space-y-6">
        {/* Summary */}
        <SummaryStats filialer={FILIALER} nå={nå} />

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {[
            { key: 'alle' as const, label: `Alle (${FILIALER.length})` },
            { key: 'åpne' as const, label: 'Åpne nå' },
            { key: 'meråpent' as const, label: 'Meråpent' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background: filter === f.key ? 'var(--ocean)' : 'white',
                color: filter === f.key ? '#fff' : 'var(--ink-soft)',
                border: filter === f.key ? 'none' : '1px solid rgba(0,0,0,0.08)',
                boxShadow: filter === f.key ? '0 2px 8px rgba(15,61,84,0.25)' : 'none',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Info bar */}
        <div className="flex items-center gap-2 p-3 rounded-xl text-xs" style={{ background: 'rgba(15,61,84,0.03)', color: 'var(--ink-muted)' }}>
          <span style={{ color: 'var(--ocean)' }}>{icons.phone}</span>
          <span>Felles sentralbord: <strong style={{ color: 'var(--ink-soft)' }}>55 56 85 00</strong> (mandag–fredag kl. 10–12)</span>
        </div>

        {/* Library cards */}
        <div className="space-y-3">
          {sortedFilialer.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                Ingen bibliotek matcher filteret akkurat nå
              </p>
              <button
                onClick={() => setFilter('alle')}
                className="mt-3 text-sm font-medium"
                style={{ color: 'var(--ocean)' }}
              >
                Vis alle bibliotek
              </button>
            </div>
          ) : (
            sortedFilialer.map(filial => (
              <FilialCard key={filial.id} filial={filial} nå={nå} />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
