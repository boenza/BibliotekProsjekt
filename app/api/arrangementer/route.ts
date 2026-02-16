import { NextResponse } from 'next/server'
import { hentData, lagreData } from '@/lib/persistens'

/**
 * Arrangementer API — /api/arrangementer
 * 
 * Billettstyring:
 * - maxDeltakere settes automatisk fra lokasjon (kan overstyres)
 * - antallPaameldt teller paameldinger
 */

// Standard kapasitet per lokasjon
export const LOKASJON_KAPASITET: Record<string, number> = {
  'Bergen Hovedbibliotek — Store sal': 120,
  'Bergen Hovedbibliotek — Lille sal': 40,
  'Bergen Hovedbibliotek — Barnebiblioteket': 30,
  'Bergen Hovedbibliotek — Lesesalen': 25,
  'Loddefjord bibliotek': 50,
  'Fana bibliotek': 45,
  'Aasane bibliotek': 55,
  'Fyllingsdalen bibliotek': 40,
  'Digitalt (Zoom)': 500,
}

export interface Arrangement {
  id: string
  tittel: string
  beskrivelse: string
  dato: string
  klokkeslett: string
  sted: string
  kategori: string
  bildeUrl: string | null
  maxDeltakere: number
  maxOverstyrt: boolean       // true hvis manuelt overstyrt fra standard
  antallPaameldt: number
  publisert: boolean
  opprettet: string
  serieTittel: string | null
}

const STANDARD_DATA: Arrangement[] = [
  {
    id: 'arr-1',
    tittel: 'Forfattermoete: Agnes Ravatn',
    beskrivelse: 'Agnes Ravatn kjem til Bergen for aa snakke om si nye bok. Ho vil lese utdrag og svare paa spoersmaal.',
    dato: '2026-03-15', klokkeslett: '18:00',
    sted: 'Bergen Hovedbibliotek — Store sal', kategori: 'Forfatterbesoek',
    bildeUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    maxDeltakere: 120, maxOverstyrt: false, antallPaameldt: 47,
    publisert: true, opprettet: '2026-01-20T10:00:00Z', serieTittel: null,
  },
  {
    id: 'arr-2',
    tittel: 'Kodeklubb for ungdom',
    beskrivelse: 'Laer grunnleggande programmering med Scratch og Python. For nybegynnere 12-18 aar.',
    dato: '2026-03-08', klokkeslett: '14:00',
    sted: 'Bergen Hovedbibliotek — Lille sal', kategori: 'Ungdomsarrangement',
    bildeUrl: null,
    maxDeltakere: 20, maxOverstyrt: true, antallPaameldt: 14,
    publisert: true, opprettet: '2026-01-25T14:00:00Z', serieTittel: 'Kodeklubb vaaren 2026',
  },
  {
    id: 'arr-3',
    tittel: 'Eventyrtime for de minste',
    beskrivelse: 'Hogtlesing, sang og lek for barn 3-6 aar med foreldre.',
    dato: '2026-03-05', klokkeslett: '10:30',
    sted: 'Bergen Hovedbibliotek — Barnebiblioteket', kategori: 'Barneaktivitet',
    bildeUrl: null,
    maxDeltakere: 30, maxOverstyrt: false, antallPaameldt: 22,
    publisert: true, opprettet: '2026-02-01T09:00:00Z', serieTittel: null,
  },
  {
    id: 'arr-4',
    tittel: 'Skriveverksted: Kreativ sakprosa',
    beskrivelse: 'Workshop med journalist og forfatter Frode Granhus. Skriveoppdrag og tilbakemelding.',
    dato: '2026-03-22', klokkeslett: '11:00',
    sted: 'Loddefjord bibliotek', kategori: 'Verksted',
    bildeUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    maxDeltakere: 15, maxOverstyrt: true, antallPaameldt: 8,
    publisert: true, opprettet: '2026-02-05T16:00:00Z', serieTittel: null,
  },
  {
    id: 'arr-5',
    tittel: 'Boklubb: Skandinavisk krim',
    beskrivelse: 'Diskusjon, kaffe og kake. Alle er velkomne!',
    dato: '2026-03-28', klokkeslett: '19:00',
    sted: 'Fana bibliotek', kategori: 'Boklubb',
    bildeUrl: null,
    maxDeltakere: 45, maxOverstyrt: false, antallPaameldt: 12,
    publisert: false, opprettet: '2026-02-08T11:00:00Z', serieTittel: 'Maanedens boklubb',
  },
]

function hentArr(): Arrangement[] {
  return hentData('arrangementer', STANDARD_DATA)
}

function lagreArr(data: Arrangement[]) {
  lagreData('arrangementer', data)
}

export async function GET() {
  const data = hentArr()
  data.sort((a, b) => new Date(a.dato).getTime() - new Date(b.dato).getTime())
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tittel, beskrivelse, dato, klokkeslett, sted, kategori, bildeUrl, maxDeltakere, serieTittel, publisert } = body

    if (!tittel || !dato || !klokkeslett) {
      return NextResponse.json({ error: 'Tittel, dato og klokkeslett er paakrevd' }, { status: 400 })
    }

    const stedNavn = sted || 'Bergen Hovedbibliotek — Store sal'
    const standardKapasitet = LOKASJON_KAPASITET[stedNavn] || 50
    const erOverstyrt = maxDeltakere !== undefined && maxDeltakere !== null && maxDeltakere !== standardKapasitet

    const nyttArr: Arrangement = {
      id: `arr-${Date.now()}`,
      tittel,
      beskrivelse: beskrivelse || '',
      dato, klokkeslett,
      sted: stedNavn,
      kategori: kategori || 'Annet',
      bildeUrl: bildeUrl || null,
      maxDeltakere: maxDeltakere || standardKapasitet,
      maxOverstyrt: erOverstyrt,
      antallPaameldt: 0,
      publisert: publisert ?? false,
      opprettet: new Date().toISOString(),
      serieTittel: serieTittel || null,
    }

    const alle = hentArr()
    alle.push(nyttArr)
    lagreArr(alle)

    return NextResponse.json(nyttArr, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Ugyldig foresporsel' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...oppdateringer } = body
    if (!id) return NextResponse.json({ error: 'ID er paakrevd' }, { status: 400 })

    const alle = hentArr()
    const index = alle.findIndex(a => a.id === id)
    if (index === -1) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

    const oppdatert = { ...alle[index] }
    for (const [key, val] of Object.entries(oppdateringer)) {
      if (key in oppdatert) (oppdatert as any)[key] = val
    }

    // Oppdater maxOverstyrt-flagget
    if ('maxDeltakere' in oppdateringer && 'sted' in oppdatert) {
      const std = LOKASJON_KAPASITET[oppdatert.sted] || 50
      oppdatert.maxOverstyrt = oppdatert.maxDeltakere !== std
    }

    alle[index] = oppdatert
    lagreArr(alle)

    return NextResponse.json(oppdatert)
  } catch (error) {
    return NextResponse.json({ error: 'Ugyldig foresporsel' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID er paakrevd' }, { status: 400 })

    const alle = hentArr()
    const index = alle.findIndex(a => a.id === id)
    if (index === -1) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

    const slettet = alle.splice(index, 1)[0]
    lagreArr(alle)

    return NextResponse.json({ success: true, slettet: slettet.tittel })
  } catch (error) {
    return NextResponse.json({ error: 'Ugyldig foresporsel' }, { status: 400 })
  }
}
