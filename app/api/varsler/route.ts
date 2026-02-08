import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Hent aktive varsler
export async function GET() {
  try {
    const now = new Date()
    
    const varsler = await prisma.varsel.findMany({
      where: {
        aktiv: true,
        visningStart: {
          lte: now
        },
        OR: [
          { visningSlutt: null },
          { visningSlutt: { gte: now } }
        ]
      },
      orderBy: { opprettet: 'desc' }
    })

    return NextResponse.json(varsler)
  } catch (error) {
    console.error('Error fetching varsler:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente varsler' },
      { status: 500 }
    )
  }
}

// POST - Opprett nytt varsel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tittel, melding, type, ikon, visningStart, visningSlutt } = body

    if (!tittel || !melding || !type) {
      return NextResponse.json(
        { error: 'Tittel, melding og type er påkrevd' },
        { status: 400 }
      )
    }

    const varsel = await prisma.varsel.create({
      data: {
        tittel,
        melding,
        type,
        ikon: ikon || '⚠️',
        visningStart: visningStart ? new Date(visningStart) : new Date(),
        visningSlutt: visningSlutt ? new Date(visningSlutt) : null,
        aktiv: true
      }
    })

    return NextResponse.json(varsel, { status: 201 })
  } catch (error) {
    console.error('Error creating varsel:', error)
    return NextResponse.json(
      { error: 'Kunne ikke opprette varsel' },
      { status: 500 }
    )
  }
}

// DELETE - Slett varsel
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID mangler' },
        { status: 400 }
      )
    }

    await prisma.varsel.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting varsel:', error)
    return NextResponse.json(
      { error: 'Kunne ikke slette varsel' },
      { status: 500 }
    )
  }
}
