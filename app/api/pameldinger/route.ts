import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hentData, lagreData } from '@/lib/persistens'

interface Påmelding {
  id: string
  brukerId: string
  arrangementId: string
  navn: string
  epost: string
  antallPersoner: number
  kommentar: string | null
  påmeldt: string
}

interface Arrangement {
  id: string
  tittel: string
  beskrivelse: string
  dato: string
  klokkeslett: string
  sted: string
  kategori: string
  bildeUrl: string | null
  maxDeltakere: number
  maxOverstyrt: boolean
  antallPaameldt: number
  publisert: boolean
  opprettet: string
  serieTittel: string | null
}

function hentPåmeldinger(): Påmelding[] {
  return hentData('pameldinger', [])
}

function lagrePåmeldinger(data: Påmelding[]) {
  lagreData('pameldinger', data)
}

function hentArrangementer(): Arrangement[] {
  return hentData('arrangementer', [])
}

function lagreArrangementer(data: Arrangement[]) {
  lagreData('arrangementer', data)
}

// GET - Hent brukerens påmeldinger
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    const brukerId = (session.user as any).id
    const allePåmeldinger = hentPåmeldinger()
    const alleArrangementer = hentArrangementer()

    // Filtrer brukerens påmeldinger og legg ved arrangementdata
    const mine = allePåmeldinger
      .filter(p => p.brukerId === brukerId)
      .map(p => ({
        ...p,
        arrangement: alleArrangementer.find(a => a.id === p.arrangementId) || null
      }))
      .sort((a, b) => new Date(b.påmeldt).getTime() - new Date(a.påmeldt).getTime())

    return NextResponse.json(mine)
  } catch (error) {
    console.error('Error fetching påmeldinger:', error)
    return NextResponse.json({ error: 'Kunne ikke hente påmeldinger' }, { status: 500 })
  }
}

// POST - Meld på arrangement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    const { arrangementId, antallPersoner, kommentar } = await request.json()

    if (!arrangementId) {
      return NextResponse.json({ error: 'Arrangement ID mangler' }, { status: 400 })
    }

    const brukerId = (session.user as any).id

    // Sjekk at arrangementet finnes
    const arrangementer = hentArrangementer()
    const arrangement = arrangementer.find(a => a.id === arrangementId)
    if (!arrangement) {
      return NextResponse.json({ error: 'Arrangement ikke funnet' }, { status: 404 })
    }

    // Sjekk kapasitet
    const antall = antallPersoner || 1
    const ledigePlasser = arrangement.maxDeltakere - arrangement.antallPaameldt
    if (antall > ledigePlasser) {
      return NextResponse.json({ error: `Kun ${ledigePlasser} plasser igjen` }, { status: 400 })
    }

    // Sjekk om allerede påmeldt
    const påmeldinger = hentPåmeldinger()
    const existing = påmeldinger.find(p => p.brukerId === brukerId && p.arrangementId === arrangementId)
    if (existing) {
      return NextResponse.json({ error: 'Du er allerede påmeldt dette arrangementet' }, { status: 400 })
    }

    // Opprett påmelding
    const nyPåmelding: Påmelding = {
      id: `pam-${Date.now()}`,
      brukerId,
      arrangementId,
      navn: session.user.name || 'Ukjent',
      epost: session.user.email || '',
      antallPersoner: antall,
      kommentar: kommentar || null,
      påmeldt: new Date().toISOString(),
    }

    påmeldinger.push(nyPåmelding)
    lagrePåmeldinger(påmeldinger)

    // Oppdater antallPaameldt på arrangementet
    arrangement.antallPaameldt += antall
    const arrIndex = arrangementer.findIndex(a => a.id === arrangementId)
    arrangementer[arrIndex] = arrangement
    lagreArrangementer(arrangementer)

    return NextResponse.json(nyPåmelding, { status: 201 })
  } catch (error) {
    console.error('Error creating påmelding:', error)
    return NextResponse.json({ error: 'Kunne ikke opprette påmelding' }, { status: 500 })
  }
}

// DELETE - Avmeld arrangement
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID mangler' }, { status: 400 })
    }

    const påmeldinger = hentPåmeldinger()
    const index = påmeldinger.findIndex(p => p.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Påmelding ikke funnet' }, { status: 404 })
    }

    const påmelding = påmeldinger[index]

    // Slett påmelding
    påmeldinger.splice(index, 1)
    lagrePåmeldinger(påmeldinger)

    // Oppdater antallPaameldt på arrangementet
    const arrangementer = hentArrangementer()
    const arrIndex = arrangementer.findIndex(a => a.id === påmelding.arrangementId)
    if (arrIndex !== -1) {
      arrangementer[arrIndex].antallPaameldt = Math.max(0, arrangementer[arrIndex].antallPaameldt - påmelding.antallPersoner)
      lagreArrangementer(arrangementer)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting påmelding:', error)
    return NextResponse.json({ error: 'Kunne ikke avmelde' }, { status: 500 })
  }
}