import { NextRequest, NextResponse } from 'next/server'
import { getUserReservations, reserveBook } from '@/lib/ils-adapter'

// In-memory fallback for when Prisma schema doesn't have the right tables
const fallbackReservasjoner: any[] = []

// ───── Katalogdata for tittel-oppslag ─────
const katalogTitler: Record<string, { tittel: string; forfatter: string }> = {
  'bok-001': { tittel: 'Dei sju dørene', forfatter: 'Agnes Ravatn' },
  'bok-002': { tittel: 'Fugletribunalet', forfatter: 'Agnes Ravatn' },
  'bok-003': { tittel: 'Operasjon Sjølvdisiplin', forfatter: 'Agnes Ravatn' },
  'bok-004': { tittel: 'Fuglane', forfatter: 'Tarjei Vesaas' },
  'bok-005': { tittel: 'Doppler', forfatter: 'Erlend Loe' },
  'bok-006': { tittel: 'Naiv. Super.', forfatter: 'Erlend Loe' },
  'bok-007': { tittel: 'Berge og havet', forfatter: 'Øyvind Rimbereid' },
  'bok-008': { tittel: 'Det er nåde å finne', forfatter: 'Olav H. Hauge' },
}

// GET - Hent brukerens reservasjoner
export async function GET(request: NextRequest) {
  try {
    const brukerId = 'demo-user-1'
    const reservasjoner = await getUserReservations(brukerId)

    // Berik ILS-reservasjoner med titler fra katalog
    const berikede = (Array.isArray(reservasjoner) ? reservasjoner : []).map((r: any) => {
      if (r.bokId && (!r.bokTittel || r.bokTittel === 'Reservert bok')) {
        const bok = katalogTitler[r.bokId]
        if (bok) return { ...r, bokTittel: bok.tittel, forfatter: bok.forfatter }
      }
      return r
    })

    // Kombiner ILS-reservasjoner med eventuelle fallback-reservasjoner
    const alle = [...berikede, ...fallbackReservasjoner]
    return NextResponse.json(alle)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(fallbackReservasjoner)
  }
}

// POST - Opprett ny reservasjon (L-4)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bokId, filial } = body

    if (!bokId || !filial) {
      return NextResponse.json(
        { error: 'bokId og filial er påkrevd' },
        { status: 400 }
      )
    }

    // Slå opp tittel fra katalog hvis ikke oppgitt
    const katalogBok = katalogTitler[bokId]
    const bokTittel = body.bokTittel && body.bokTittel !== 'Reservert bok'
      ? body.bokTittel
      : katalogBok?.tittel || 'Ukjent tittel'
    const forfatter = body.forfatter || katalogBok?.forfatter || ''

    // Prøv ILS-adapter først (bruker Prisma)
    try {
      const result = await reserveBook('demo-user-1', bokId, filial)
      if (result.success) {
        // Lagre også i fallback med riktig tittel for visning
        const nyReservasjon = {
          id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          bokId,
          bokTittel,
          forfatter,
          filial,
          status: 'Venter',
          plassering: Math.floor(Math.random() * 3) + 1,
          klar: false,
          reservert: new Date().toISOString(),
        }
        fallbackReservasjoner.push(nyReservasjon)

        return NextResponse.json({
          success: true,
          message: 'Reservasjon opprettet',
          filial,
          reservasjon: nyReservasjon
        }, { status: 201 })
      }
      console.log('reserveBook feilet:', result.error)
    } catch (ilsError) {
      console.log('ILS reserveBook feilet, bruker fallback:', ilsError)
    }

    // Fallback: in-memory lagring
    const nyReservasjon = {
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      bokId,
      bokTittel,
      forfatter,
      filial,
      status: 'Venter',
      plassering: Math.floor(Math.random() * 3) + 1,
      klar: false,
      reservert: new Date().toISOString(),
    }

    fallbackReservasjoner.push(nyReservasjon)

    return NextResponse.json({
      success: true,
      message: 'Reservasjon opprettet',
      reservasjon: nyReservasjon
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating reservasjon:', error)
    return NextResponse.json(
      { error: error.message || 'Kunne ikke opprette reservasjon' },
      { status: 500 }
    )
  }
}

// DELETE - Slett reservasjon (for nullstilling)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')

    if (all === 'true') {
      fallbackReservasjoner.length = 0
      return NextResponse.json({ success: true, message: 'Alle reservasjoner nullstilt' })
    }

    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID er påkrevd' }, { status: 400 })
    }

    const index = fallbackReservasjoner.findIndex(r => r.id === id)
    if (index !== -1) {
      fallbackReservasjoner.splice(index, 1)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reservasjon:', error)
    return NextResponse.json({ error: 'Kunne ikke slette' }, { status: 500 })
  }
}
