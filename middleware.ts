import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TENANTS: Record<string, string> = {
  'bergen.bibliotek.no': 'bergen',
  'oslo.bibliotek.no': 'oslo',
  'trondheim.bibliotek.no': 'trondheim',
  'localhost:3000': 'bergen', // Default for development
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || 'localhost:3000'
  const tenantId = TENANTS[hostname] || 'bergen'

  // Add tenant to response headers
  const response = NextResponse.next()
  response.headers.set('x-tenant-id', tenantId)
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
