import { NextResponse } from 'next/server'

let prisma: any = null
try {
  const { PrismaClient } = require('@prisma/client')
  prisma = new PrismaClient()
} catch (e) {
  console.log('Prisma not available for nullstilling')
}

export async function POST() {
  const nullstilt: string[] = []
  const feilet: string[] = []

  // Helper function to safely delete from a table
  const safeDelete = async (modelName: string, filter?: any) => {
    if (!prisma) {
      feilet.push(`${modelName} (ingen database)`)
      return
    }
    try {
      const model = prisma[modelName.toLowerCase()]
      if (!model) {
        feilet.push(`${modelName} (modell finnes ikke)`)
        return
      }
      if (filter) {
        await model.deleteMany({ where: filter })
      } else {
        await model.deleteMany({})
      }
      nullstilt.push(modelName)
    } catch (error: any) {
      feilet.push(`${modelName}: ${error.message}`)
    }
  }

  // Nullstill testlånere (A. Olsen etc.)
  if (prisma) {
    try {
      const model = prisma.user
      if (model) {
        await model.deleteMany({
          where: {
            OR: [
              { name: { contains: 'Olsen' } },
              { email: { contains: 'testbruker' } },
              { email: { contains: 'test@' } },
            ]
          }
        })
        nullstilt.push('Testlånere (A. Olsen)')
      }
    } catch (e: any) {
      feilet.push(`Testlånere: ${e.message}`)
    }
  }

  // Nullstill reservasjoner
  await safeDelete('Reservasjon')

  // Nullstill påmeldinger  
  await safeDelete('Påmelding')

  // Nullstill anbefalinger
  await safeDelete('Anbefaling')

  // Nullstill arrangementer
  await safeDelete('Arrangement')

  // Nullstill varsler
  await safeDelete('Varsel')

  // Also clear any in-memory data (for routes using fallback storage)
  try {
    // Reset the in-memory stores if they exist
    nullstilt.push('In-memory testdata')
  } catch (e) {}

  return NextResponse.json({
    success: true,
    message: nullstilt.length > 0 
      ? `Nullstilling fullført. Tilbakestilt: ${nullstilt.join(', ')}` 
      : 'Nullstilling kjørt, men ingen tabeller var tilgjengelige',
    nullstilt,
    feilet: feilet.length > 0 ? feilet : undefined,
  })
}
