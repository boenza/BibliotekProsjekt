/**
 * ILS ADAPTER - Integrated Library System
 * 
 * Dette er et abstraksjonslag som håndterer kommunikasjon med biblioteksystemet.
 * 
 * I DEMO-modus: Bruker mock-data fra vår database
 * I PRODUKSJON: Kobler til faktisk ILS (Bibliofil/Axiell/Bibsys/Koha)
 * 
 * Dette gjør det enkelt å bytte fra demo til produksjon uten å endre frontend-koden.
 */

import { prisma } from '@/lib/prisma'

// Type definitions
export interface ILSBook {
  id: string
  tittel: string
  forfatter: string
  isbn: string | null
  utgivelsesår: number | null
  forlag: string | null
  sjanger: string
  beskrivelse: string | null
  bildeUrl: string | null
  antallEks: number
  tilgjengelig: number
  språk: string
}

export interface ILSLoan {
  id: string
  bokTittel: string
  forfatter: string
  utlånt: Date
  forfallsdato: Date
  filial: string
  fornyet: number
}

export interface ILSReservation {
  id: string
  bokTittel: string
  forfatter: string
  plassering: number
  reservert: Date
  filial: string
  klar: boolean
}

// Configuration
const USE_MOCK = process.env.USE_MOCK_ILS !== 'false' // Default til mock for demo

/**
 * Søk i katalog
 */
export async function searchCatalog(query: string, sjanger?: string): Promise<ILSBook[]> {
  if (USE_MOCK) {
    // DEMO: Hent fra vår database
    const where: any = {}
    
    if (query) {
      where.OR = [
        { tittel: { contains: query, mode: 'insensitive' } },
        { forfatter: { contains: query, mode: 'insensitive' } }
      ]
    }
    
    if (sjanger && sjanger !== 'Alle') {
      where.sjanger = sjanger
    }
    
    console.log('🔎 Database søk WHERE:', JSON.stringify(where, null, 2))
    
    const result = await prisma.bok.findMany({
      where,
      orderBy: { tittel: 'asc' },
      take: 50
    })
    
    console.log('💾 Database returnerte:', result.length, 'bøker')
    
    return result
  } else {
    // PRODUKSJON: Kall ILS API
    const response = await fetch(
      `${process.env.ILS_API_URL}/search?q=${encodeURIComponent(query)}&genre=${sjanger}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.ILS_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('ILS API error')
    }
    
    return await response.json()
  }
}

/**
 * Hent brukerens lån
 */
export async function getUserLoans(brukerId: string): Promise<ILSLoan[]> {
  if (USE_MOCK) {
    // DEMO: Hent fra vår database
    const lån = await prisma.lån.findMany({
      where: { 
        brukerId,
        innlevert: null // Kun aktive lån
      },
      include: {
        bok: true
      },
      orderBy: { forfallsdato: 'asc' }
    })
    
    return lån.map((l: any) => ({
      id: l.id,
      bokTittel: l.bok.tittel,
      forfatter: l.bok.forfatter,
      utlånt: l.utlånt,
      forfallsdato: l.forfallsdato,
      filial: l.filial,
      fornyet: l.fornyet
    }))
  } else {
    // PRODUKSJON: Kall ILS API
    const response = await fetch(
      `${process.env.ILS_API_URL}/users/${brukerId}/loans`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.ILS_API_KEY}`
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('ILS API error')
    }
    
    return await response.json()
  }
}

/**
 * Hent brukerens reservasjoner
 */
export async function getUserReservations(brukerId: string): Promise<ILSReservation[]> {
  if (USE_MOCK) {
    // DEMO: Hent fra vår database
    const reservasjoner = await prisma.reservasjon.findMany({
      where: { brukerId },
      include: {
        bok: true
      },
      orderBy: { plassering: 'asc' }
    })
    
    return reservasjoner.map((r: any) => ({
      id: r.id,
      bokTittel: r.bok.tittel,
      forfatter: r.bok.forfatter,
      plassering: r.plassering,
      reservert: r.reservert,
      filial: r.filial,
      klar: r.klar
    }))
  } else {
    // PRODUKSJON: Kall ILS API
    const response = await fetch(
      `${process.env.ILS_API_URL}/users/${brukerId}/reservations`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.ILS_API_KEY}`
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('ILS API error')
    }
    
    return await response.json()
  }
}

/**
 * Forny lån
 */
export async function renewLoan(lånId: string): Promise<{ success: boolean; newDueDate?: Date; error?: string }> {
  if (USE_MOCK) {
    // DEMO: Oppdater database
    try {
      const newDueDate = new Date()
      newDueDate.setDate(newDueDate.getDate() + 28) // 4 uker fremover
      
      await prisma.lån.update({
        where: { id: lånId },
        data: {
          forfallsdato: newDueDate,
          fornyet: { increment: 1 }
        }
      })
      
      return { success: true, newDueDate }
    } catch (error) {
      return { success: false, error: 'Kunne ikke fornye lån' }
    }
  } else {
    // PRODUKSJON: Kall ILS API
    const response = await fetch(
      `${process.env.ILS_API_URL}/loans/${lånId}/renew`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ILS_API_KEY}`
        }
      }
    )
    
    return await response.json()
  }
}

/**
 * Reserver bok
 */
export async function reserveBook(brukerId: string, bokId: string, filial: string): Promise<{ success: boolean; error?: string }> {
  if (USE_MOCK) {
    // DEMO: Opprett reservasjon i database
    try {
      // Finn neste plass i køen
      const existingReservations = await prisma.reservasjon.count({
        where: { bokId }
      })
      
      const utløper = new Date()
      utløper.setDate(utløper.getDate() + 14) // 2 uker
      
      await prisma.reservasjon.create({
        data: {
          brukerId,
          bokId,
          filial,
          plassering: existingReservations + 1,
          utløper
        }
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Kunne ikke reservere bok' }
    }
  } else {
    // PRODUKSJON: Kall ILS API
    const response = await fetch(
      `${process.env.ILS_API_URL}/reservations`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ILS_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ brukerId, bokId, filial })
      }
    )
    
    return await response.json()
  }
}
