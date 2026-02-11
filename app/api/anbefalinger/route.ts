import { NextResponse } from 'next/server'

// In-memory store (erstattes av Prisma/database i produksjon)
let anbefalinger = [
  {
    id: 'anb-1',
    tittel: 'Dei sju dørene',
    forfatter: 'Agnes Ravatn',
    beskrivelse: 'Ein hypnotisk roman om ei kvinne som kjøper eit gamalt hus ved Hardangerfjorden og oppdagar hemmelege rom og ei mørk fortid. Ravatn skriv med ein spenning som held deg fast frå første til siste side. Perfekt for deg som likar atmosfæriske forteljingar med psykologisk djupn.',
    bildeUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    publisert: true,
    opprettet: '2026-01-15T10:00:00Z',
    katalogId: 'bok-1',
  },
  {
    id: 'anb-2',
    tittel: 'Bergens hemmeligheter',
    forfatter: 'Gunnar Staalesen',
    beskrivelse: 'Staalesen tar oss med på ein rundtur i Bergen vi ikkje visste eksisterte. Frå dei skjulte smugene i Sandviken til dei løynde tunnelane under Bryggen — denne boka er ein kjærleikserklæring til byen vår. Anbefalt for alle bergensarar og tilreisande.',
    bildeUrl: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400',
    publisert: true,
    opprettet: '2026-01-20T14:30:00Z',
    katalogId: null,
  },
  {
    id: 'anb-3',
    tittel: 'Fuglane',
    forfatter: 'Tarjei Vesaas',
    beskrivelse: 'Ein tidlaus norsk klassikar om Mattis og Hege — to søsken som lever isolert ved eit tjern. Vesaas\u0027 poetiske språk gjer dette til ei heilt unik leseopplevving. Boka handlar om einsemd, kommunikasjon og det å vere annleis. Ein av dei vakraste romanane i norsk litteraturhistorie.',
    bildeUrl: null,
    publisert: true,
    opprettet: '2026-02-01T09:00:00Z',
    katalogId: null,
  },
  {
    id: 'anb-4',
    tittel: 'Lurt av satisfaksjon',
    forfatter: 'Kari Lossius',
    beskrivelse: 'Ei fascinerande bok om korleis hjernen vår blir lurt av digitale dopaminutløysingar. Lossius forklarer kvifor vi scrollar i timevis og korleis vi kan ta tilbake kontrollen. Særleg relevant for foreldre og ungdomar.',
    bildeUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    publisert: false,
    opprettet: '2026-02-05T16:00:00Z',
    katalogId: null,
  },
]

// GET — hent alle (eller filtrert på publisert)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const kunPublisert = searchParams.get('publisert')

  let resultat = [...anbefalinger]

  if (kunPublisert === 'true') {
    resultat = resultat.filter(a => a.publisert)
  }

  // Sorter nyeste først
  resultat.sort((a, b) => new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime())

  return NextResponse.json(resultat)
}

// POST — opprett ny anbefaling
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tittel, forfatter, beskrivelse, bildeUrl, katalogId, publisert } = body

    if (!tittel || !beskrivelse) {
      return NextResponse.json({ error: 'Tittel og beskrivelse er påkrevd' }, { status: 400 })
    }

    const nyAnbefaling = {
      id: `anb-${Date.now()}`,
      tittel,
      forfatter: forfatter || null,
      beskrivelse,
      bildeUrl: bildeUrl || null,
      publisert: publisert ?? false,
      opprettet: new Date().toISOString(),
      katalogId: katalogId || null,
    }

    anbefalinger.push(nyAnbefaling)

    return NextResponse.json(nyAnbefaling, { status: 201 })
  } catch (error) {
    console.error('POST /api/anbefalinger error:', error)
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
  }
}

// PATCH — oppdater anbefaling (rediger felt og/eller toggle publisering)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...oppdateringer } = body

    if (!id) {
      return NextResponse.json({ error: 'ID er påkrevd' }, { status: 400 })
    }

    const index = anbefalinger.findIndex(a => a.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Anbefaling ikke funnet' }, { status: 404 })
    }

    // Oppdater kun feltene som er sendt
    const oppdatert = { ...anbefalinger[index] }

    if ('tittel' in oppdateringer) oppdatert.tittel = oppdateringer.tittel
    if ('forfatter' in oppdateringer) oppdatert.forfatter = oppdateringer.forfatter
    if ('beskrivelse' in oppdateringer) oppdatert.beskrivelse = oppdateringer.beskrivelse
    if ('bildeUrl' in oppdateringer) oppdatert.bildeUrl = oppdateringer.bildeUrl
    if ('publisert' in oppdateringer) oppdatert.publisert = oppdateringer.publisert
    if ('katalogId' in oppdateringer) oppdatert.katalogId = oppdateringer.katalogId

    anbefalinger[index] = oppdatert

    return NextResponse.json(oppdatert)
  } catch (error) {
    console.error('PATCH /api/anbefalinger error:', error)
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
  }
}

// DELETE — slett anbefaling
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID er påkrevd' }, { status: 400 })
    }

    const index = anbefalinger.findIndex(a => a.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Anbefaling ikke funnet' }, { status: 404 })
    }

    const slettet = anbefalinger.splice(index, 1)[0]

    return NextResponse.json({ success: true, slettet: slettet.tittel })
  } catch (error) {
    console.error('DELETE /api/anbefalinger error:', error)
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
  }
}
