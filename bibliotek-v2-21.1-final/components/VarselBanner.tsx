'use client'

import { useState, useEffect } from 'react'

interface Varsel {
  id: string
  tittel: string
  melding: string
  type: string
  ikon: string
}

export default function VarselBanner() {
  const [varsler, setVarsler] = useState<Varsel[]>([])
  const [dismissedVarsler, setDismissedVarsler] = useState<string[]>([])

  useEffect(() => {
    fetchVarsler()
    
    // Hent dismissed varsler fra localStorage
    const dismissed = localStorage.getItem('dismissedVarsler')
    if (dismissed) {
      setDismissedVarsler(JSON.parse(dismissed))
    }
  }, [])

  const fetchVarsler = async () => {
    try {
      const response = await fetch('/api/varsler')
      const data = await response.json()
      setVarsler(data)
    } catch (error) {
      console.error('Error fetching varsler:', error)
    }
  }

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissedVarsler, id]
    setDismissedVarsler(newDismissed)
    localStorage.setItem('dismissedVarsler', JSON.stringify(newDismissed))
  }

  const getBackgroundColor = (type: string) => {
    const lowerType = type.toLowerCase()
    switch (lowerType) {
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'advarsel':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'viktig':
        return 'bg-red-50 border-red-200 text-red-900'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  const visibleVarsler = varsler.filter(v => !dismissedVarsler.includes(v.id))

  if (visibleVarsler.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {visibleVarsler.map((varsel) => (
        <div
          key={varsel.id}
          className={`border rounded-lg p-4 ${getBackgroundColor(varsel.type)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{varsel.ikon}</span>
              <div>
                <h3 className="font-semibold text-lg">{varsel.tittel}</h3>
                <p className="mt-1">{varsel.melding}</p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(varsel.id)}
              className="text-gray-500 hover:text-gray-700 ml-4"
              aria-label="Lukk varsel"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
