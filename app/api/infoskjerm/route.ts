import { NextResponse } from 'next/server'
import { lagreData, hentData } from '@/lib/persistens'

// ═══════════════════════════════════════════════════════
// INFOSKJERM API — slides med persistens
// ═══════════════════════════════════════════════════════

interface SlideBase {
  id: string
  type: 'arrangement' | 'anbefaling' | 'melding'
  tittel: string
  bildeUrl: string | null
  varighet: number
  aktiv: boolean
  rekkefølge: number
}

interface ArrangementSlide extends SlideBase {
  type: 'arrangement'
  beskrivelse: string
  dato: string
  klokkeslett: string
  sted: string
  kategori: string
  påmeldingsUrl: string
}

interface AnbefalingSlide extends SlideBase {
  type: 'anbefaling'
  forfatter: string
  beskrivelse: string
  ansattNavn: string
}

interface MeldingSlide extends SlideBase {
  type: 'melding'
  tekst: string
  undertekst: string
}

type Slide = ArrangementSlide | AnbefalingSlide | MeldingSlide

const STANDARD_DATA: Slide[] = [
  {
    id: 'slide-1', type: 'arrangement',
    tittel: 'Forfattermøte: Agnes Ravatn',
    beskrivelse: 'Agnes Ravatn kjem til Bergen for å snakke om si nye bok.',
    dato: '2026-03-15', klokkeslett: '18:00', sted: 'Bergen Hovedbibliotek — Store sal',
    kategori: 'Forfatterbesøk',
    bildeUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200',
    påmeldingsUrl: '/arrangementer/arr-1',
    varighet: 12, aktiv: true, rekkefølge: 1,
  },
  {
    id: 'slide-2', type: 'anbefaling',
    tittel: 'Fuglane',
    forfatter: 'Tarjei Vesaas',
    beskrivelse: 'Ein tidlaus norsk klassikar om Mattis og Hege.',
    ansattNavn: 'Maria Solheim',
    bildeUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
    varighet: 10, aktiv: true, rekkefølge: 2,
  },
  {
    id: 'slide-3', type: 'melding',
    tittel: 'Nye åpningstider fra mars',
    tekst: 'Fra 1. mars utvider vi åpningstidene. Mandag til fredag kl. 09–21, lørdag kl. 10–17.',
    undertekst: 'Gjelder alle filialer i Bergen',
    bildeUrl: null,
    varighet: 8, aktiv: true, rekkefølge: 3,
  },
]

function getData(): Slide[] {
  return hentData<Slide[]>('infoskjerm', STANDARD_DATA)
}
function saveData(data: Slide[]): void {
  lagreData('infoskjerm', data)
}

export async function GET() {
  const data = getData()
  data.sort((a, b) => a.rekkefølge - b.rekkefølge)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = getData()
    const ny: Slide = {
      ...body,
      id: body.id || `slide-${Date.now()}`,
      aktiv: body.aktiv ?? true,
      rekkefølge: body.rekkefølge || data.length + 1,
      varighet: body.varighet || 10,
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
    const idx = data.findIndex(s => s.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
    data[idx] = { ...data[idx], ...oppdatering }
    saveData(data)
    return NextResponse.json(data[idx])
  } catch {
    return NextResponse.json({ error: 'Feil' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  // Bulk-oppdatering (rekkefølge)
  try {
    const body = await request.json()
    if (Array.isArray(body)) {
      saveData(body)
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Forventet array' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Feil' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Mangler id' }, { status: 400 })
  const data = getData().filter(s => s.id !== id)
  saveData(data)
  return NextResponse.json({ ok: true })
}
