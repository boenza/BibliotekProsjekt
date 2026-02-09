'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface PåmeldingModalProps {
  isOpen: boolean
  onClose: () => void
  arrangement: {
    id: string
    tittel: string
    dato: string
    klokkeslett: string
    sted: string
    kapasitet: number
    påmeldte: number
  }
  onSuccess: () => void
}

export default function PåmeldingModal({ isOpen, onClose, arrangement, onSuccess }: PåmeldingModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [antallPersoner, setAntallPersoner] = useState(1)
  const [kommentar, setKommentar] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const ledigePlasser = arrangement.kapasitet - arrangement.påmeldte

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Sjekk om innlogget
    if (!session) {
      router.push(`/login?callbackUrl=/arrangementer`)
      return
    }

    // Sjekk kapasitet
    if (antallPersoner > ledigePlasser) {
      setError(`Kun ${ledigePlasser} plasser igjen`)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/pameldinger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arrangementId: arrangement.id,
          antallPersoner,
          kommentar: kommentar.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke melde på')
      }

      // Success!
      onSuccess()
      onClose()
      
      // Reset form
      setAntallPersoner(1)
      setKommentar('')
    } catch (err: any) {
      setError(err.message || 'Noe gikk galt')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Meld deg på
              </h2>
              <h3 className="text-lg text-gray-700 font-medium">
                {arrangement.tittel}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Arrangement info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center text-gray-700">
              <span className="w-6">📅</span>
              <span>{new Date(arrangement.dato).toLocaleDateString('nb-NO', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="w-6">🕐</span>
              <span>{arrangement.klokkeslett}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="w-6">📍</span>
              <span>{arrangement.sted}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="w-6">👥</span>
              <span>{ledigePlasser} av {arrangement.kapasitet} plasser ledige</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Antall personer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Antall personer *
              </label>
              <select
                value={antallPersoner}
                onChange={(e) => setAntallPersoner(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                required
              >
                {[...Array(Math.min(5, ledigePlasser))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'person' : 'personer'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Velg hvor mange som skal delta (inkludert deg selv)
              </p>
            </div>

            {/* Kommentar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kommentar eller spørsmål (valgfritt)
              </label>
              <textarea
                value={kommentar}
                onChange={(e) => setKommentar(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent resize-none"
                placeholder="F.eks. allergier, tilgjengelighet, eller andre behov..."
              />
            </div>

            {/* Bruker info */}
            {session && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">Din påmelding sendes som:</p>
                <p>{session.user?.name || 'Ukjent navn'}</p>
                <p className="text-blue-600">{session.user?.email || 'Ingen e-post'}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || ledigePlasser === 0}
                className="flex-1 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Melder på...' : 'Bekreft påmelding'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
