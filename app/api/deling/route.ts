import { NextResponse } from 'next/server'
import { lagreData, hentData } from '@/lib/persistens'

// ═══════════════════════════════════════════════════════
// DELING API — mottar delt innhold, importerer til riktig seksjon
// ═══════════════════════════════════════════════════════

interface DeltElement {
  id: string
  kildeId: string
  kildeBibliotek: string
  type: 'arrangement' | 'anbefaling' | 'artikkel'
  tittel: string
  data: Record<string, any>
  status: 'mottatt' | 'importert' | 'avvist'
  opprettetSomId: string | null
  mottatt: string
  behandlet: string | null
}

const STANDARD_DATA: DeltElement[] = [
  {
    id: 'delt-1',
    kildeId: 'bodo-arr-42',
    kildeBibliotek: 'Bodø bibliotek',
    type: 'arrangement',
    tittel: 'Nordnorsk forfatterfestival — gjestende foredragsholder',
    data: {
      beskrivelse: 'Foredrag om nordnorsk litteratur med paneldebatt. Kan tilpasses lokale forhold.',
      dato: '2026-04-10', klokkeslett: '18:00', sted: '', kategori: 'Foredrag',
      bildeUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
    },
    status: 'mottatt', opprettetSomId: null,
    mottatt: '2026-02-08T10:30:00Z', behandlet: null,
  },
  {
    id: 'delt-2',
    kildeId: 'stavanger-anb-7',
    kildeBibliotek: 'Stavanger bibliotek',
    type: 'anbefaling',
    tittel: 'Bøkene som endret alt — leseliste for voksne',
    data: {
      type: 'enkel', beskrivelse: 'Kuratert leseliste med bøker som har satt varig spor.',
      forfatter: 'Diverse', bildeUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    },
    status: 'mottatt', opprettetSomId: null,
    mottatt: '2026-02-09T14:15:00Z', behandlet: null,
  },
  {
    id: 'delt-3',
    kildeId: 'tromsoe-art-12',
    kildeBibliotek: 'Tromsø bibliotek',
    type: 'artikkel',
    tittel: 'Slik lykkes du med leselyst-kampanjen',
    data: {
      ingress: 'Erfaringer fra Tromsøs vellykkede kampanje for barn 6-12 år.',
      innhold: 'Tromsø bibliotek gjennomførte i 2025 en leselyst-kampanje rettet mot barn i alderen 6-12 år.\n\nKampanjen varte i tre måneder og resulterte i en økning på 40% i barneutlån.',
      kategori: 'Tips', forfatter: 'Tromsø bibliotek',
      bildeUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200',
    },
    status: 'mottatt', opprettetSomId: null,
    mottatt: '2026-02-10T09:00:00Z', behandlet: null,
  },
]

function getData(): DeltElement[] {
  return hentData<DeltElement[]>('deling', STANDARD_DATA)
}
function saveData(data: DeltElement[]): void {
  lagreData('deling', data)
}

export async function GET() {
  return NextResponse.json(getData())
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = getData()
    const nytt: DeltElement = {
      id: `delt-${Date.now()}`,
      kildeId: body.kildeId || '',
      kildeBibliotek: body.kildeBibliotek || 'Ukjent',
      type: body.type || 'artikkel',
      tittel: body.tittel || 'Uten tittel',
      data: body.data || {},
      status: 'mottatt',
      opprettetSomId: null,
      mottatt: new Date().toISOString(),
      behandlet: null,
    }
    data.push(nytt)
    saveData(data)
    return NextResponse.json(nytt, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Ugyldig data' }, { status: 400 })
  }
}

// PATCH — godta (importerer til riktig API) eller avvis
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, handling, opprettetSomId } = body
    const data = getData()
    const idx = data.findIndex(d => d.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })

    if (handling === 'importer') {
      data[idx].status = 'importert'
      data[idx].opprettetSomId = opprettetSomId || null
      data[idx].behandlet = new Date().toISOString()
    } else if (handling === 'avvis') {
      data[idx].status = 'avvist'
      data[idx].behandlet = new Date().toISOString()
    }
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
  const data = getData().filter(d => d.id !== id)
  saveData(data)
  return NextResponse.json({ ok: true })
}
