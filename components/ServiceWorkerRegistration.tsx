'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('SW registered:', reg.scope)

          // Auto-oppdatering
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  // Stille oppdatering — refresh neste gang brukeren navigerer
                  console.log('Ny versjon klar')
                }
              })
            }
          })
        })
        .catch((err) => console.log('SW registration failed:', err))
    }
  }, [])

  return null
}
