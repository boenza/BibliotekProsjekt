import { NextResponse } from 'next/server'
import { lagreData, hentData } from '@/lib/persistens'

// ═══════════════════════════════════════════════════════
// TJENESTER API — bibliotekets tjenestetilbud
// ═══════════════════════════════════════════════════════

interface Tjeneste {
  id: string
  tittel: string
  beskrivelse: string
  kategori: string
  ikon: string
  bildeUrl: string | null
  kontaktInfo: string
  lenke: string
  publisert: boolean
  rekkefølge: number
  opprettet: string
  oppdatert: string
}

const KATEGORIER = [
  'Rom og utstyr',
  'Digitale tjenester',
  'For barn og unge',
  'For skoler og barnehager',
  'Veiledning',
  'Annet',
]

const STANDARD_DATA: Tjeneste[] = [
  {
    id: 'tj-1', tittel: 'Studierom',
    beskrivelse: 'Book studierom for gruppearbeid eller stille arbeid. Rommene har plass til 2-8 personer og er utstyrt med skjerm, whiteboard og strøm.',
    kategori: 'Rom og utstyr', ikon: 'building',
    bildeUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    kontaktInfo: 'Bestill via app eller i skranken', lenke: '/tjenester/studierom',
    publisert: true, rekkefølge: 1,
    opprettet: '2026-01-15T10:00:00Z', oppdatert: '2026-01-15T10:00:00Z',
  },
  {
    id: 'tj-2', tittel: '3D-printer',
    beskrivelse: 'Biblioteket har to 3D-printere (Prusa MK4) tilgjengelig for alle. Første print er gratis, deretter kr 5 per 10g filament. Vi hjelper deg med å forberede filene.',
    kategori: 'Rom og utstyr', ikon: 'printer',
    bildeUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
    kontaktInfo: 'Oppmøte i makerspace, 2. etasje', lenke: '/tjenester/3d-printing',
    publisert: true, rekkefølge: 2,
    opprettet: '2026-01-15T10:00:00Z', oppdatert: '2026-01-15T10:00:00Z',
  },
  {
    id: 'tj-3', tittel: 'Frøbibliotek',
    beskrivelse: 'Lån frø til hagen din! Vi har et bredt utvalg av grønnsaks-, urte- og blomsterfrø. Lever gjerne tilbake frø fra egen avling.',
    kategori: 'Annet', ikon: 'sprout',
    bildeUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    kontaktInfo: 'Frøbiblioteket finner du ved inngangspartiet', lenke: '',
    publisert: true, rekkefølge: 3,
    opprettet: '2026-01-15T10:00:00Z', oppdatert: '2026-01-15T10:00:00Z',
  },
  {
    id: 'tj-4', tittel: 'Klassesett og bokpakker til skoler',
    beskrivelse: 'Vi setter sammen bokpakker og klassesett tilpasset pensum og alder. Bestill minst 2 uker i forveien. Vi kan også komme på besøk til klassen.',
    kategori: 'For skoler og barnehager', ikon: 'backpack',
    bildeUrl: null,
    kontaktInfo: 'E-post: skole@bergenbibliotek.no', lenke: '/tjenester/skoler',
    publisert: true, rekkefølge: 4,
    opprettet: '2026-01-15T10:00:00Z', oppdatert: '2026-01-15T10:00:00Z',
  },
  {
    id: 'tj-5', tittel: 'Eventyrstund for barnehager',
    beskrivelse: 'Vi tilbyr faste eventyrstunder for barnehager. Kombinerer høytlesing, sang og enkel dramatisering. Passer for 3-6 år.',
    kategori: 'For barn og unge', ikon: 'book',
    bildeUrl: null,
    kontaktInfo: 'Bestilles via skjema på nettsiden', lenke: '/tjenester/barnehage',
    publisert: true, rekkefølge: 5,
    opprettet: '2026-01-15T10:00:00Z', oppdatert: '2026-01-15T10:00:00Z',
  },
  {
    id: 'tj-6', tittel: 'Hjelp til informasjonssøking og kildekritikk',
    beskrivelse: 'Bibliotekarene hjelper deg med å finne pålitelige kilder til oppgaver, forskning eller personlig bruk. Vi tilbyr også kurs i kildekritikk.',
    kategori: 'Veiledning', ikon: 'search',
    bildeUrl: null,
    kontaktInfo: 'Oppmøte i skranken eller bestill time', lenke: '',
    publisert: true, rekkefølge: 6,
    opprettet: '2026-01-15T10:00:00Z', oppdatert: '2026-01-15T10:00:00Z',
  },
  {
    id: 'tj-7', tittel: 'Kopi og utskrift',
    beskrivelse: 'Skriv ut dokumenter i A4 og A3, farger eller svart-hvitt. Kopiering tilgjengelig. Betaling med kort eller Vipps.',
    kategori: 'Rom og utstyr', ikon: 'printer',
    bildeUrl: null,
    kontaktInfo: 'Selvbetjent i 1. etasje', lenke: '',
    publisert: true, rekkefølge: 7,
    opprettet: '2026-01-15T10:00:00Z', oppdatert: '2026-01-15T10:00:00Z',
  },
  {
    id: 'tj-8', tittel: 'Digitale kurs for seniorer',
    beskrivelse: 'Lær å bruke nettbrett, smarttelefon, nettbank og offentlige tjenester. Gratis kurs hver onsdag kl. 12-14.',
    kategori: 'Digitale tjenester', ikon: 'phone',
    bildeUrl: null,
    kontaktInfo: 'Påmelding i skranken eller ring 55 56 85 60', lenke: '/tjenester/digitale-kurs',
    publisert: true, rekkefølge: 8,
    opprettet: '2026-01-15T10:00:00Z', oppdatert: '2026-01-15T10:00:00Z',
  },
]

function getData(): Tjeneste[] {
  return hentData<Tjeneste[]>('tjenester', STANDARD_DATA)
}
function saveData(data: Tjeneste[]): void {
  lagreData('tjenester', data)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const publisert = searchParams.get('publisert')
  let data = getData()
  if (publisert === 'true') data = data.filter(t => t.publisert)
  data.sort((a, b) => a.rekkefølge - b.rekkefølge)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = getData()
    const ny: Tjeneste = {
      id: `tj-${Date.now()}`,
      tittel: body.tittel || 'Ny tjeneste',
      beskrivelse: body.beskrivelse || '',
      kategori: body.kategori || KATEGORIER[0],
      ikon: body.ikon || 'clipboard',
      bildeUrl: body.bildeUrl || null,
      kontaktInfo: body.kontaktInfo || '',
      lenke: body.lenke || '',
      publisert: body.publisert ?? false,
      rekkefølge: data.length + 1,
      opprettet: new Date().toISOString(),
      oppdatert: new Date().toISOString(),
    }
    data.push(ny)
    saveData(data)
    return NextResponse.json(ny, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Ugyldig data' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...oppdatering } = body
    if (!id) return NextResponse.json({ error: 'Mangler id' }, { status: 400 })
    const data = getData()
    const idx = data.findIndex(t => t.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
    data[idx] = { ...data[idx], ...oppdatering, oppdatert: new Date().toISOString() }
    saveData(data)
    return NextResponse.json(data[idx])
  } catch {
    return NextResponse.json({ error: 'Feil' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Mangler id' }, { status: 400 })
  const data = getData().filter(t => t.id !== id)
  saveData(data)
  return NextResponse.json({ ok: true })
}
