import { NextResponse } from 'next/server'
import { hentData, lagreData } from '@/lib/persistens'

export interface Artikkel {
  id: string
  tittel: string
  ingress: string
  innhold: string
  bildeUrl: string | null
  kategori: string
  forfatter: string
  publisert: boolean
  opprettet: string
  oppdatert: string
}

const STANDARD_DATA: Artikkel[] = [
  {
    id: 'art-1',
    tittel: 'Nye aabningstider fra mars 2026',
    ingress: 'Fra 1. mars utvider Bergen Offentlige Bibliotek aabningstidene paa alle filialer.',
    innhold: 'Vi er glade for aa kunne melde at alle filialer faar utvidede aabningstider fra mars. Hovedbiblioteket vil vaere aapent mandag til fredag 09-21, og loerdager 10-17. Filialene i Loddefjord, Fana, Aasane og Fyllingsdalen faar tilsvarende utvidelse.\n\nDette er et resultat av ookt bevilgning fra Bergen kommune og et oenske om aa gjore biblioteket mer tilgjengelig for alle bergensere.',
    bildeUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800',
    kategori: 'Nyheter', forfatter: 'Redaksjonen',
    publisert: true, opprettet: '2026-02-01T10:00:00Z', oppdatert: '2026-02-01T10:00:00Z',
  },
  {
    id: 'art-2',
    tittel: 'Sommerlesekampanjen 2026 - bli med!',
    ingress: 'Ogsaa i aar inviterer vi barn og unge til sommerlesing. Les 8 boeker og faa diplom!',
    innhold: 'Sommerlesekampanjen starter 15. juni og varer hele sommeren. Alle barn og unge mellom 6 og 15 aar kan delta.\n\nSlik deltar du:\n1. Meld deg paa i biblioteket eller paa nett\n2. Les minst 8 boeker i loebet av sommeren\n3. Registrer boekene i appen\n4. Hent diplom og premie naar du er ferdig!\n\nI aar samarbeider vi med Bokhandlerforeningen om ekstra premier til de mest aktive leserne.',
    bildeUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
    kategori: 'Kampanjer', forfatter: 'Barneavdelingen',
    publisert: true, opprettet: '2026-02-05T14:00:00Z', oppdatert: '2026-02-05T14:00:00Z',
  },
  {
    id: 'art-3',
    tittel: 'Nytt digitalt tilbud: Pressreader',
    ingress: 'Naa kan du lese over 7000 aviser og magasiner gratis med laanekortet ditt.',
    innhold: 'Bergen Offentlige Bibliotek har inngaatt avtale med Pressreader som gir alle laanere tilgang til tusenvis av aviser og magasiner fraa hele verden.\n\nTilbudet er helt gratis og krever kun et gyldig laanekort. Du kan lese paa nettbrett, mobil eller PC.',
    bildeUrl: null,
    kategori: 'Digitalt', forfatter: 'Digital avdeling',
    publisert: false, opprettet: '2026-02-08T09:00:00Z', oppdatert: '2026-02-08T09:00:00Z',
  },
]

function hent(): Artikkel[] { return hentData('artikler', STANDARD_DATA) }
function lagre(data: Artikkel[]) { lagreData('artikler', data) }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const publisert = searchParams.get('publisert')
  let data = hent()
  if (publisert === 'true') data = data.filter(a => a.publisert)
  data.sort((a, b) => new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime())
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tittel, ingress, innhold, bildeUrl, kategori, forfatter, publisert } = body
    if (!tittel) return NextResponse.json({ error: 'Tittel er paakrevd' }, { status: 400 })

    const ny: Artikkel = {
      id: `art-${Date.now()}`, tittel,
      ingress: ingress || '', innhold: innhold || '',
      bildeUrl: bildeUrl || null, kategori: kategori || 'Nyheter',
      forfatter: forfatter || 'Redaksjonen',
      publisert: publisert ?? false,
      opprettet: new Date().toISOString(), oppdatert: new Date().toISOString(),
    }
    const alle = hent(); alle.push(ny); lagre(alle)
    return NextResponse.json(ny, { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Ugyldig foresporsel' }, { status: 400 }) }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...oppdateringer } = body
    if (!id) return NextResponse.json({ error: 'ID paakrevd' }, { status: 400 })
    const alle = hent()
    const idx = alle.findIndex(a => a.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
    const oppdatert = { ...alle[idx], ...oppdateringer, oppdatert: new Date().toISOString() }
    alle[idx] = oppdatert; lagre(alle)
    return NextResponse.json(oppdatert)
  } catch (e) { return NextResponse.json({ error: 'Ugyldig foresporsel' }, { status: 400 }) }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID paakrevd' }, { status: 400 })
  const alle = hent()
  const idx = alle.findIndex(a => a.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  alle.splice(idx, 1); lagre(alle)
  return NextResponse.json({ success: true })
}
