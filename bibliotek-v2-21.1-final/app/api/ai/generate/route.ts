import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, type, bookTitle, bookAuthor } = await request.json()

    // Sjekk om vi har API-nøkkel
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.warn('⚠️ OPENAI_API_KEY mangler - bruker demo-modus')
      // Returner demo-respons hvis ingen API-nøkkel
      return NextResponse.json({
        text: getDemoResponse(type, bookTitle, bookAuthor),
        isDemoMode: true
      })
    }

    // Bygg system-prompt basert på type
    const systemPrompt = getSystemPrompt(type)
    
    // Kall OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Rask og billig modell
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error('AI-generering feilet')
    }

    const data = await response.json()
    const generatedText = data.choices[0].message.content

    return NextResponse.json({
      text: generatedText,
      isDemoMode: false
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Kunne ikke generere tekst' },
      { status: 500 }
    )
  }
}

function getSystemPrompt(type: string): string {
  const prompts: Record<string, string> = {
    recommendation: `Du er en erfaren bibliotekansatt som skriver engasjerende bokanbefalinger for norske bibliotekbrukere. 
    
Skriv på norsk (bokmål).
Bruk et personlig, varmt og inviterende språk.
Fokuser på hvorfor leseren vil elske boken.
Nevn hvem boken passer for.
Hold det til 2-3 setninger (maks 150 ord).
Unngå klisjeer og generiske formuleringer.`,

    event: `Du er en erfaren bibliotekansatt som skriver engasjerende eventbeskrivelser for norske bibliotekbrukere.

Skriv på norsk (bokmål).
Bruk et inviterende og inkluderende språk.
Forklar kort hva deltakerne vil oppleve.
Nevn hvem arrangementet passer for.
Hold det til 2-3 setninger (maks 150 ord).
Skap entusiasme uten å overdrive.`,

    improve: `Du er en språkkonsulent som hjelper bibliotekansatte med å forbedre tekster.

Skriv på norsk (bokmål).
Bruk klarspråk-prinsipper.
Gjør teksten mer lettlest og engasjerende.
Rett eventuelle skrivefeil.
Behold den personlige tonen.
Forslag forbedringer, ikke omskriv fullstendig.`,

    seo: `Du er en SEO-ekspert for norske bibliotek.

Generer SEO-optimaliserte metadata på norsk (bokmål).
Inkluder relevante søkeord.
Skriv naturlig, ikke keyword stuffing.
Fokuser på hva brukere faktisk søker etter.`
  }

  return prompts[type] || prompts.recommendation
}

function getDemoResponse(type: string, bookTitle?: string, bookAuthor?: string): string {
  // Demo-responser når vi ikke har API-nøkkel
  const demos: Record<string, string> = {
    recommendation: `Dette er en gripende roman som tar deg med på en reise gjennom norsk natur og menneskelige relasjoner. Perfekt for lesere som liker sterke karakterer, vakre landskapsbeskrivelser og historier som gir deg noe å tenke på lenge etter siste side. Anbefales spesielt for fans av nordisk samtidslitteratur.`,
    
    event: `Et inspirerende møte hvor deltakerne får innblikk i kreativ skriving og forfatterens arbeidsprosess. Arrangementet passer for alle som er interessert i litteratur, enten du selv skriver eller bare elsker å lese. Ta med spørsmål – det blir god tid til dialog!`,
    
    improve: `Foreslåtte forbedringer:\n- Gjør setningene kortere for bedre lesbarhet\n- Erstatt faguttrykk med enklere ord\n- Legg til konkrete eksempler\n- Bruk aktivt fremfor passivt språk`,
    
    seo: `Tittel: ${bookTitle || 'Arrangement'} | Bergen Bibliotek\nBeskrivelse: Opplev ${bookTitle || 'dette arrangementet'} ved Bergen Bibliotek. ${bookAuthor ? `Møt forfatter ${bookAuthor}` : 'Gratis for alle'}. Påmelding åpent nå.`
  }

  return demos[type] || demos.recommendation
}
