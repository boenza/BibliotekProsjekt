import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Hent brukerens påmeldinger
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    const påmeldinger = await prisma.påmelding.findMany({
      where: {
        brukerId: (session.user as any).id
      },
      include: {
        arrangement: true
      },
      orderBy: { påmeldt: 'desc' }
    })

    return NextResponse.json(påmeldinger)
  } catch (error) {
    console.error('Error fetching påmeldinger:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente påmeldinger' },
      { status: 500 }
    )
  }
}

// POST - Meld interesse for arrangement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    const { arrangementId, antallPersoner, kommentar } = await request.json()

    if (!arrangementId) {
      return NextResponse.json(
        { error: 'Arrangement ID mangler' },
        { status: 400 }
      )
    }

    // Sjekk om allerede påmeldt
    const existing = await prisma.påmelding.findFirst({
      where: {
        brukerId: (session.user as any).id,
        arrangementId
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Allerede påmeldt' },
        { status: 400 }
      )
    }

    // Opprett påmelding
    const påmelding = await prisma.påmelding.create({
      data: {
        brukerId: (session.user as any).id,
        arrangementId,
        navn: session.user.name || 'Ukjent',
        epost: session.user.email || '',
        antallPersoner: antallPersoner || 1,
        kommentar: kommentar || null
      }
    })

    // Oppdater påmeldte-count på arrangement
    await prisma.arrangement.update({
      where: { id: arrangementId },
      data: {
        påmeldte: {
          increment: antallPersoner || 1
        }
      }
    })

    return NextResponse.json(påmelding, { status: 201 })
  } catch (error) {
    console.error('Error creating påmelding:', error)
    return NextResponse.json(
      { error: 'Kunne ikke melde påmelding' },
      { status: 500 }
    )
  }
}

// DELETE - Avmeld arrangement
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Ikke autentisert' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID mangler' },
        { status: 400 }
      )
    }

    // Hent påmelding for å få arrangementId og antallPersoner
    const påmelding = await prisma.påmelding.findUnique({
      where: { id }
    })

    if (!påmelding) {
      return NextResponse.json(
        { error: 'Påmelding ikke funnet' },
        { status: 404 }
      )
    }

    // Slett påmelding
    await prisma.påmelding.delete({
      where: { id }
    })

    // Oppdater påmeldte-count på arrangement
    await prisma.arrangement.update({
      where: { id: påmelding.arrangementId },
      data: {
        påmeldte: {
          decrement: påmelding.antallPersoner
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting påmelding:', error)
    return NextResponse.json(
      { error: 'Kunne ikke avmelde' },
      { status: 500 }
    )
  }
}
