'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ReserverModalProps {
  isOpen: boolean
  onClose: () => void
  bok: { id: string; tittel: string; forfatter: string; isbn: string; coverUrl?: string }
  onSuccess: () => void
}

const rmIcons = {
  info: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
}

export default function ReserverModal({ isOpen, onClose, bok, onSuccess }: ReserverModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [filial, setFilial] = useState('Bergen hovedbibliotek')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const filialer = [
    'Bergen hovedbibliotek', 'Loddefjord bibliotek', 'Fyllingsdalen bibliotek',
    'Laksevåg bibliotek', 'Fana bibliotek', 'Åsane bibliotek', 'Arna bibliotek'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!session) { router.push(`/login?callbackUrl=/katalog`); return }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/reservasjoner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bokId: bok.id, filial })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Kunne ikke reservere')
      onSuccess(); onClose()
    } catch (err: any) { setError(err.message || 'Noe gikk galt') }
    finally { setIsSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reserver bok</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-start space-x-4">
            {bok.coverUrl && <img src={bok.coverUrl} alt={bok.tittel} className="w-16 h-24 object-cover rounded shadow-sm" />}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{bok.tittel}</h3>
              <p className="text-sm text-gray-600">{bok.forfatter}</p>
              <p className="text-xs text-gray-500 mt-1">ISBN: {bok.isbn}</p>
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hent ved filial *</label>
              <select value={filial} onChange={(e) => setFilial(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent" required>
                {filialer.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Velg hvilket bibliotek du vil hente boken fra</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="flex items-center gap-1.5 font-medium mb-1">
                <span className="text-blue-600">{rmIcons.info}</span> Viktig informasjon
              </p>
              <ul className="space-y-1 text-xs">
                <li>Du får beskjed når boken er klar til henting</li>
                <li>Reservasjonen er gyldig i 7 dager</li>
                <li>Du kan se plassering i kø på Min side</li>
              </ul>
            </div>

            {session && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                <p className="font-medium mb-1">Reserveres til:</p>
                <p>{session.user?.name || 'Ukjent navn'}</p>
                <p className="text-gray-600">{session.user?.email || 'Ingen e-post'}</p>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-4">
              <button type="submit" disabled={isSubmitting}
                className="flex-1 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Reserverer...' : 'Bekreft reservasjon'}
              </button>
              <button type="button" onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">Avbryt</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
