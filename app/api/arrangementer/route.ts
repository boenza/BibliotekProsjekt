import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Hent alle arrangementer
export async function GET() {
  try {
    const arrangementer = await prisma.arrangement.findMany({
      orderBy: { dato: 'asc' },
      where: {
        publisert: true
      }
    })

    return NextResponse.json(arrangementer)
  } catch (error) {
    console.error('Error fetching arrangementer:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente arrangementer' },
      { status: 500 }
    )
  }
}

// POST - Opprett nytt arrangement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      tittel, 
      beskrivelse, 
      dato, 
      klokkeslett, 
      varighet,
      sted, 
      kategori, 
      bildeUrl, 
      kapasitet,
      publisert 
    } = body

    if (!tittel || !beskrivelse || !dato || !klokkeslett || !sted || !kategori) {
      return NextResponse.json(
        { error: 'Påkrevde felter mangler' },
        { status: 400 }
      )
    }

    const arrangement = await prisma.arrangement.create({
      data: {
        tittel,
        beskrivelse,
        dato: new Date(dato),
        klokkeslett,
        varighet: varighet || null,
        sted,
        kategori,
        bildeUrl: bildeUrl || null,
        kapasitet: kapasitet || 50,
        påmeldte: 0,
        påmeldingÅpen: true,
        publisert: publisert || false
      }
    })

    return NextResponse.json(arrangement, { status: 201 })
  } catch (error) {
    console.error('Error creating arrangement:', error)
    return NextResponse.json(
      { error: 'Kunne ikke opprette arrangement' },
      { status: 500 }
    )
  }
}
