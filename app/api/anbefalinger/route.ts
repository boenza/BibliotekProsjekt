import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Hent alle anbefalinger
export async function GET() {
  try {
    const anbefalinger = await prisma.anbefaling.findMany({
      orderBy: { opprettet: 'desc' }
    })

    return NextResponse.json(anbefalinger)
  } catch (error) {
    console.error('Error fetching anbefalinger:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente anbefalinger' },
      { status: 500 }
    )
  }
}

// POST - Opprett ny anbefaling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tittel, forfatter, beskrivelse, bildeUrl, sjanger, målgruppe, publisert } = body

    if (!tittel || !beskrivelse) {
      return NextResponse.json(
        { error: 'Tittel og beskrivelse er påkrevd' },
        { status: 400 }
      )
    }

    const anbefaling = await prisma.anbefaling.create({
      data: {
        tittel,
        forfatter: forfatter || null,
        beskrivelse,
        bildeUrl: bildeUrl || null,
        sjanger: sjanger || null,
        målgruppe: målgruppe || 'Voksen',
        publisert: publisert || false
      }
    })

    return NextResponse.json(anbefaling, { status: 201 })
  } catch (error) {
    console.error('Error creating anbefaling:', error)
    return NextResponse.json(
      { error: 'Kunne ikke opprette anbefaling' },
      { status: 500 }
    )
  }
}
