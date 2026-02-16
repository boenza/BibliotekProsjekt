import { NextRequest, NextResponse } from 'next/server'
import { hentData, lagreData } from '@/lib/persistens'

// ───── Bildeoverrides (persistens) ─────
function hentBildeOverrides(): Record<string, string> {
  return hentData('katalog-bilder', {})
}
function lagreBildeOverrides(data: Record<string, string>) {
  lagreData('katalog-bilder', data)
}

// ───── Eksemplar-type ─────
interface Eksemplar {
  filial: string
  språk: string
  format: string
  status: 'Tilgjengelig' | 'Utlånt'
  antall: number
}

// Testdata med Agnes Ravatn "Dei sju dørene" i flere formater/språk (brukertest krav)
const katalogBøker = [
  {
    id: 'bok-001',
    tittel: 'Dei sju dørene',
    forfatter: 'Agnes Ravatn',
    sjanger: 'Roman',
    isbn: '9788252199772',
    bildeUrl: null as string | null,
    språk: ['Norsk (nynorsk)', 'Engelsk'],
    formater: ['Papirbok', 'Lydbok', 'E-bok'],
    tilgjengelighet: [
      { filial: 'Bergen Hovedbibliotek', status: 'Tilgjengelig', antall: 3 },
      { filial: 'Loddefjord bibliotek', status: 'Tilgjengelig', antall: 2 },
      { filial: 'Fana bibliotek', status: 'Utlånt', antall: 0 },
      { filial: 'Åsane bibliotek', status: 'Tilgjengelig', antall: 1 },
      { filial: 'Fyllingsdalen bibliotek', status: 'Tilgjengelig', antall: 1 },
    ],
    eksemplarer: [
      // Norsk (nynorsk) — Papirbok
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 2 },
      { filial: 'Loddefjord bibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Fana bibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Utlånt' as const, antall: 0 },
      { filial: 'Åsane bibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Fyllingsdalen bibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      // Norsk (nynorsk) — Lydbok
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (nynorsk)', format: 'Lydbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Loddefjord bibliotek', språk: 'Norsk (nynorsk)', format: 'Lydbok', status: 'Tilgjengelig' as const, antall: 1 },
      // Norsk (nynorsk) — E-bok (digital, alltid tilgjengelig)
      { filial: 'Digitalt', språk: 'Norsk (nynorsk)', format: 'E-bok', status: 'Tilgjengelig' as const, antall: 1 },
      // Engelsk — kun Papirbok
      { filial: 'Bergen Hovedbibliotek', språk: 'Engelsk', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Loddefjord bibliotek', språk: 'Engelsk', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
    ] as Eksemplar[],
    beskrivelse: 'Ein roman om hemmeligheter, identitet og kva som skjer når fortida innhentar deg. Agnes Ravatn skriv om ei kvinne som oppdagar at naboen kanskje ikkje er den ho gir seg ut for å vere.',
    utgitt: '2023',
  },
  {
    id: 'bok-002',
    tittel: 'Fugletribunalet',
    forfatter: 'Agnes Ravatn',
    sjanger: 'Roman',
    isbn: '9788252186024',
    bildeUrl: null as string | null,
    språk: ['Norsk (nynorsk)', 'Engelsk', 'Tysk'],
    formater: ['Papirbok', 'E-bok'],
    tilgjengelighet: [
      { filial: 'Bergen Hovedbibliotek', status: 'Tilgjengelig', antall: 2 },
      { filial: 'Loddefjord bibliotek', status: 'Tilgjengelig', antall: 1 },
    ],
    eksemplarer: [
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 2 },
      { filial: 'Loddefjord bibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Digitalt', språk: 'Norsk (nynorsk)', format: 'E-bok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Bergen Hovedbibliotek', språk: 'Engelsk', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Digitalt', språk: 'Engelsk', format: 'E-bok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Bergen Hovedbibliotek', språk: 'Tysk', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
    ] as Eksemplar[],
    beskrivelse: 'Ein spenningsroman om skuld, skam og behovet for å starte på nytt.',
    utgitt: '2013',
  },
  {
    id: 'bok-003',
    tittel: 'Operasjon Sjølvdisiplin',
    forfatter: 'Agnes Ravatn',
    sjanger: 'Sakprosa',
    isbn: '9788252170931',
    bildeUrl: null as string | null,
    språk: ['Norsk (nynorsk)'],
    formater: ['Papirbok', 'Lydbok'],
    tilgjengelighet: [
      { filial: 'Bergen Hovedbibliotek', status: 'Tilgjengelig', antall: 1 },
    ],
    eksemplarer: [
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (nynorsk)', format: 'Lydbok', status: 'Tilgjengelig' as const, antall: 1 },
    ] as Eksemplar[],
    beskrivelse: 'Agnes Ravatn prøver seg som sjølvhjelpsguru — med ujamne resultat.',
    utgitt: '2014',
  },
  {
    id: 'bok-004',
    tittel: 'Fuglane',
    forfatter: 'Tarjei Vesaas',
    sjanger: 'Klassiker',
    isbn: '9788205419193',
    bildeUrl: null as string | null,
    språk: ['Norsk (nynorsk)', 'Norsk (bokmål)', 'Engelsk', 'Tysk', 'Fransk'],
    formater: ['Papirbok', 'E-bok', 'Lydbok'],
    tilgjengelighet: [
      { filial: 'Bergen Hovedbibliotek', status: 'Tilgjengelig', antall: 5 },
      { filial: 'Loddefjord bibliotek', status: 'Tilgjengelig', antall: 2 },
      { filial: 'Fana bibliotek', status: 'Tilgjengelig', antall: 1 },
      { filial: 'Åsane bibliotek', status: 'Tilgjengelig', antall: 2 },
    ],
    eksemplarer: [
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 3 },
      { filial: 'Loddefjord bibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Fana bibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (bokmål)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 2 },
      { filial: 'Åsane bibliotek', språk: 'Norsk (bokmål)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 2 },
      { filial: 'Digitalt', språk: 'Norsk (nynorsk)', format: 'E-bok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Digitalt', språk: 'Norsk (bokmål)', format: 'E-bok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (nynorsk)', format: 'Lydbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Bergen Hovedbibliotek', språk: 'Engelsk', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Loddefjord bibliotek', språk: 'Engelsk', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Digitalt', språk: 'Engelsk', format: 'E-bok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Bergen Hovedbibliotek', språk: 'Tysk', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Bergen Hovedbibliotek', språk: 'Fransk', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
    ] as Eksemplar[],
    beskrivelse: 'Tidlaus roman om Mattis og systera hans Hege, og om å vere annleis i ei verd som ikkje alltid forstår.',
    utgitt: '1957',
  },
  {
    id: 'bok-005',
    tittel: 'Doppler',
    forfatter: 'Erlend Loe',
    sjanger: 'Roman',
    isbn: '9788202236595',
    bildeUrl: null as string | null,
    språk: ['Norsk (bokmål)', 'Engelsk', 'Tysk'],
    formater: ['Papirbok', 'E-bok', 'Lydbok'],
    tilgjengelighet: [
      { filial: 'Bergen Hovedbibliotek', status: 'Tilgjengelig', antall: 4 },
      { filial: 'Loddefjord bibliotek', status: 'Utlånt', antall: 0 },
      { filial: 'Fana bibliotek', status: 'Tilgjengelig', antall: 2 },
    ],
    eksemplarer: [
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (bokmål)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 3 },
      { filial: 'Loddefjord bibliotek', språk: 'Norsk (bokmål)', format: 'Papirbok', status: 'Utlånt' as const, antall: 0 },
      { filial: 'Fana bibliotek', språk: 'Norsk (bokmål)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 2 },
      { filial: 'Digitalt', språk: 'Norsk (bokmål)', format: 'E-bok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (bokmål)', format: 'Lydbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Bergen Hovedbibliotek', språk: 'Engelsk', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Bergen Hovedbibliotek', språk: 'Tysk', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
    ] as Eksemplar[],
    beskrivelse: 'Andreas Doppler bestemmer seg for å flytte til skogen etter farens død. Med seg har han en elgkalv.',
    utgitt: '2004',
  },
  {
    id: 'bok-006',
    tittel: 'Naiv. Super.',
    forfatter: 'Erlend Loe',
    sjanger: 'Roman',
    isbn: '9788202218584',
    bildeUrl: null as string | null,
    språk: ['Norsk (bokmål)', 'Engelsk'],
    formater: ['Papirbok', 'E-bok'],
    tilgjengelighet: [
      { filial: 'Bergen Hovedbibliotek', status: 'Tilgjengelig', antall: 3 },
      { filial: 'Åsane bibliotek', status: 'Tilgjengelig', antall: 1 },
    ],
    eksemplarer: [
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (bokmål)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 2 },
      { filial: 'Åsane bibliotek', språk: 'Norsk (bokmål)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Digitalt', språk: 'Norsk (bokmål)', format: 'E-bok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Bergen Hovedbibliotek', språk: 'Engelsk', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
    ] as Eksemplar[],
    beskrivelse: 'En 25-åring mister plutselig meningen med livet og prøver å finne den igjen.',
    utgitt: '1996',
  },
  {
    id: 'bok-007',
    tittel: 'Berge og havet',
    forfatter: 'Øyvind Rimbereid',
    sjanger: 'Poesi',
    isbn: null,
    bildeUrl: null as string | null,
    språk: ['Norsk (bokmål)'],
    formater: ['Papirbok'],
    tilgjengelighet: [
      { filial: 'Bergen Hovedbibliotek', status: 'Tilgjengelig', antall: 1 },
    ],
    eksemplarer: [
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (bokmål)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
    ] as Eksemplar[],
    beskrivelse: 'Dikt om Bergen, havet og landskapet langs norskekysten.',
    utgitt: '2018',
  },
  {
    id: 'bok-008',
    tittel: 'Det er nåde å finne',
    forfatter: 'Olav H. Hauge',
    sjanger: 'Poesi',
    isbn: '9788252186086',
    bildeUrl: null as string | null,
    språk: ['Norsk (nynorsk)'],
    formater: ['Papirbok', 'E-bok'],
    tilgjengelighet: [
      { filial: 'Bergen Hovedbibliotek', status: 'Tilgjengelig', antall: 2 },
      { filial: 'Fana bibliotek', status: 'Tilgjengelig', antall: 1 },
    ],
    eksemplarer: [
      { filial: 'Bergen Hovedbibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 2 },
      { filial: 'Fana bibliotek', språk: 'Norsk (nynorsk)', format: 'Papirbok', status: 'Tilgjengelig' as const, antall: 1 },
      { filial: 'Digitalt', språk: 'Norsk (nynorsk)', format: 'E-bok', status: 'Tilgjengelig' as const, antall: 1 },
    ] as Eksemplar[],
    beskrivelse: 'Samla dikt av ein av Noregs mest elska diktarar.',
    utgitt: '2012',
  },
]

// Merge bildeOverrides inn i katalogdata
function getBøkerMedBilder() {
  const overrides = hentBildeOverrides()
  return katalogBøker.map(bok => ({
    ...bok,
    bildeUrl: overrides[bok.id] || bok.bildeUrl,
  }))
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const sjanger = searchParams.get('sjanger')
  const filial = searchParams.get('filial')
  const språk = searchParams.get('språk')
  const format = searchParams.get('format')
  const id = searchParams.get('id')

  const bøker = getBøkerMedBilder()

  // Hent enkeltbok
  if (id) {
    const bok = bøker.find(b => b.id === id)
    if (bok) return NextResponse.json(bok)
    return NextResponse.json({ error: 'Bok ikke funnet' }, { status: 404 })
  }

  let resultater = [...bøker]

  // Tekstsøk
  if (q) {
    const lower = q.toLowerCase()
    resultater = resultater.filter(bok =>
      bok.tittel.toLowerCase().includes(lower) ||
      bok.forfatter.toLowerCase().includes(lower) ||
      (bok.isbn && bok.isbn.includes(lower)) ||
      bok.sjanger.toLowerCase().includes(lower)
    )
  }

  // Sjanger-filter
  if (sjanger && sjanger !== 'Alle') {
    resultater = resultater.filter(bok => bok.sjanger === sjanger)
  }

  // Filial-filter
  if (filial) {
    resultater = resultater.filter(bok =>
      bok.tilgjengelighet.some(t =>
        t.filial.toLowerCase().includes(filial.toLowerCase()) && t.status === 'Tilgjengelig'
      )
    )
  }

  // Språk-filter
  if (språk) {
    resultater = resultater.filter(bok =>
      bok.språk.some(s => s.toLowerCase().includes(språk.toLowerCase()))
    )
  }

  // Format-filter
  if (format) {
    resultater = resultater.filter(bok =>
      bok.formater.some(f => f.toLowerCase().includes(format.toLowerCase()))
    )
  }

  return NextResponse.json(resultater)
}

// ───── PATCH: Oppdater bildeUrl for en bok ─────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, bildeUrl } = body

    if (!id) return NextResponse.json({ error: 'Bok-ID er påkrevd' }, { status: 400 })

    const bok = katalogBøker.find(b => b.id === id)
    if (!bok) return NextResponse.json({ error: 'Bok ikke funnet' }, { status: 404 })

    const overrides = hentBildeOverrides()

    if (bildeUrl) {
      overrides[id] = bildeUrl
    } else {
      delete overrides[id]
    }

    lagreBildeOverrides(overrides)

    return NextResponse.json({ success: true, id, bildeUrl: bildeUrl || null })
  } catch (e) {
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
  }
}
