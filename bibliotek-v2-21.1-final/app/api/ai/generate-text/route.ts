import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, type, context } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt er påkrevd' },
        { status: 400 }
      )
    }

    // Bygg system prompt basert på type
    let systemPrompt = ''
    
    switch (type) {
      case 'anbefaling':
        systemPrompt = `Du er en erfaren bibliotekar som skriver engasjerende anbefalinger av bøker. 
Skriv på norsk (bokmål) i en varm, inviterende tone. 
Fokuser på hva som gjør boken spesiell, hvem den passer for, og hvorfor leseren bør låne den.
Hold anbefalingen mellom 100-200 ord.
Bruk klarspråk og unngå klisjeer.`
        break
        
      case 'arrangement':
        systemPrompt = `Du er en bibliotekar som skriver beskrivelser av arrangementer.
Skriv på norsk (bokmål) i en entusiastisk og inviterende tone.
Forklar hva arrangementet går ut på, hva deltakerne kan forvente, og hvorfor de bør komme.
Hold beskrivelsen mellom 80-150 ord.
Bruk klarspråk og aktiv form.`
        break
        
      case 'artikkel':
        systemPrompt = `Du er en bibliotekar som skriver artikler og blogginnlegg.
Skriv på norsk (bokmål) i en informativ og engasjerende tone.
Strukturer innholdet godt med en klar innledning, hoveddel og avslutning.
Bruk klarspråk og variert setningsstruktur.`
        break
        
      case 'forbedring':
        systemPrompt = `Du er en språkkonsulent som forbedrer tekster for bibliotek.
Skriv på norsk (bokmål) og fokuser på:
- Klarspråk (enkle ord, korte setninger)
- Aktiv form fremfor passiv
- Korrekt grammatikk og tegnsetting
- Konsistent tone
Behold tekstens intensjon og budskap.`
        break
        
      default:
        systemPrompt = 'Du er en hjelpsom AI-assistent for bibliotek. Skriv på norsk (bokmål).'
    }

    // Kall OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Rask og billig
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt + (context ? `\n\nKontekst: ${context}` : '') },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const generatedText = completion.choices[0]?.message?.content

    if (!generatedText) {
      return NextResponse.json(
        { error: 'Kunne ikke generere tekst' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      text: generatedText,
      usage: completion.usage,
    })

  } catch (error: any) {
    console.error('OpenAI API error:', error)
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Ugyldig API-nøkkel. Legg til OPENAI_API_KEY i .env.local' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Noe gikk galt' },
      { status: 500 }
    )
  }
}
