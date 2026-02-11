import { NextResponse } from 'next/server'

let arrangementer = [
  {
    id: 'arr-1',
    tittel: 'Forfattermøte: Agnes Ravatn',
    beskrivelse: 'Agnes Ravatn kjem til Bergen for å snakke om si nye bok «Dei sju dørene». Ho vil lese utdrag og svare på spørsmål frå publikum. Det blir boksal og signering etterpå.',
    dato: '2026-03-15',
    klokkeslett: '18:00',
    sted: 'Bergen Hovedbibliotek — Store sal',
    kategori: 'Forfatterbesøk',
    bildeUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    maxDeltakere: 80,
    antallPåmeldt: 47,
    publisert: true,
    opprettet: '2026-01-20T10:00:00Z',
    serieTittel: null,
  },
  {
    id: 'arr-2',
    tittel: 'Kodeklubb for ungdom',
    beskrivelse: 'Lær grunnleggande programmering med Scratch og Python. Passer for nybegynnere i alderen 12–18 år. Ta med eigen laptop om du har — vi har også maskiner tilgjengelig.',
    dato: '2026-03-08',
    klokkeslett: '14:00',
    sted: 'Bergen Hovedbibliotek — Lille sal',
    kategori: 'Ungdomsarrangement',
    bildeUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=800',
    maxDeltakere: 20,
    antallPåmeldt: 14,
    publisert: true,
    opprettet: '2026-01-25T14:00:00Z',
    serieTittel: 'Kodeklubb våren 2026',
  },
  {
    id: 'arr-3',
    tittel: 'Eventyrtime for de minste',
    beskrivelse: 'Bli med på eventyrtime med høytlesing, sang og lek! For barn 3–6 år med foreldre. Denne gongen les vi «Karius og Baktus» og «Kaptein Sabeltann».',
    dato: '2026-03-05',
    klokkeslett: '10:30',
    sted: 'Bergen Hovedbibliotek — Barnebiblioteket',
    kategori: 'Barneaktivitet',
    bildeUrl: null,
    maxDeltakere: 30,
    antallPåmeldt: 22,
    publisert: true,
    opprettet: '2026-02-01T09:00:00Z',
    serieTittel: null,
  },
  {
    id: 'arr-4',
    tittel: 'Skriveverksted: Kreativ sakprosa',
    beskrivelse: 'Utforsk grenseland mellom fakta og fiksjon. Workshop med journalist og forfatter Frode Granhus. Du får skriveoppdrag og individuell tilbakemelding.',
    dato: '2026-03-22',
    klokkeslett: '11:00',
    sted: 'Loddefjord bibliotek',
    kategori: 'Verksted',
    bildeUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    maxDeltakere: 15,
    antallPåmeldt: 8,
    publisert: true,
    opprettet: '2026-02-05T16:00:00Z',
    serieTittel: null,
  },
  {
    id: 'arr-5',
    tittel: 'Boklubb: Skandinavisk krim',
    beskrivelse: 'Denne månaden les vi Jo Nesbøs «Blodmåne». Møt opp for diskusjon, kaffe og kake. Alle er velkomne — du treng ikkje ha lese boka for å delta!',
    dato: '2026-03-28',
    klokkeslett: '19:00',
    sted: 'Fana bibliotek',
    kategori: 'Boklubb',
    bildeUrl: null,
    maxDeltakere: null,
    antallPåmeldt: 12,
    publisert: false,
    opprettet: '2026-02-08T11:00:00Z',
    serieTittel: 'Månedens boklubb',
  },
]

export async function GET() {
  const sortert = [...arrangementer].sort(
    (a, b) => new Date(a.dato).getTime() - new Date(b.dato).getTime()
  )
  return NextResponse.json(sortert)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tittel, beskrivelse, dato, klokkeslett, sted, kategori, bildeUrl, maxDeltakere, serieTittel, publisert } = body

    if (!tittel || !dato || !klokkeslett) {
      return NextResponse.json({ error: 'Tittel, dato og klokkeslett er påkrevd' }, { status: 400 })
    }

    const nyttArr: typeof arrangementer[0] = {
      id: `arr-${Date.now()}`,
      tittel,
      beskrivelse: beskrivelse || '',
      dato,
      klokkeslett,
      sted: sted || 'Bergen Hovedbibliotek — Store sal',
      kategori: kategori || 'Annet',
      bildeUrl: bildeUrl || null,
      maxDeltakere: maxDeltakere || null,
      antallPåmeldt: 0,
      publisert: publisert ?? false,
      opprettet: new Date().toISOString(),
      serieTittel: serieTittel || null,
    }

    arrangementer.push(nyttArr)
    return NextResponse.json(nyttArr, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...oppdateringer } = body

    if (!id) return NextResponse.json({ error: 'ID er påkrevd' }, { status: 400 })

    const index = arrangementer.findIndex(a => a.id === id)
    if (index === -1) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

    const oppdatert = { ...arrangementer[index] }
    for (const [key, val] of Object.entries(oppdateringer)) {
      if (key in oppdatert) (oppdatert as any)[key] = val
    }
    arrangementer[index] = oppdatert

    return NextResponse.json(oppdatert)
  } catch (error) {
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID er påkrevd' }, { status: 400 })

    const index = arrangementer.findIndex(a => a.id === id)
    if (index === -1) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

    const slettet = arrangementer.splice(index, 1)[0]
    return NextResponse.json({ success: true, slettet: slettet.tittel })
  } catch (error) {
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
  }
}
