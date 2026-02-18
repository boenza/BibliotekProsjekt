/**
 * DIGITAL CONTENT ADAPTER
 * 
 * Håndterer kommunikasjon med digitale innholdsleverandører:
 * - Biblio: E-bøker og lydbøker
 * - Filmoteket: Film og serier
 * 
 * I DEMO-modus: Bruker mock-data
 * I PRODUKSJON: Kobler til faktiske API-er
 * 
 * BILDER: Legg bokomslag/filmplakater i public/covers/ med filnavnene nedenfor.
 * Manglende bilder vises med fallback-ikon automatisk.
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
    const mockBooks: DigitalBook[] = [
      {
        id: 'ebok-1',
        tittel: 'De syv søstre',
        forfatter: 'Lucinda Riley',
        type: 'ebok',
        coverUrl: '/covers/de-syv-sostre.jpg',       // ← legg bilde her
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
        tittel: 'Doppler',
        forfatter: 'Erlend Loe',
        type: 'ebok',
        coverUrl: '/covers/doppler.jpg',
        beskrivelse: 'En mann velger å flytte ut i skogen med en elgkalv',
        utgivelsesår: 2004,
        sjanger: 'Skjønnlitteratur',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/book/12346',
        isbn: '9788202264192'
      },
      {
        id: 'lydbok-1',
        tittel: 'Svøm med dem som drukner',
        forfatter: 'Lars Mytting',
        type: 'lydbok',
        coverUrl: '/covers/svom-med-dem.jpg',
        beskrivelse: 'En storslått fortelling fra Lars Mytting',
        utgivelsesår: 2014,
        sjanger: 'Skjønnlitteratur',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/audiobook/23456',
        isbn: '9788203361722'
      },
      {
        id: 'lydbok-2',
        tittel: 'Blod på snø',
        forfatter: 'Jo Nesbø',
        type: 'lydbok',
        coverUrl: '/covers/blod-paa-sno.jpg',
        beskrivelse: 'Spennende thriller fra mesteren',
        utgivelsesår: 2015,
        sjanger: 'Krim',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/audiobook/23457',
        isbn: '9788203357312'
      },
      {
        id: 'ebok-3',
        tittel: 'Bienes historie',
        forfatter: 'Maja Lunde',
        type: 'ebok',
        coverUrl: '/covers/bienes-historie.jpg',
        beskrivelse: 'Tre generasjoner, tre historier — alle forbundet av biene',
        utgivelsesår: 2015,
        sjanger: 'Skjønnlitteratur',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/book/12347',
        isbn: '9788203293863'
      },
      {
        id: 'lydbok-3',
        tittel: 'Sapiens',
        forfatter: 'Yuval Noah Harari',
        type: 'lydbok',
        coverUrl: '/covers/sapiens.jpg',
        beskrivelse: 'Menneskehetens historie',
        utgivelsesår: 2015,
        sjanger: 'Fakta',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/audiobook/23458',
        isbn: '9780062316097'
      },
      {
        id: 'ebok-4',
        tittel: 'Berlinerpoplene',
        forfatter: 'Anne B. Ragde',
        type: 'ebok',
        coverUrl: '/covers/berlinerpoplene.jpg',
        beskrivelse: 'Første bok i den populære Berlinerpoplene-trilogien',
        utgivelsesår: 2004,
        sjanger: 'Skjønnlitteratur',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/book/12349',
        isbn: '9788249506767'
      },
      {
        id: 'lydbok-4',
        tittel: 'Naiv. Super',
        forfatter: 'Erlend Loe',
        type: 'lydbok',
        coverUrl: '/covers/naiv-super.jpg',
        beskrivelse: 'Moderne norsk klassiker om å finne mening',
        utgivelsesår: 1996,
        sjanger: 'Skjønnlitteratur',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/audiobook/23459',
        isbn: '9788202243289'
      },
      {
        id: 'ebok-5',
        tittel: 'Snømannen',
        forfatter: 'Jo Nesbø',
        type: 'ebok',
        coverUrl: '/covers/snomannen.jpg',
        beskrivelse: 'Harry Hole-krim som ble filmatisert',
        utgivelsesår: 2007,
        sjanger: 'Krim',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/book/12350',
        isbn: '9780099520276'
      },
      {
        id: 'lydbok-5',
        tittel: 'Halvbroren',
        forfatter: 'Lars Saabye Christensen',
        type: 'lydbok',
        coverUrl: '/covers/halvbroren.jpg',
        beskrivelse: 'Norsk litterær klassiker om to halvbrødre i Oslo',
        utgivelsesår: 2001,
        sjanger: 'Skjønnlitteratur',
        tilgjengelig: true,
        leverandør: 'biblio',
        lenkeTilInnhold: 'https://biblio.no/audiobook/23461',
        isbn: '9788202219413'
      }
    ]

    let filtered = mockBooks
    if (filters?.type) filtered = filtered.filter(b => b.type === filters.type)
    if (filters?.søk) {
      const søk = filters.søk.toLowerCase()
      filtered = filtered.filter(b => b.tittel.toLowerCase().includes(søk) || b.forfatter.toLowerCase().includes(søk))
    }
    if (filters?.sjanger && filters.sjanger !== 'Alle') filtered = filtered.filter(b => b.sjanger === filters.sjanger)
    return filtered
  } else {
    const response = await fetch(`${process.env.BIBLIO_API_URL}/digital-content`, {
      headers: { 'Authorization': `Bearer ${process.env.BIBLIO_API_KEY}` }
    })
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
    const mockFilms: DigitalFilm[] = [
      {
        id: 'film-1',
        tittel: 'Kon-Tiki',
        regissør: 'Joachim Rønning, Espen Sandberg',
        type: 'film',
        coverUrl: '/covers/kon-tiki.jpg',             // ← legg bilde her
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
        coverUrl: '/covers/max-manus.jpg',
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
        coverUrl: '/covers/skam.jpg',
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
        coverUrl: '/covers/flaaklypa.jpg',
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
        coverUrl: '/covers/exit.jpg',
        beskrivelse: 'Om fire finansmenn i Oslo',
        utgivelsesår: 2019,
        sjanger: 'Drama',
        tilgjengelig: true,
        leverandør: 'filmoteket',
        lenkeTilInnhold: 'https://filmoteket.no/serie/exit',
        varighet: '2 sesonger'
      }
    ]

    let filtered = mockFilms
    if (filters?.type) filtered = filtered.filter(f => f.type === filters.type)
    if (filters?.søk) {
      const søk = filters.søk.toLowerCase()
      filtered = filtered.filter(f => f.tittel.toLowerCase().includes(søk) || (f.regissør && f.regissør.toLowerCase().includes(søk)))
    }
    if (filters?.sjanger && filters.sjanger !== 'Alle') filtered = filtered.filter(f => f.sjanger === filters.sjanger)
    return filtered
  } else {
    const response = await fetch(`${process.env.FILMOTEKET_API_URL}/content`, {
      headers: { 'Authorization': `Bearer ${process.env.FILMOTEKET_API_KEY}` }
    })
    return await response.json()
  }
}
