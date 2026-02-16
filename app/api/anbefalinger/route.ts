import { NextResponse } from 'next/server'
import { hentData, lagreData } from '@/lib/persistens'

/**
 * Anbefalinger API — /api/anbefalinger
 * 
 * Støtter:
 * - Enkeltanbefalinger (type: 'enkel')
 * - Samleanbefalinger (type: 'samling') — liste med flere titler
 * - Filbasert persistens (data overlever hot-reload)
 */

export interface Anbefaling {
  id: string
  type: 'enkel' | 'samling'
  tittel: string
  forfatter: string | null        // for enkeltanbefaling
  beskrivelse: string
  bildeUrl: string | null
  publisert: boolean
  opprettet: string
  katalogId: string | null
  // Samleanbefaling-spesifikke felt
  titler?: SamlingTittel[]
}

export interface SamlingTittel {
  id: string
  tittel: string
  forfatter: string
  bildeUrl: string | null
  kommentar: string                // kort kommentar per bok
  katalogId: string | null
}

const STANDARD_DATA: Anbefaling[] = [
  {
    id: 'anb-1', type: 'enkel',
    tittel: 'Dei sju dorene',
    forfatter: 'Agnes Ravatn',
    beskrivelse: 'Ein hypnotisk roman om ei kvinne som kjoper eit gamalt hus ved Hardangerfjorden og oppdagar hemmelege rom og ei mork fortid. Ravatn skriv med ein spenning som held deg fast fraa forste til siste side.',
    bildeUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    publisert: true, opprettet: '2026-01-15T10:00:00Z', katalogId: 'bok-1',
  },
  {
    id: 'anb-2', type: 'enkel',
    tittel: 'Bergens hemmeligheter',
    forfatter: 'Gunnar Staalesen',
    beskrivelse: 'Staalesen tar oss med paa ein rundtur i Bergen vi ikkje visste eksisterte. Fraa dei skjulte smugene i Sandviken til dei loynde tunnelane under Bryggen.',
    bildeUrl: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400',
    publisert: true, opprettet: '2026-01-20T14:30:00Z', katalogId: null,
  },
  {
    id: 'anb-3', type: 'enkel',
    tittel: 'Fuglane',
    forfatter: 'Tarjei Vesaas',
    beskrivelse: 'Ein tidlaus norsk klassikar om Mattis og Hege. Vesaas sitt poetiske spraak gjer dette til ei heilt unik leseopplevving.',
    bildeUrl: null,
    publisert: true, opprettet: '2026-02-01T09:00:00Z', katalogId: null,
  },
  {
    id: 'anb-samling-1', type: 'samling',
    tittel: 'Lesetips til 1. og 2. klasse',
    forfatter: null,
    beskrivelse: 'Vaar bibliotekar Maria har plukka ut dei beste boekene for dei yngste lesarane. Perfekt for hogtlesing og forstegongslesarar!',
    bildeUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
    publisert: true, opprettet: '2026-02-05T10:00:00Z', katalogId: null,
    titler: [
      { id: 'st-1', tittel: 'Karius og Baktus', forfatter: 'Thorbjorn Egner', bildeUrl: null, kommentar: 'Tidlaus klassikar som barna elskar', katalogId: null },
      { id: 'st-2', tittel: 'Dyrene i Hakkebakkeskogen', forfatter: 'Thorbjorn Egner', bildeUrl: null, kommentar: 'Fantastisk for hogtlesing', katalogId: null },
      { id: 'st-3', tittel: 'Kubbe lager museum', forfatter: 'Ashild Kanstad Johnsen', bildeUrl: null, kommentar: 'Nydelig illustrert', katalogId: null },
      { id: 'st-4', tittel: 'Snill', forfatter: 'Gro Dahle', bildeUrl: null, kommentar: 'Viktig tematikk for smaa barn', katalogId: null },
    ],
  },
  {
    id: 'anb-samling-2', type: 'samling',
    tittel: 'Paaskekrimtips 2026',
    forfatter: null,
    beskrivelse: 'Fem spenningsboeker som passar perfekt til paaskeferien. Fraa norsk noir til internasjonal thriller.',
    bildeUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400',
    publisert: false, opprettet: '2026-02-08T16:00:00Z', katalogId: null,
    titler: [
      { id: 'st-5', tittel: 'Blodmaane', forfatter: 'Jo Nesbo', bildeUrl: null, kommentar: 'Harry Hole er tilbake', katalogId: null },
      { id: 'st-6', tittel: 'Hvit, heit ild', forfatter: 'John Ajvide Lindqvist', bildeUrl: null, kommentar: 'Skandinavisk grøssar paa sitt beste', katalogId: null },
      { id: 'st-7', tittel: 'Brent jord', forfatter: 'Jorn Lier Horst', bildeUrl: null, kommentar: 'Wisting-serien held koken', katalogId: null },
    ],
  },
]

function hentAnbefalinger(): Anbefaling[] {
  return hentData('anbefalinger', STANDARD_DATA)
}

function lagreAnbefalinger(data: Anbefaling[]) {
  lagreData('anbefalinger', data)
}

// GET
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const kunPublisert = searchParams.get('publisert')
  const type = searchParams.get('type') // 'enkel' | 'samling'

  let resultat = hentAnbefalinger()

  if (kunPublisert === 'true') resultat = resultat.filter(a => a.publisert)
  if (type) resultat = resultat.filter(a => a.type === type)

  resultat.sort((a, b) => new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime())
  return NextResponse.json(resultat)
}

// POST
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tittel, type: anbType, forfatter, beskrivelse, bildeUrl, katalogId, publisert, titler } = body

    if (!tittel || !beskrivelse) {
      return NextResponse.json({ error: 'Tittel og beskrivelse er paakrevd' }, { status: 400 })
    }

    const ny: Anbefaling = {
      id: `anb-${Date.now()}`,
      type: anbType || 'enkel',
      tittel,
      forfatter: forfatter || null,
      beskrivelse,
      bildeUrl: bildeUrl || null,
      publisert: publisert ?? false,
      opprettet: new Date().toISOString(),
      katalogId: katalogId || null,
      titler: anbType === 'samling' ? (titler || []) : undefined,
    }

    const alle = hentAnbefalinger()
    alle.push(ny)
    lagreAnbefalinger(alle)

    return NextResponse.json(ny, { status: 201 })
  } catch (error) {
    console.error('POST /api/anbefalinger error:', error)
    return NextResponse.json({ error: 'Ugyldig foresporsel' }, { status: 400 })
  }
}

// PATCH
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...oppdateringer } = body

    if (!id) return NextResponse.json({ error: 'ID er paakrevd' }, { status: 400 })

    const alle = hentAnbefalinger()
    const index = alle.findIndex(a => a.id === id)
    if (index === -1) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

    const oppdatert = { ...alle[index] }
    for (const [key, val] of Object.entries(oppdateringer)) {
      if (key in oppdatert || key === 'titler') (oppdatert as any)[key] = val
    }
    alle[index] = oppdatert
    lagreAnbefalinger(alle)

    return NextResponse.json(oppdatert)
  } catch (error) {
    return NextResponse.json({ error: 'Ugyldig foresporsel' }, { status: 400 })
  }
}

// DELETE
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID er paakrevd' }, { status: 400 })

    const alle = hentAnbefalinger()
    const index = alle.findIndex(a => a.id === id)
    if (index === -1) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

    const slettet = alle.splice(index, 1)[0]
    lagreAnbefalinger(alle)

    return NextResponse.json({ success: true, slettet: slettet.tittel })
  } catch (error) {
    return NextResponse.json({ error: 'Ugyldig foresporsel' }, { status: 400 })
  }
}
