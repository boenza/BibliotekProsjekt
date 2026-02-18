'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(165deg, #0a2a3c 0%, #0f3d54 30%, #16526e 60%, #1a7a9e 100%)',
        minHeight: '520px',
      }}
    >
      {/* Atmospheric layers */}
      <div className="absolute inset-0" style={{ opacity: 0.5 }}>
        {/* Mountain silhouette hint */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '40%',
            background: 'linear-gradient(to top, rgba(10, 42, 60, 0.6) 0%, transparent 100%)',
          }}
        />
        {/* Warm light from top-right */}
        <div
          className="absolute top-0 right-0"
          style={{
            width: '60%',
            height: '60%',
            background: 'radial-gradient(ellipse at 80% 20%, rgba(199, 91, 63, 0.12) 0%, transparent 60%)',
          }}
        />
        {/* Cool mist */}
        <div
          className="absolute bottom-0 left-0"
          style={{
            width: '50%',
            height: '50%',
            background: 'radial-gradient(ellipse at 20% 80%, rgba(212, 228, 237, 0.08) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Decorative floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Abstract book pages */}
        <div
          className="absolute"
          style={{
            top: '15%', right: '8%',
            width: '120px', height: '160px',
            border: '1px solid rgba(212, 228, 237, 0.08)',
            borderRadius: '4px 16px 16px 4px',
            transform: 'rotate(12deg)',
            animation: 'floatSlow 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '25%', right: '12%',
            width: '100px', height: '140px',
            border: '1px solid rgba(212, 228, 237, 0.05)',
            borderRadius: '4px 12px 12px 4px',
            transform: 'rotate(6deg)',
            animation: 'floatSlow 10s ease-in-out infinite 1s',
          }}
        />
        {/* Circles */}
        <div
          className="absolute"
          style={{
            bottom: '20%', left: '5%',
            width: '200px', height: '200px',
            border: '1px solid rgba(212, 228, 237, 0.06)',
            borderRadius: '50%',
            animation: 'breathe 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '10%', left: '15%',
            width: '80px', height: '80px',
            background: 'rgba(199, 91, 63, 0.06)',
            borderRadius: '50%',
            animation: 'breathe 8s ease-in-out infinite 2s',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom flex flex-col justify-center" style={{ minHeight: '520px' }}>
        <div className="max-w-2xl py-16 md:py-20">
          {/* Eyebrow */}
          <div
            className={`flex items-center gap-2 mb-6 ${mounted ? 'animate-fade-up' : 'opacity-0'}`}
          >
            <div className="w-8 h-[1.5px] bg-gradient-to-r from-transparent to-white/40" />
            <span
              className="text-xs font-medium tracking-[0.15em] uppercase"
              style={{ color: 'rgba(212, 228, 237, 0.7)' }}
            >
              Bergen Offentlige Bibliotek
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6 ${mounted ? 'animate-fade-up delay-1' : 'opacity-0'}`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Historier som
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #d4e4ed 0%, #e8f1f6 40%, #e07a5f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              beveger Bergen
            </span>
          </h1>

          {/* Subtext */}
          <p
            className={`text-base md:text-lg leading-relaxed mb-10 max-w-lg ${mounted ? 'animate-fade-up delay-2' : 'opacity-0'}`}
            style={{ color: 'rgba(212, 228, 237, 0.75)' }}
          >
            Utforsk tusenvis av bøker, e-bøker og lydbøker. Delta på arrangementer. 
            Din møteplass for kultur og kunnskap — helt gratis.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap gap-3 ${mounted ? 'animate-fade-up delay-3' : 'opacity-0'}`}
          >
            <Link
              href="/katalog"
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f4f7 100%)',
                color: '#0f3d54',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              Utforsk samlingen
            </Link>

            <Link
              href="/registrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #2d6b4e 0%, #3d8b65 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 16px rgba(45, 107, 78, 0.3)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6m3-3h-6"/>
              </svg>
              Bli låner
            </Link>

            <Link
              href="/arrangementer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/10"
              style={{
                border: '1.5px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              Se arrangementer
            </Link>
          </div>

          {/* Stats row */}
          <div
            className={`flex gap-8 mt-12 pt-8 border-t border-white/10 ${mounted ? 'animate-fade-up delay-5' : 'opacity-0'}`}
          >
            {[
              { value: '356', label: 'Bibliotek' },
              { value: '120k+', label: 'Titler' },
              { value: '641', label: 'Filialer' },
            ].map((stat, i) => (
              <div key={i}>
                <div
                  className="text-2xl md:text-3xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs mt-0.5 uppercase tracking-wider"
                  style={{ color: 'rgba(212, 228, 237, 0.5)' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="w-full h-12 md:h-14">
          <path
            d="M0 28C240 56 480 56 720 28C960 0 1200 0 1440 28V56H0V28Z"
            fill="var(--white-warm, #fdfcfa)"
          />
        </svg>
      </div>
    </section>
  )
}
