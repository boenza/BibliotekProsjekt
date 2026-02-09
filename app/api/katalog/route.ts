import { NextRequest, NextResponse } from 'next/server'
import { searchCatalog } from '@/lib/ils-adapter'

// GET - Søk i katalog
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const sjanger = searchParams.get('sjanger') || undefined

    const bøker = await searchCatalog(query, sjanger)

    return NextResponse.json(bøker)
  } catch (error) {
    console.error('Error searching catalog:', error)
    return NextResponse.json(
      { error: 'Kunne ikke søke i katalog' },
      { status: 500 }
    )
  }
}
