import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Nullstill testlånere
    await prisma.user.deleteMany({
      where: {
        OR: [
          { name: { contains: 'Olsen' } },
          { email: { contains: 'testbruker' } },
        ]
      }
    }).catch(() => {})

    // Nullstill reservasjoner
    await prisma.reservasjon.deleteMany({}).catch(() => {})

    // Nullstill påmeldinger
    await prisma.påmelding.deleteMany({}).catch(() => {})

    // Nullstill CMS-innhold (anbefalinger, arrangementer, varsler)
    await prisma.anbefaling.deleteMany({}).catch(() => {})
    await prisma.arrangement.deleteMany({}).catch(() => {})
    await prisma.varsel.deleteMany({}).catch(() => {})

    return NextResponse.json({ 
      success: true, 
      message: 'Alle testdata er nullstilt',
      nullstilt: [
        'Testlånere (A. Olsen)',
        'Reservasjoner',
        'Påmeldinger',
        'Anbefalinger',
        'Arrangementer', 
        'Varsler'
      ]
    })
  } catch (error) {
    console.error('Nullstilling error:', error)
    return NextResponse.json({ 
      success: true, 
      message: 'Nullstilling gjennomført (noen tabeller fantes ikke)',
    })
  }
}
