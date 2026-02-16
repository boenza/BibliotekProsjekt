'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface PåmeldingModalProps {
  isOpen: boolean
  onClose: () => void
  arrangement: {
    id: string; tittel: string; dato: string; klokkeslett: string
    sted: string; kapasitet: number; påmeldte: number
  }
  onSuccess: () => void
}

const pmIcons = {
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  pin: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
}

export default function PåmeldingModal({ isOpen, onClose, arrangement, onSuccess }: PåmeldingModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [antallPersoner, setAntallPersoner] = useState(1)
  const [kommentar, setKommentar] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const kapasitet = arrangement.kapasitet || 50
  const påmeldte = arrangement.påmeldte || 0
  const ledigePlasser = Math.max(0, kapasitet - påmeldte)
  const maxValg = Math.max(1, Math.min(5, ledigePlasser))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!session) { router.push(`/login?callbackUrl=/arrangementer`); return }
    if (antallPersoner > ledigePlasser) { setError(`Kun ${ledigePlasser} plasser igjen`); return }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/pameldinger', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arrangementId: arrangement.id, antallPersoner, kommentar: kommentar.trim() || null })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Kunne ikke melde på')
      onSuccess(); onClose(); setAntallPersoner(1); setKommentar('')
    } catch (err: any) { setError(err.message || 'Noe gikk galt') }
    finally { setIsSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Meld deg på</h2>
              <h3 className="text-lg text-gray-700 font-medium">{arrangement.tittel}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2.5">
            <div className="flex items-center gap-2.5 text-gray-700">
              <span className="text-gray-400">{pmIcons.calendar}</span>
              <span>{new Date(arrangement.dato).toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-700">
              <span className="text-gray-400">{pmIcons.clock}</span>
              <span>{arrangement.klokkeslett}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-700">
              <span className="text-gray-400">{pmIcons.pin}</span>
              <span>{arrangement.sted}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-700">
              <span className="text-gray-400">{pmIcons.users}</span>
              <span>{ledigePlasser} av {kapasitet} plasser ledige</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {ledigePlasser === 0 ? (
            <div className="text-center py-6">
              <p className="text-lg font-medium text-red-600 mb-2">Arrangementet er fullt</p>
              <p className="text-gray-600 text-sm">Ingen ledige plasser igjen.</p>
              <button onClick={onClose} className="mt-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Lukk</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Antall personer *</label>
                <select value={antallPersoner} onChange={(e) => setAntallPersoner(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent" required>
                  {Array.from({ length: maxValg }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'person' : 'personer'}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Velg hvor mange som skal delta (inkludert deg selv)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kommentar eller spørsmål (valgfritt)</label>
                <textarea value={kommentar} onChange={(e) => setKommentar(e.target.value)} rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent resize-none"
                  placeholder="F.eks. allergier, tilgjengelighet, eller andre behov..." />
              </div>
              {session && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="font-medium mb-1">Din påmelding sendes som:</p>
                  <p>{session.user?.name || 'Ukjent navn'}</p>
                  <p className="text-blue-600">{session.user?.email || 'Ingen e-post'}</p>
                </div>
              )}
              <div className="flex items-center space-x-3 pt-4">
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Melder på...' : 'Bekreft påmelding'}
                </button>
                <button type="button" onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">Avbryt</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
