import { NextResponse } from 'next/server'
import { hentData, lagreData } from '@/lib/persistens'

export interface Bilde {
  id: string
  url: string
  tittel: string
  kilde: 'katalog' | 'anbefaling' | 'arrangement' | 'opplastet'
  kildeId: string | null
  kildeNavn?: string
  opprettet: string
  tags: string[]
}

const STANDARD_OPPLASTINGER: Bilde[] = [
  {
    id: 'bilde-1', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200',
    tittel: 'Bibliotekinterioer', kilde: 'opplastet', kildeId: null,
    opprettet: '2026-01-10T10:00:00Z', tags: ['bibliotek', 'interioer', 'lesesal'],
  },
  {
    id: 'bilde-2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
    tittel: 'Bokhyller', kilde: 'opplastet', kildeId: null,
    opprettet: '2026-01-15T14:00:00Z', tags: ['bokhyller', 'samling'],
  },
  {
    id: 'bilde-3', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200',
    tittel: 'Bokstabel', kilde: 'opplastet', kildeId: null,
    opprettet: '2026-01-20T09:00:00Z', tags: ['boeker', 'lesing'],
  },
  {
    id: 'bilde-4', url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200',
    tittel: 'Bergen Bryggen', kilde: 'opplastet', kildeId: null,
    opprettet: '2026-02-01T10:00:00Z', tags: ['bergen', 'bryggen', 'by'],
  },
  {
    id: 'bilde-5', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200',
    tittel: 'Barn som leser', kilde: 'opplastet', kildeId: null,
    opprettet: '2026-02-03T10:00:00Z', tags: ['barn', 'lesing', 'aktivitet'],
  },
]

function hentOpplastinger(): Bilde[] { return hentData('bilder-opplastet', STANDARD_OPPLASTINGER) }
function lagreOpplastinger(data: Bilde[]) { lagreData('bilder-opplastet', data) }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const kilde = searchParams.get('kilde')
  const soek = searchParams.get('q')?.toLowerCase()

  const baseUrl = request.url.split('/api/bilder')[0]
  let alleBilder: Bilde[] = [...hentOpplastinger()]

  // Hent fra andre APIer
  try {
    const katalogRes = await fetch(`${baseUrl}/api/katalog?antall=50`)
    const katalogData = await katalogRes.json()
    if (Array.isArray(katalogData)) {
      katalogData.forEach((bok: any) => {
        if (bok.bildeUrl) {
          alleBilder.push({
            id: `katalog-${bok.id}`, url: bok.bildeUrl,
            tittel: `${bok.tittel} — ${bok.forfatter}`,
            kilde: 'katalog', kildeId: bok.id, kildeNavn: bok.tittel,
            opprettet: bok.opprettet || '2026-01-01T00:00:00Z',
            tags: ['bok', bok.sjanger?.toLowerCase()].filter(Boolean),
          })
        }
      })
    }
  } catch (e) {}

  try {
    const anbRes = await fetch(`${baseUrl}/api/anbefalinger`)
    const anbData = await anbRes.json()
    if (Array.isArray(anbData)) {
      anbData.forEach((anb: any) => {
        if (anb.bildeUrl) {
          alleBilder.push({
            id: `anb-bilde-${anb.id}`, url: anb.bildeUrl,
            tittel: `Anbefaling: ${anb.tittel}`,
            kilde: 'anbefaling', kildeId: anb.id, kildeNavn: anb.tittel,
            opprettet: anb.opprettet || '2026-01-01T00:00:00Z', tags: ['anbefaling'],
          })
        }
      })
    }
  } catch (e) {}

  try {
    const arrRes = await fetch(`${baseUrl}/api/arrangementer`)
    const arrData = await arrRes.json()
    if (Array.isArray(arrData)) {
      arrData.forEach((arr: any) => {
        if (arr.bildeUrl) {
          alleBilder.push({
            id: `arr-bilde-${arr.id}`, url: arr.bildeUrl,
            tittel: `Arrangement: ${arr.tittel}`,
            kilde: 'arrangement', kildeId: arr.id, kildeNavn: arr.tittel,
            opprettet: arr.opprettet || '2026-01-01T00:00:00Z', tags: ['arrangement'],
          })
        }
      })
    }
  } catch (e) {}

  // Dedupliser paa URL
  const sett = new Map<string, Bilde>()
  alleBilder.forEach(b => { if (!sett.has(b.url)) sett.set(b.url, b) })
  let resultat = Array.from(sett.values())

  if (kilde && kilde !== 'alle') resultat = resultat.filter(b => b.kilde === kilde)
  if (soek) resultat = resultat.filter(b =>
    b.tittel.toLowerCase().includes(soek) || b.tags.some(t => t.includes(soek))
  )

  resultat.sort((a, b) => new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime())
  return NextResponse.json(resultat)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, tittel, tags } = body
    if (!url) return NextResponse.json({ error: 'URL er paakrevd' }, { status: 400 })

    const ny: Bilde = {
      id: `bilde-${Date.now()}`, url, tittel: tittel || 'Uten tittel',
      kilde: 'opplastet', kildeId: null,
      opprettet: new Date().toISOString(), tags: tags || [],
    }
    const alle = hentOpplastinger(); alle.push(ny); lagreOpplastinger(alle)
    return NextResponse.json(ny, { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Ugyldig foresporsel' }, { status: 400 }) }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID paakrevd' }, { status: 400 })
  const alle = hentOpplastinger()
  const idx = alle.findIndex(b => b.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  alle.splice(idx, 1); lagreOpplastinger(alle)
  return NextResponse.json({ success: true })
}
