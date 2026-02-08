import { NextRequest, NextResponse } from 'next/server'
import { getUserReservations, reserveBook } from '@/lib/ils-adapter'

// GET - Hent brukerens reservasjoner
export async function GET(request: NextRequest) {
  try {
    // I demo-modus bruker vi en hardkodet bruker-ID
    // I produksjon vil dette komme fra session/autentisering
    const brukerId = 'demo-user-1'

    const reservasjoner = await getUserReservations(brukerId)

    return NextResponse.json(reservasjoner)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente reservasjoner' },
      { status: 500 }
    )
  }
}

// POST - Opprett ny reservasjon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bokId, filial } = body

    if (!bokId || !filial) {
      return NextResponse.json(
        { error: 'Mangler påkrevde felt' },
        { status: 400 }
      )
    }

    // I demo-modus bruker vi en hardkodet bruker-ID
    // I produksjon vil dette komme fra session/autentisering
    const brukerId = 'demo-user-1'

    const result = await reserveBook(brukerId, bokId, filial)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Kunne ikke reservere bok' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: 'Kunne ikke opprette reservasjon' },
      { status: 500 }
    )
  }
}
