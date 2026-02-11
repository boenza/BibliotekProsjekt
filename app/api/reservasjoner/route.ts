import { NextRequest, NextResponse } from 'next/server'
import { getUserReservations, reserveBook } from '@/lib/ils-adapter'

// In-memory fallback for when Prisma schema doesn't have the right tables
const fallbackReservasjoner: any[] = []

// GET - Hent brukerens reservasjoner
export async function GET(request: NextRequest) {
  try {
    const brukerId = 'demo-user-1'
    const reservasjoner = await getUserReservations(brukerId)
    
    // Kombiner ILS-reservasjoner med eventuelle fallback-reservasjoner
    const alle = [...(Array.isArray(reservasjoner) ? reservasjoner : []), ...fallbackReservasjoner]
    return NextResponse.json(alle)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    // Returner fallback-reservasjoner hvis ILS/Prisma feiler
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

    // Prøv ILS-adapter først (bruker Prisma)
    try {
      const result = await reserveBook('demo-user-1', bokId, filial)
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Reservasjon opprettet',
          filial 
        }, { status: 201 })
      }
      // Hvis reserveBook returnerer error, fall gjennom til fallback
      console.log('reserveBook feilet:', result.error)
    } catch (ilsError) {
      console.log('ILS reserveBook feilet, bruker fallback:', ilsError)
    }

    // Fallback: in-memory lagring
    const nyReservasjon = {
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      bokId,
      bokTittel: body.bokTittel || 'Reservert bok',
      forfatter: body.forfatter || '',
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
