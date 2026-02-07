import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Slett eksisterende data (for testing)
  await prisma.påmelding.deleteMany()
  await prisma.gebyr.deleteMany()
  await prisma.reservasjon.deleteMany()
  await prisma.lån.deleteMany()
  await prisma.bruker.deleteMany()
  await prisma.bok.deleteMany()
  await prisma.arrangement.deleteMany()
  await prisma.anbefaling.deleteMany()
  await prisma.artikkel.deleteMany()
  await prisma.filial.deleteMany()

  console.log('✅ Slettet eksisterende data')

  // === FILIALER ===
  const filialer = await prisma.filial.createMany({
    data: [
      {
        navn: 'Bergen Hovedbibliotek',
        adresse: 'Strømgaten 6',
        postnummer: '5015',
        poststed: 'Bergen',
        telefon: '55 56 85 60',
        epost: 'post@bergen.bibliotek.no',
        åpningstider: JSON.stringify({
          mandag: '10:00-20:00',
          tirsdag: '10:00-20:00',
          onsdag: '10:00-20:00',
          torsdag: '10:00-20:00',
          fredag: '10:00-18:00',
          lørdag: '10:00-16:00',
          søndag: 'Stengt'
        }),
        latitude: 60.3913,
        longitude: 5.3221,
        aktiv: true
      },
      {
        navn: 'Laksevåg bibliotek',
        adresse: 'Krossadammen 2',
        postnummer: '5164',
        poststed: 'Laksevåg',
        telefon: '55 56 85 70',
        åpningstider: JSON.stringify({
          mandag: '12:00-19:00',
          tirsdag: '12:00-19:00',
          onsdag: '12:00-19:00',
          torsdag: '12:00-19:00',
          fredag: 'Stengt',
          lørdag: '10:00-15:00',
          søndag: 'Stengt'
        }),
        aktiv: true
      },
      {
        navn: 'Fyllingsdalen bibliotek',
        adresse: 'Solheimsgaten 1',
        postnummer: '5147',
        poststed: 'Fyllingsdalen',
        telefon: '55 56 85 75',
        åpningstider: JSON.stringify({
          mandag: '12:00-19:00',
          tirsdag: '12:00-19:00',
          onsdag: '12:00-19:00',
          torsdag: '12:00-19:00',
          fredag: 'Stengt',
          lørdag: '10:00-15:00',
          søndag: 'Stengt'
        }),
        aktiv: true
      }
    ]
  })

  console.log('✅ Opprettet filialer')

  // === BØKER ===
  const bøker = await prisma.bok.createMany({
    data: [
      {
        tittel: 'Tore på sporet',
        forfatter: 'Anne B. Ragde',
        isbn: '9788205464377',
        utgivelsesår: 2015,
        forlag: 'Tiden',
        sjanger: 'Skjønnlitteratur',
        beskrivelse: 'En roman om familie, hemmeligheter og forsoning.',
        bildeUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        antallEks: 3,
        tilgjengelig: 2
      },
      {
        tittel: 'Doppler',
        forfatter: 'Erlend Loe',
        isbn: '9788203234569',
        utgivelsesår: 2004,
        forlag: 'Cappelen Damm',
        sjanger: 'Skjønnlitteratur',
        beskrivelse: 'En absurd og morsom roman om en mann som flytter til skogen.',
        bildeUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
        antallEks: 2,
        tilgjengelig: 1
      },
      {
        tittel: 'Historien om et ekteskap',
        forfatter: 'Geir Gulliksen',
        isbn: '9788202478469',
        utgivelsesår: 2016,
        forlag: 'Cappelen Damm',
        sjanger: 'Skjønnlitteratur',
        beskrivelse: 'En sterk og personlig roman om kjærlighet og tap.',
        bildeUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
        antallEks: 4,
        tilgjengelig: 4
      }
    ]
  })

  console.log('✅ Opprettet bøker')

  // === ANBEFALINGER ===
  const anbefalinger = await prisma.anbefaling.createMany({
    data: [
      {
        tittel: 'Tore på sporet',
        forfatter: 'Anne B. Ragde',
        beskrivelse: 'En gripende familieroman som tar deg med inn i hjertet av norsk natur og komplekse menneskelige relasjoner. Ragde skriver med varme og humor om familie, hemmeligheter og det å finne veien hjem.',
        bildeUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
        sjanger: 'Skjønnlitteratur',
        målgruppe: 'Voksen',
        publisert: true
      },
      {
        tittel: 'Doppler',
        forfatter: 'Erlend Loe',
        beskrivelse: 'En absurd, morsom og tankevekkende roman om en mann som melder seg ut av samfunnet og flytter til Nordmarka. Perfekt for deg som liker norsk samtidslitteratur med et snev av eksistensialisme.',
        bildeUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
        sjanger: 'Skjønnlitteratur',
        målgruppe: 'Voksen',
        publisert: true
      },
      {
        tittel: 'Historien om et ekteskap',
        forfatter: 'Geir Gulliksen',
        beskrivelse: 'En rå og ærlig skildring av kjærlighet, tap og sorg. Gulliksen skriver med en sårbarhet som treffer rett i hjertet. Anbefales på det varmeste til alle som elsker sterk norsk samtidslitteratur.',
        bildeUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
        sjanger: 'Skjønnlitteratur',
        målgruppe: 'Voksen',
        publisert: true
      }
    ]
  })

  console.log('✅ Opprettet anbefalinger')

  // === ARRANGEMENTER ===
  const iMorgen = new Date()
  iMorgen.setDate(iMorgen.getDate() + 1)
  
  const nestUke = new Date()
  nestUke.setDate(nestUke.getDate() + 7)

  const arrangementer = await prisma.arrangement.createMany({
    data: [
      {
        tittel: 'Forfattermøte med Jo Nesbø',
        beskrivelse: 'Kom og møt Norges mest leste krimforfatter! Jo Nesbø forteller om sin nye bok og svarer på spørsmål fra publikum. Gratis inngang, men begrenset antall plasser.',
        dato: nestUke,
        klokkeslett: '19:00',
        varighet: 90,
        sted: 'Bergen Hovedbibliotek',
        kategori: 'Forfattermøte',
        bildeUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
        kapasitet: 120,
        påmeldte: 98,
        påmeldingÅpen: true,
        publisert: true
      },
      {
        tittel: 'Eventyrtime for de minste',
        beskrivelse: 'Hver onsdag inviterer vi barn mellom 3-6 år til eventyrtime! Vi leser høyt, synger sanger og har det moro sammen. Ta med mamma, pappa eller besteforeldre!',
        dato: iMorgen,
        klokkeslett: '10:30',
        varighet: 45,
        sted: 'Laksevåg bibliotek',
        kategori: 'Barn',
        bildeUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
        kapasitet: 30,
        påmeldte: 18,
        påmeldingÅpen: true,
        publisert: true
      }
    ]
  })

  console.log('✅ Opprettet arrangementer')

  // === ARTIKLER ===
  const artikler = await prisma.artikkel.createMany({
    data: [
      {
        tittel: '5 tips til bedre lesing',
        ingress: 'Vil du lese mer, men sliter med å finne tid? Her er våre beste tips!',
        innhold: 'Les 10 minutter før du legger deg, alltid ha en bok tilgjengelig, sett deg et lesemål, bli med i en boklubb, prøv lydbøker på farten.',
        forfatter: 'Bibliotekredaksjonen',
        kategori: 'Tips',
        publisert: true,
        publisertDato: new Date()
      }
    ]
  })

  console.log('✅ Opprettet artikler')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
