'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Varsel {
  id: string
  tittel: string
  melding: string
  type: string
  ikon: string
  visningStart: string
  visningSlutt: string | null
  aktiv: boolean
  opprettet: string
}

/* ───── SVG Icons ───── */
const ic = {
  info: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
  warning: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>,
  alert: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>,
}

/** Maps varsel type to its SVG icon */
const TYPE_ICON: Record<string, React.ReactNode> = {
  info: ic.info,
  advarsel: ic.warning,
  viktig: ic.alert,
}

/** Maps varsel type to the icon key stored in DB (replaces emoji storage) */
const TYPE_ICON_KEY: Record<string, string> = {
  info: 'info',
  advarsel: 'warning',
  viktig: 'alert',
}

export default function VarslerPage() {
  const [varsler, setVarsler] = useState<Varsel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [tittel, setTittel] = useState('')
  const [melding, setMelding] = useState('')
  const [type, setType] = useState('info')
  const [ikon, setIkon] = useState('info')
  const [visningStart, setVisningStart] = useState('')
  const [visningSlutt, setVisningSlutt] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    fetchVarsler()
  }, [])

  const fetchVarsler = async () => {
    try {
      const response = await fetch('/api/varsler')
      const data = await response.json()
      setVarsler(data)
    } catch (error) {
      console.error('Error fetching varsler:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!tittel || !melding) {
      alert('Tittel og melding er påkrevd!')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/varsler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tittel,
          melding,
          type,
          ikon,
          visningStart: visningStart || undefined,
          visningSlutt: visningSlutt || undefined
        })
      })

      if (response.ok) {
        setTittel('')
        setMelding('')
        setType('info')
        setIkon('info')
        setVisningStart('')
        setVisningSlutt('')
        setShowNewForm(false)

        setToastMessage('Varsel opprettet!')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)

        await fetchVarsler()
      } else {
        alert('Kunne ikke opprette varsel')
      }
    } catch (error) {
      console.error('Error creating varsel:', error)
      alert('Feil ved opprettelse')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette varselet?')) {
      return
    }

    try {
      const response = await fetch(`/api/varsler?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setToastMessage('Varsel slettet!')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)

        await fetchVarsler()
      } else {
        alert('Kunne ikke slette varsel')
      }
    } catch (error) {
      console.error('Error deleting varsel:', error)
      alert('Feil ved sletting')
    }
  }

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase()
    switch (lowerType) {
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'advarsel':
        return 'bg-yellow-100 text-yellow-800'
      case 'viktig':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  /** Render icon for a varsel — supports both new SVG keys and legacy emoji */
  const renderVarselIcon = (iconValue: string) => {
    if (TYPE_ICON[iconValue]) return TYPE_ICON[iconValue]
    // Fallback for legacy emoji values — show info icon
    return ic.info
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Varsler</h1>
          <p className="text-gray-600 mt-1">Administrer viktige meldinger til brukerne</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium"
        >
          {showNewForm ? 'Avbryt' : '+ Nytt varsel'}
        </button>
      </div>

      {/* New varsel form */}
      {showNewForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Opprett nytt varsel</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tittel *
              </label>
              <input
                type="text"
                value={tittel}
                onChange={(e) => setTittel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="F.eks. Stengt i helgen"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value)
                  setIkon(TYPE_ICON_KEY[e.target.value] || 'info')
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
              >
                <option value="info">Info</option>
                <option value="advarsel">Advarsel</option>
                <option value="viktig">Viktig</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Melding *
              </label>
              <textarea
                value={melding}
                onChange={(e) => setMelding(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
                placeholder="Beskrivelse av varselet..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vis fra (valgfritt)
              </label>
              <input
                type="datetime-local"
                value={visningStart}
                onChange={(e) => setVisningStart(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vis til (valgfritt)
              </label>
              <input
                type="datetime-local"
                value={visningSlutt}
                onChange={(e) => setVisningSlutt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-6">
            <button
              onClick={handleCreate}
              disabled={isSaving}
              className="px-8 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium disabled:opacity-50"
            >
              {isSaving ? 'Oppretter...' : 'Opprett varsel'}
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              className="px-8 py-3 text-gray-600 hover:text-gray-900"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* List of varsler */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Laster varsler...
          </div>
        ) : varsler.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Ingen varsler ennå. Opprett ditt første!
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Varsel</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Periode</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {varsler.map((varsel) => (
                <tr key={varsel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500">{renderVarselIcon(varsel.ikon)}</span>
                      <div>
                        <div className="font-medium text-gray-900">{varsel.tittel}</div>
                        <div className="text-sm text-gray-500">{varsel.melding}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(varsel.type)}`}>
                      {varsel.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(varsel.visningStart).toLocaleDateString('nb-NO')}
                    {varsel.visningSlutt && ` - ${new Date(varsel.visningSlutt).toLocaleDateString('nb-NO')}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      varsel.aktiv ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {varsel.aktiv ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(varsel.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Slett
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
