import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDigitalBooks, getDigitalFilms } from '@/lib/digital-content-adapter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    if (!query || query.length < 2) {
      return NextResponse.json({ 
        physical: [], 
        digital: [], 
        events: [] 
      })
    }

    const searchTerm = query.toLowerCase()

    // Søk i fysisk katalog
    const physicalBooks = await prisma.bok.findMany({
      where: {
        OR: [
          { tittel: { contains: searchTerm, mode: 'insensitive' } },
          { forfatter: { contains: searchTerm, mode: 'insensitive' } },
          { isbn: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: 10
    })

    // Søk i digitalt innhold
    const [digitalBooks, digitalFilms] = await Promise.all([
      getDigitalBooks({ søk: query }),
      getDigitalFilms({ søk: query })
    ])

    // Søk i arrangementer
    const events = await prisma.arrangement.findMany({
      where: {
        OR: [
          { tittel: { contains: searchTerm, mode: 'insensitive' } },
          { kategori: { contains: searchTerm, mode: 'insensitive' } },
          { beskrivelse: { contains: searchTerm, mode: 'insensitive' } }
        ],
        dato: {
          gte: new Date() // Kun fremtidige arrangementer
        }
      },
      take: 5,
      orderBy: {
        dato: 'asc'
      }
    })

    // Kombiner og strukturer resultater
    const results = {
      physical: physicalBooks.map(b => ({
        id: b.id,
        type: 'physical_book',
        title: b.tittel,
        author: b.forfatter,
        genre: b.sjanger,
        available: b.tilgjengelig > 0,
        location: 'Fysisk samling'
      })),
      digital: [
        ...digitalBooks.map(b => ({
          id: b.id,
          type: 'digital_book',
          title: b.tittel,
          author: b.forfatter,
          subtype: b.type, // 'ebok' eller 'lydbok'
          provider: b.leverandør,
          location: 'Digitalt'
        })),
        ...digitalFilms.map(f => ({
          id: f.id,
          type: 'digital_film',
          title: f.tittel,
          author: f.regissør,
          subtype: f.type, // 'film' eller 'serie'
          provider: f.leverandør,
          location: 'Digitalt'
        }))
      ],
      events: events.map(e => ({
        id: e.id,
        type: 'event',
        title: e.tittel,
        category: e.kategori,
        date: e.dato,
        time: e.klokkeslett,
        location: e.sted
      }))
    }

    // Tell totalt antall resultater
    const total = results.physical.length + results.digital.length + results.events.length

    return NextResponse.json({
      query,
      total,
      results
    })

  } catch (error) {
    console.error('Unified search error:', error)
    return NextResponse.json(
      { error: 'Søket feilet' },
      { status: 500 }
    )
  }
}
