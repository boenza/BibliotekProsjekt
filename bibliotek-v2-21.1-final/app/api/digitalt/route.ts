import { NextRequest, NextResponse } from 'next/server'
import { getDigitalBooks, getDigitalFilms } from '@/lib/digital-content-adapter'

// GET - Hent digitalt innhold
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('type') // 'books' eller 'films'
    const subType = searchParams.get('subType') // 'ebok', 'lydbok', 'film', 'serie'
    const søk = searchParams.get('søk') || undefined
    const sjanger = searchParams.get('sjanger') || undefined

    if (contentType === 'books') {
      const books = await getDigitalBooks({
        type: subType as 'ebok' | 'lydbok' | undefined,
        søk,
        sjanger
      })
      return NextResponse.json(books)
    }

    if (contentType === 'films') {
      const films = await getDigitalFilms({
        type: subType as 'film' | 'serie' | undefined,
        søk,
        sjanger
      })
      return NextResponse.json(films)
    }

    // Default: returner begge
    const [books, films] = await Promise.all([
      getDigitalBooks({ søk, sjanger }),
      getDigitalFilms({ søk, sjanger })
    ])

    return NextResponse.json({ books, films })
  } catch (error) {
    console.error('Error fetching digital content:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente digitalt innhold' },
      { status: 500 }
    )
  }
}
