'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Anbefaling {
  id: string
  tittel: string
  forfatter: string
  beskrivelse: string
  bildeUrl: string | null
  sjanger: string
}

export default function PersonalisertSeksjon() {
  const { data: session, status } = useSession()
  const [anbefalinger, setAnbefalinger] = useState<Anbefaling[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPersonalisert()
    } else {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const fetchPersonalisert = async () => {
    try {
      const res = await fetch('/api/katalog?antall=4')
      const data = await res.json()
      if (Array.isArray(data)) {
        setAnbefalinger(data.slice(0, 4).map((bok: any) => ({
          id: bok.id,
          tittel: bok.tittel,
          forfatter: bok.forfatter,
          beskrivelse: bok.beskrivelse || '',
          bildeUrl: bok.bildeUrl || null,
          sjanger: bok.sjanger || 'Roman',
        })))
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Ikke vis noe for utloggede eller under lasting
  if (status !== 'authenticated' || isLoading) return null
  if (anbefalinger.length === 0) return null

  const userName = session?.user?.name?.split(' ')[0] || 'deg'

  return (
    <section
      ref={sectionRef}
      className="py-14 md:py-16"
      style={{
        background: 'linear-gradient(135deg, rgba(15,61,84,0.03) 0%, rgba(245,239,230,0.5) 50%, rgba(199,91,63,0.03) 100%)',
      }}
    >
      <div className="container-custom">
        {/* Section header */}
        <div className={`mb-8 animate-fade-up`}>
          <div className="flex items-center gap-2 mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--terracotta, #c75b3f)" strokeWidth="2" strokeLinecap="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            <span
              className="text-xs font-medium tracking-wider uppercase"
              style={{ color: 'var(--terracotta, #c75b3f)' }}
            >
              Anbefalt for {userName}
            </span>
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink, #1a1f2e)' }}
          >
            Basert på dine interesser
          </h2>
        </div>

        {/* Horizontal scroll cards */}
        <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {anbefalinger.map((bok, i) => (
            <Link
              key={bok.id}
              href={`/katalog?q=${encodeURIComponent(bok.tittel)}`}
              className={`group flex-shrink-0 w-56 rounded-2xl overflow-hidden card-lift snap-start animate-fade-up`}
              style={{
                animationDelay: `${0.1 + i * 0.08}s`,
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              {/* Cover */}
              <div className="h-36 overflow-hidden">
                {bok.bildeUrl ? (
                  <img
                    src={bok.bildeUrl}
                    alt={bok.tittel}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--sand, #f5efe6) 0%, var(--sand-warm, #ede4d6) 100%)' }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sand-deep, #d9cdbf)" strokeWidth="1.2">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
                    </svg>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <span className="badge badge-terracotta mb-2" style={{ fontSize: '10px' }}>
                  {bok.sjanger}
                </span>
                <h3
                  className="font-bold text-sm leading-snug mb-0.5 group-hover:text-[#0f3d54] transition-colors line-clamp-2"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
                >
                  {bok.tittel}
                </h3>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                  {bok.forfatter}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
