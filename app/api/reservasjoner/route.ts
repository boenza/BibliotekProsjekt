import { NextRequest, NextResponse } from 'next/server'
import { getUserReservations } from '@/lib/ils-adapter'

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
