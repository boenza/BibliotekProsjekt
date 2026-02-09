import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fornavn, etternavn, fodselsdato, adresse, postnummer, poststed, epost, mobil } = body

    // Valider påkrevde felter
    if (!fornavn || !etternavn || !fodselsdato || !epost || !mobil) {
      return NextResponse.json(
        { error: 'Mangler påkrevde felter' },
        { status: 400 }
      )
    }

    // Sjekk om e-post allerede finnes
    const existingUser = await prisma.bruker.findUnique({
      where: { epost }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'E-postadressen er allerede registrert' },
        { status: 400 }
      )
    }

    // Generer bibliotekkortnummer (10 sifre)
    const generateCardNumber = () => {
      return Math.floor(1000000000 + Math.random() * 9000000000).toString()
    }

    let bibliotekkortnummer = generateCardNumber()
    
    // Sjekk at nummeret ikke allerede finnes
    let cardExists = await prisma.bruker.findUnique({
      where: { bibliotekkortnummer }
    })
    
    while (cardExists) {
      bibliotekkortnummer = generateCardNumber()
      cardExists = await prisma.bruker.findUnique({
        where: { bibliotekkortnummer }
      })
    }

    // Generer passord (hash av bibliotekkortnummer for demo)
    const hashedPassword = await bcrypt.hash(bibliotekkortnummer, 10)

    // Opprett ny bruker
    const nyBruker = await prisma.bruker.create({
      data: {
        navn: `${fornavn} ${etternavn}`,
        fornavn,
        etternavn,
        fodselsdato: new Date(fodselsdato),
        adresse: adresse || null,
        postnummer: postnummer || null,
        poststed: poststed || null,
        epost,
        mobil,
        bibliotekkortnummer,
        passord: hashedPassword,
        rolle: 'LAANER',
        aktiv: true
      }
    })

    return NextResponse.json({
      success: true,
      bibliotekkortnummer: nyBruker.bibliotekkortnummer,
      navn: nyBruker.navn,
      message: 'Bruker opprettet!'
    })

  } catch (error) {
    console.error('Registrering feilet:', error)
    return NextResponse.json(
      { error: 'Kunne ikke opprette bruker' },
      { status: 500 }
    )
  }
}
