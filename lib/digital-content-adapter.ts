/**
 * DIGITAL CONTENT ADAPTER
 * 
 * Håndterer kommunikasjon med digitale innholdsleverandører:
 * - Biblio: E-bøker og lydbøker
 * - Filmoteket: Film og serier
 * 
 * I DEMO-modus: Bruker mock-data
 * I PRODUKSJON: Kobler til faktiske API-er
 */

import { prisma } from '@/lib/prisma'

// Type definitions
export interface DigitalBook {
  id: string
  tittel: string
  forfatter: string
  type: 'ebok' | 'lydbok'
  coverUrl: string | null
  beskrivelse: string | null
  utgivelsesår: number | null
  sjanger: string
  tilgjengelig: boolean
  leverandør: 'biblio'
  lenkeTilInnhold: string
  isbn: string | null
}

export interface DigitalFilm {
  id: string
  tittel: string
  regissør: string | null
  type: 'film' | 'serie'
  coverUrl: string | null
  beskrivelse: string | null
  utgivelsesår: number | null
  sjanger: string
  tilgjengelig: boolean
  leverandør: 'filmoteket'
  lenkeTilInnhold: string
  varighet: string | null
}

// Configuration
const USE_MOCK = process.env.DIGITAL_CONTENT_MODE !== 'production'

/**
 * Hent digitale bøker (e-bøker og lydbøker)
 */
export async function getDigitalBooks(filters?: {
  type?: 'ebok' | 'lydbok'
  søk?: string
  sjanger?: string
}): Promise<DigitalBook[]> {
  if (USE_MOCK) {
    // DEMO: Mock data for digitale bøker
    const mockBooks: DigitalBook[] = [
      {
        id: 'ebok-1',
        tittel: 'De syv søstre',
        forfatter: 'Lucinda Riley',
        type: 'ebok',
        coverUrl: null,
        beskrivelse: 'Første bok i den episke sagaen om de syv søstrene',
        utgivelsesår: 2014,
        sjanger: 'Skjønnlitteratur',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/book/12345',
        isbn: '9788203262326'
      },
      {
        id: 'ebok-2',
        tittel: 'Krønikene fra Chicago',
        forfatter: 'Sara Paretsky',
        type: 'ebok',
        coverUrl: null,
        beskrivelse: 'Spenningsfylt krim fra Chicago',
        utgivelsesår: 2022,
        sjanger: 'Krim',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/book/12346',
        isbn: null
      },
      {
        id: 'lydbok-1',
        tittel: 'Fjellvettreglene',
        forfatter: 'Lars Mytting',
        type: 'lydbok',
        coverUrl: null,
        beskrivelse: 'En storslått fortelling om norsk bygdetradisjon',
        utgivelsesår: 2020,
        sjanger: 'Skjønnlitteratur',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/audiobook/23456',
        isbn: '9788205520134'
      },
      {
        id: 'lydbok-2',
        tittel: 'Folkenes hus',
        forfatter: 'Jo Nesbø',
        type: 'lydbok',
        coverUrl: null,
        beskrivelse: 'Spennende thriller fra mesteren',
        utgivelsesår: 2023,
        sjanger: 'Krim',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/audiobook/23457',
        isbn: '9788203357312'
      },
      {
        id: 'ebok-3',
        tittel: 'Historien',
        forfatter: 'Maja Lunde',
        type: 'ebok',
        coverUrl: null,
        beskrivelse: 'Om livet, døden og alt imellom',
        utgivelsesår: 2017,
        sjanger: 'Skjønnlitteratur',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/book/12347',
        isbn: '9788202568948'
      },
      {
        id: 'lydbok-3',
        tittel: 'Sapiens',
        forfatter: 'Yuval Noah Harari',
        type: 'lydbok',
        coverUrl: null,
        beskrivelse: 'Menneskehetens historie',
        utgivelsesår: 2015,
        sjanger: 'Fakta',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/audiobook/23458',
        isbn: '9788281690103'
      }
    ]

    // Filtrer basert på søkeparametere
    let filtered = mockBooks

    if (filters?.type) {
      filtered = filtered.filter(b => b.type === filters.type)
    }

    if (filters?.søk) {
      const søk = filters.søk.toLowerCase()
      filtered = filtered.filter(b =>
        b.tittel.toLowerCase().includes(søk) ||
        b.forfatter.toLowerCase().includes(søk)
      )
    }

    if (filters?.sjanger && filters.sjanger !== 'Alle') {
      filtered = filtered.filter(b => b.sjanger === filters.sjanger)
    }

    return filtered
  } else {
    // PRODUKSJON: Kall Biblio API
    const response = await fetch(
      `${process.env.BIBLIO_API_URL}/digital-content`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.BIBLIO_API_KEY}`
        }
      }
    )

    return await response.json()
  }
}

/**
 * Hent digitale filmer og serier
 */
export async function getDigitalFilms(filters?: {
  type?: 'film' | 'serie'
  søk?: string
  sjanger?: string
}): Promise<DigitalFilm[]> {
  if (USE_MOCK) {
    // DEMO: Mock data for filmer og serier
    const mockFilms: DigitalFilm[] = [
      {
        id: 'film-1',
        tittel: 'Kon-Tiki',
        regissør: 'Joachim Rønning, Espen Sandberg',
        type: 'film',
        coverUrl: null,
        beskrivelse: 'Thor Heyerdahls legendariske ekspedisjon',
        utgivelsesår: 2012,
        sjanger: 'Drama',
        tilgjengelig: true,
        leverandør: 'filmoteket',
        lenkeTilInnhold: 'https://filmoteket.no/film/kon-tiki',
        varighet: '118 min'
      },
      {
        id: 'film-2',
        tittel: 'Max Manus',
        regissør: 'Joachim Rønning, Espen Sandberg',
        type: 'film',
        coverUrl: null,
        beskrivelse: 'Historien om krigshelten Max Manus',
        utgivelsesår: 2008,
        sjanger: 'Drama',
        tilgjengelig: true,
        leverandør: 'filmoteket',
        lenkeTilInnhold: 'https://filmoteket.no/film/max-manus',
        varighet: '118 min'
      },
      {
        id: 'serie-1',
        tittel: 'SKAM',
        regissør: 'Julie Andem',
        type: 'serie',
        coverUrl: null,
        beskrivelse: 'Norsk ungdomsserie som ble verdenskjent',
        utgivelsesår: 2015,
        sjanger: 'Drama',
        tilgjengelig: true,
        leverandør: 'filmoteket',
        lenkeTilInnhold: 'https://filmoteket.no/serie/skam',
        varighet: '4 sesonger'
      },
      {
        id: 'film-3',
        tittel: 'Flåklypa Grand Prix',
        regissør: 'Ivo Caprino',
        type: 'film',
        coverUrl: null,
        beskrivelse: 'Tidløs norsk animasjonsfilm',
        utgivelsesår: 1975,
        sjanger: 'Animasjon',
        tilgjengelig: true,
        leverandør: 'filmoteket',
        lenkeTilInnhold: 'https://filmoteket.no/film/flaaklypa',
        varighet: '88 min'
      },
      {
        id: 'serie-2',
        tittel: 'Exit',
        regissør: 'Øystein Karlsen',
        type: 'serie',
        coverUrl: null,
        beskrivelse: 'Om fire finansmenn i Oslo',
        utgivelsesår: 2019,
        sjanger: 'Drama',
        tilgjengelig: true,
        leverandør: 'filmoteket',
        lenkeTilInnhold: 'https://filmoteket.no/serie/exit',
        varighet: '2 sesonger'
      },
      {
        id: 'film-4',
        tittel: 'Thelma',
        regissør: 'Joachim Trier',
        type: 'film',
        coverUrl: null,
        beskrivelse: 'Supernatural thriller fra Norge',
        utgivelsesår: 2017,
        sjanger: 'Thriller',
        tilgjengelig: true,
        leverandør: 'filmoteket',
        lenkeTilInnhold: 'https://filmoteket.no/film/thelma',
        varighet: '116 min'
      }
    ]

    // Filtrer basert på søkeparametere
    let filtered = mockFilms

    if (filters?.type) {
      filtered = filtered.filter(f => f.type === filters.type)
    }

    if (filters?.søk) {
      const søk = filters.søk.toLowerCase()
      filtered = filtered.filter(f =>
        f.tittel.toLowerCase().includes(søk) ||
        (f.regissør && f.regissør.toLowerCase().includes(søk))
      )
    }

    if (filters?.sjanger && filters.sjanger !== 'Alle') {
      filtered = filtered.filter(f => f.sjanger === filters.sjanger)
    }

    return filtered
  } else {
    // PRODUKSJON: Kall Filmoteket API
    const response = await fetch(
      `${process.env.FILMOTEKET_API_URL}/content`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FILMOTEKET_API_KEY}`
        }
      }
    )

    return await response.json()
  }
}
