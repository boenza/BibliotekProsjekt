import { NextRequest, NextResponse } from 'next/server'
import { getUserLoans, renewLoan } from '@/lib/ils-adapter'

// GET - Hent brukerens lån
export async function GET(request: NextRequest) {
  try {
    // I demo-modus bruker vi en hardkodet bruker-ID
    // I produksjon vil dette komme fra session/autentisering
    const brukerId = 'demo-user-1'

    const lån = await getUserLoans(brukerId)

    return NextResponse.json(lån)
  } catch (error) {
    console.error('Error fetching loans:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente lån' },
      { status: 500 }
    )
  }
}

// POST - Forny lån
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lånId } = body

    if (!lånId) {
      return NextResponse.json(
        { error: 'Lån-ID mangler' },
        { status: 400 }
      )
    }

    const result = await renewLoan(lånId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Kunne ikke fornye lån' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error renewing loan:', error)
    return NextResponse.json(
      { error: 'Kunne ikke fornye lån' },
      { status: 500 }
    )
  }
}
