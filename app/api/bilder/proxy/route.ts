import { NextResponse } from 'next/server'

/**
 * Proxy for eksterne bilder — unngår CORS-problemer ved canvas-eksport.
 * Bruk: /api/bilder/proxy?url=https://cdn.sanity.io/...
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'url parameter mangler' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return NextResponse.json({ error: 'Kunne ikke hente bilde' }, { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e) {
    console.error('Bilde-proxy feil:', e)
    return NextResponse.json({ error: 'Proxy-feil' }, { status: 500 })
  }
}
