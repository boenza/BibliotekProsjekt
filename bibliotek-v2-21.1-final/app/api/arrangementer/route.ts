import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Hent alle arrangementer
export async function GET() {
  try {
    const arrangementer = await prisma.arrangement.findMany({
      orderBy: { dato: 'asc' }
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

// PATCH - Dupliser arrangement
export async function PATCH(request: NextRequest) {
  try {
    const { id, action } = await request.json()

    if (action === 'duplicate') {
      // Hent original
      const original = await prisma.arrangement.findUnique({
        where: { id }
      })

      if (!original) {
        return NextResponse.json(
          { error: 'Arrangement ikke funnet' },
          { status: 404 }
        )
      }

      // Opprett kopi
      const duplicate = await prisma.arrangement.create({
        data: {
          tittel: `${original.tittel} (kopi)`,
          beskrivelse: original.beskrivelse,
          dato: original.dato,
          klokkeslett: original.klokkeslett,
          varighet: original.varighet,
          sted: original.sted,
          kategori: original.kategori,
          bildeUrl: original.bildeUrl,
          kapasitet: original.kapasitet,
          påmeldte: 0, // Reset påmeldte
          påmeldingÅpen: original.påmeldingÅpen,
          publisert: false // Kopier som utkast
        }
      })

      return NextResponse.json(duplicate)
    }

    return NextResponse.json(
      { error: 'Ugyldig action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error duplicating arrangement:', error)
    return NextResponse.json(
      { error: 'Kunne ikke duplisere arrangement' },
      { status: 500 }
    )
  }
}
