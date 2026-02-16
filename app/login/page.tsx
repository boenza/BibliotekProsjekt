'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/min-side'

  const [bibliotekkortnummer, setBibliotekkortnummer] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('bibliotekkortet', {
        bibliotekkortnummer,
        pin,
        redirect: false,
      })

      if (result?.error) {
        setError('Ugyldig lånekort eller PIN-kode')
        setIsLoading(false)
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError('Noe gikk galt. Prøv igjen.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16425b] to-[#2d6a8e] flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#16425b] rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Logg inn
            </h1>
            <p className="text-gray-600">
              Bergen Bibliotek
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lånekort
              </label>
              <input
                type="text"
                value={bibliotekkortnummer}
                onChange={(e) => setBibliotekkortnummer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="1234567890"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN-kode
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="****"
                required
                autoComplete="current-password"
                maxLength={4}
              />
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>
                Demo: Bruk PIN <strong>1234</strong> for alle brukere
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#16425b] text-white py-3 rounded-lg hover:bg-[#1a5270] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logger inn...' : 'Logg inn'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Demo-pålogging:
            </p>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Lånekort:</strong> 1234567890</p>
              <p><strong>PIN:</strong> 1234</p>
            </div>
          </div>

          {/* Registrer lenke */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-gray-700 mb-2">
              Har du ikke lånekort ennå?
            </p>
            <Link
              href="/registrer"
              className="inline-block px-6 py-2 bg-[#2d7a50] text-white rounded-lg hover:bg-[#236142] transition-colors font-medium text-sm"
            >
              Registrer deg her &rarr;
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              &larr; Tilbake til forsiden
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#16425b] to-[#2d6a8e] flex items-center justify-center">
        <div className="text-white text-lg">Laster...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
