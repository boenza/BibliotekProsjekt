'use client'

import { useState, useEffect } from 'react'

interface Varsel {
  id: string
  tittel: string
  melding: string
  type: string
  ikon: string
}

/* ───── SVG Icons for varsel types ───── */
const varselIcons: Record<string, React.ReactNode> = {
  info: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
  advarsel: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>,
  viktig: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
}

const closeIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>

export default function VarselBanner() {
  const [varsler, setVarsler] = useState<Varsel[]>([])
  const [dismissedVarsler, setDismissedVarsler] = useState<string[]>([])

  useEffect(() => {
    fetchVarsler()
    const dismissed = localStorage.getItem('dismissedVarsler')
    if (dismissed) setDismissedVarsler(JSON.parse(dismissed))
  }, [])

  const fetchVarsler = async () => {
    try {
      const response = await fetch('/api/varsler')
      const data = await response.json()
      setVarsler(data)
    } catch (error) { console.error('Error fetching varsler:', error) }
  }

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissedVarsler, id]
    setDismissedVarsler(newDismissed)
    localStorage.setItem('dismissedVarsler', JSON.stringify(newDismissed))
  }

  const getBackgroundColor = (type: string) => {
    const lowerType = type.toLowerCase()
    switch (lowerType) {
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'advarsel': return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'viktig': return 'bg-red-50 border-red-200 text-red-900'
      default: return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  const getIconColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'info': return 'text-blue-600'
      case 'advarsel': return 'text-yellow-600'
      case 'viktig': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const visibleVarsler = varsler.filter(v => !dismissedVarsler.includes(v.id))
  if (visibleVarsler.length === 0) return null

  return (
    <div className="space-y-2">
      {visibleVarsler.map((varsel) => (
        <div key={varsel.id} className={`border rounded-lg p-4 ${getBackgroundColor(varsel.type)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <span className={getIconColor(varsel.type)}>
                {varselIcons[varsel.type.toLowerCase()] || varselIcons.info}
              </span>
              <div>
                <h3 className="font-semibold text-lg">{varsel.tittel}</h3>
                <p className="mt-1">{varsel.melding}</p>
              </div>
            </div>
            <button onClick={() => handleDismiss(varsel.id)}
              className="text-gray-500 hover:text-gray-700 ml-4 p-0.5" aria-label="Lukk varsel">
              {closeIcon}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
