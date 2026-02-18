'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import Toast from '@/components/Toast'

/* ───── SVG Icons ───── */
const icons = {
  book: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
  ebook: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M12 18h.01"/><path d="M10 6h4"/></svg>,
  calendar: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  trophy: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>,
  arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  arrowLeft: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  lock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>,
  sparkle: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  qr: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><path d="M14 14h2v2h-2zM20 14h2v2h-2zM14 20h2v2h-2zM20 20h2v2h-2zM17 17h2v2h-2z"/></svg>,
  phone: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>,
  key: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  info: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
  folkeregister: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>,
}

/* ───── Demo person fra "Folkeregisteret" ───── */
const DEMO_PERSON = {
  fornavn: 'Kari',
  etternavn: 'Nordmann',
  fodselsdato: '1988-03-15',
  personnummer: '150388',
  adresse: 'Torgallmenningen 12',
  postnummer: '5014',
  poststed: 'Bergen',
}

type Step = 'intro' | 'idporten' | 'bankid' | 'bankid-code' | 'loading' | 'form' | 'success'

export default function RegistrerPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('intro')
  const [formData, setFormData] = useState({
    fornavn: '', etternavn: '', fodselsdato: '', adresse: '',
    postnummer: '', poststed: '', epost: '', mobil: '', akseptert: false
  })
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [generatedCardNumber, setGeneratedCardNumber] = useState('')

  /* BankID state */
  const [bankIdPersonnr, setBankIdPersonnr] = useState('')
  const [bankIdCode, setBankIdCode] = useState('')
  const [bankIdError, setBankIdError] = useState('')
  const [loadingText, setLoadingText] = useState('')

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message); setToastType(type)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  /* ── BankID flow ── */
  const handleBankIdLogin = () => {
    setBankIdError('')
    if (bankIdPersonnr.length < 6) {
      setBankIdError('Skriv inn fødselsnummer (6+ siffer)')
      return
    }
    setStep('bankid-code')
  }

  const handleBankIdCode = () => {
    setBankIdError('')
    if (bankIdCode.length < 4) {
      setBankIdError('Skriv inn engangskode fra kodebrikke')
      return
    }
    // Simuler innlogging
    setStep('loading')
    setLoadingText('Verifiserer BankID...')
    setTimeout(() => {
      setLoadingText('Henter opplysninger fra Folkeregisteret...')
      setTimeout(() => {
        // Fyll inn fra "Folkeregisteret"
        setFormData(prev => ({
          ...prev,
          fornavn: DEMO_PERSON.fornavn,
          etternavn: DEMO_PERSON.etternavn,
          fodselsdato: DEMO_PERSON.fodselsdato,
          adresse: DEMO_PERSON.adresse,
          postnummer: DEMO_PERSON.postnummer,
          poststed: DEMO_PERSON.poststed,
        }))
        setStep('form')
        showToast('Identitet bekreftet. Opplysninger hentet fra Folkeregisteret.', 'success')
      }, 1500)
    }, 1500)
  }

  /* ── Registration ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.epost) { showToast('Fyll inn e-postadresse', 'error'); return }
    if (!formData.mobil) { showToast('Fyll inn mobilnummer', 'error'); return }
    if (!formData.akseptert) { showToast('Du må akseptere vilkårene', 'error'); return }

    setStep('loading')
    setLoadingText('Oppretter lånekort...')

    try {
      const response = await fetch('/api/registrer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        const data = await response.json()
        setGeneratedCardNumber(data.bibliotekkortnummer)
        setStep('success')
      } else { showToast('Kunne ikke opprette bruker', 'error'); setStep('form') }
    } catch { showToast('Noe gikk galt', 'error'); setStep('form') }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--white-warm, #fdfcfa)' }}>
      <PublicHeader />

      <main className="container-custom py-12">

        {/* ═══════════════════════════════════
            STEG 1: INTRO
            ═══════════════════════════════════ */}
        {step === 'intro' && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl p-10 md:p-14 text-center mb-8"
              style={{ background: 'linear-gradient(135deg, var(--ocean-deep, #0a2a3c) 0%, var(--ocean, #0f3d54) 60%, var(--fjord, #1a7a9e) 100%)' }}>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(212,228,237,0.8)' }}>
                {icons.user}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Bli låner i dag
              </h1>
              <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: 'rgba(212,228,237,0.6)' }}>
                Få gratis tilgang til tusenvis av bøker, e-bøker, lydbøker, filmer og arrangementer
              </p>
            </div>

            <div className="rounded-2xl p-8 mb-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
              <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                Fordeler med lånekort
              </h2>

              <div className="grid md:grid-cols-2 gap-5 mb-8">
                {[
                  { icon: icons.book, title: 'Ubegrenset utlån', desc: 'Lån så mange bøker du vil, helt gratis', color: 'var(--ocean)' },
                  { icon: icons.ebook, title: 'Digitalt innhold', desc: 'E-bøker, lydbøker og filmer på nett', color: 'var(--fjord)' },
                  { icon: icons.calendar, title: 'Arrangementer', desc: 'Forfatterkveld, foredrag og verksteder', color: 'var(--terracotta)' },
                  { icon: icons.trophy, title: 'Leseopplevelser', desc: 'Følg dine lesevaner og oppnå mål', color: 'var(--forest)' },
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `color-mix(in srgb, ${b.color} 8%, transparent)`, color: b.color }}>
                      {b.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{b.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slik fungerer det */}
              <div className="rounded-xl p-5 mb-8" style={{ background: 'rgba(15,61,84,0.03)', border: '1px solid rgba(15,61,84,0.06)' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--ink)' }}>Slik fungerer det</h3>
                <div className="flex items-start gap-6">
                  {[
                    { nr: '1', text: 'Logg inn med ID-porten' },
                    { nr: '2', text: 'Vi henter dine opplysninger' },
                    { nr: '3', text: 'Bekreft og få lånekort' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ background: 'var(--ocean)' }}>{s.nr}</div>
                      <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={() => setStep('idporten')}
                  className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] shadow-lg flex items-center gap-2"
                  style={{ background: 'var(--ocean)' }}>
                  {icons.shield} Logg inn med ID-porten {icons.arrow}
                </button>
                <Link href="/login"
                  className="px-6 py-3.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ border: '1.5px solid rgba(0,0,0,0.08)', color: 'var(--ink-soft)' }}>
                  Har allerede kort? Logg inn
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs" style={{ color: 'var(--ink-muted)' }}>
              {['Gratis', 'Ingen binding', 'Klar på 2 minutter'].map((t, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span style={{ color: 'var(--forest)' }}>{icons.check}</span> {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            STEG 2: ID-PORTEN VELGER
            ═══════════════════════════════════ */}
        {step === 'idporten' && (
          <div className="max-w-md mx-auto">
            {/* ID-porten mock */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ddd', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              {/* ID-porten header */}
              <div className="px-6 py-4" style={{ background: '#f8f9fa', borderBottom: '1px solid #e5e7eb' }}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <rect width="32" height="32" rx="6" fill="#1d4370"/>
                      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="system-ui">ID</text>
                    </svg>
                    <span className="text-sm font-semibold" style={{ color: '#1d4370' }}>ID-porten</span>
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
                  Bergen Bibliotek ber deg logge inn
                </p>
              </div>

              <div className="p-6">
                <h2 className="text-lg font-semibold mb-1" style={{ color: '#111827' }}>Velg innloggingsmetode</h2>
                <p className="text-xs mb-5" style={{ color: '#6b7280' }}>Velg hvordan du vil identifisere deg</p>

                <div className="space-y-2.5">
                  {/* BankID */}
                  <button onClick={() => setStep('bankid')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:shadow-md"
                    style={{ border: '1.5px solid #e5e7eb', background: '#fff' }}>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: '#f0f4ff', border: '1px solid #dbeafe' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="4" fill="#1d4370"/>
                        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="system-ui">BID</text>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: '#111827' }}>BankID</div>
                      <div className="text-xs" style={{ color: '#6b7280' }}>Kodebrikke eller BankID-app</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>

                  {/* BankID på mobil */}
                  <button onClick={() => setStep('bankid')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:shadow-md"
                    style={{ border: '1.5px solid #e5e7eb', background: '#fff' }}>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                      <span style={{ color: '#16a34a' }}>{icons.phone}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: '#111827' }}>BankID på mobil</div>
                      <div className="text-xs" style={{ color: '#6b7280' }}>Bruk BankID-appen din</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>

                  {/* MinID */}
                  <button onClick={() => setStep('bankid')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:shadow-md"
                    style={{ border: '1.5px solid #e5e7eb', background: '#fff' }}>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                      <span style={{ color: '#d97706' }}>{icons.key}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: '#111827' }}>MinID</div>
                      <div className="text-xs" style={{ color: '#6b7280' }}>PIN-kode via SMS</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>

                  {/* Commfides */}
                  <button onClick={() => setStep('bankid')}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:shadow-md opacity-60"
                    style={{ border: '1.5px solid #e5e7eb', background: '#fff' }}>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                      <span style={{ color: '#6b7280' }}>{icons.shield}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: '#111827' }}>Commfides</div>
                      <div className="text-xs" style={{ color: '#6b7280' }}>e-ID med smartkort</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>

                <div className="mt-5 pt-4 text-center" style={{ borderTop: '1px solid #f3f4f6' }}>
                  <button onClick={() => setStep('intro')} className="text-xs font-medium" style={{ color: '#6b7280' }}>
                    Avbryt
                  </button>
                </div>
              </div>

              {/* ID-porten footer */}
              <div className="px-6 py-3 flex items-center justify-between" style={{ background: '#f8f9fa', borderTop: '1px solid #e5e7eb' }}>
                <div className="flex items-center gap-1">
                  <span style={{ color: '#16a34a' }}>{icons.lock}</span>
                  <span className="text-[10px]" style={{ color: '#6b7280' }}>Sikker tilkobling</span>
                </div>
                <span className="text-[10px]" style={{ color: '#9ca3af' }}>Levert av Digitaliseringsdirektoratet</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            STEG 3: BANKID INNLOGGING
            ═══════════════════════════════════ */}
        {step === 'bankid' && (
          <div className="max-w-md mx-auto">
            <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ddd', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              {/* BankID header */}
              <div className="px-6 py-4 flex items-center gap-3" style={{ background: '#1d4370' }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="4" fill="#fff"/>
                  <text x="16" y="20" textAnchor="middle" fill="#1d4370" fontSize="10" fontWeight="bold" fontFamily="system-ui">BankID</text>
                </svg>
                <div>
                  <div className="text-sm font-semibold text-white">BankID</div>
                  <div className="text-[10px] text-white/60">Sikker elektronisk identifikasjon</div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-base font-semibold mb-1" style={{ color: '#111827' }}>Logg inn med BankID</h3>
                <p className="text-xs mb-6" style={{ color: '#6b7280' }}>
                  Skriv inn fødselsnummer (11 siffer)
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>Fødselsnummer</label>
                    <input type="text" value={bankIdPersonnr} onChange={e => setBankIdPersonnr(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      className="w-full px-4 py-3 rounded-lg text-sm font-mono tracking-wider"
                      style={{ border: '1.5px solid #d1d5db', background: '#f9fafb' }}
                      placeholder="01018012345"
                      autoFocus />
                  </div>

                  {bankIdError && (
                    <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{bankIdError}</p>
                  )}

                  <button onClick={handleBankIdLogin}
                    className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: '#1d4370' }}>
                    Neste
                  </button>
                </div>

                <div className="mt-5 pt-4 text-center" style={{ borderTop: '1px solid #f3f4f6' }}>
                  <button onClick={() => setStep('idporten')} className="text-xs font-medium" style={{ color: '#6b7280' }}>
                    Tilbake til innloggingsvalg
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            STEG 3B: BANKID ENGANGSKODE
            ═══════════════════════════════════ */}
        {step === 'bankid-code' && (
          <div className="max-w-md mx-auto">
            <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ddd', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <div className="px-6 py-4 flex items-center gap-3" style={{ background: '#1d4370' }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="4" fill="#fff"/>
                  <text x="16" y="20" textAnchor="middle" fill="#1d4370" fontSize="10" fontWeight="bold" fontFamily="system-ui">BankID</text>
                </svg>
                <div>
                  <div className="text-sm font-semibold text-white">BankID</div>
                  <div className="text-[10px] text-white/60">Sikker elektronisk identifikasjon</div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-base font-semibold mb-1" style={{ color: '#111827' }}>Skriv inn engangskode</h3>
                <p className="text-xs mb-2" style={{ color: '#6b7280' }}>
                  Engangskode sendt til din enhet
                </p>

                {/* Referansenummer */}
                <div className="rounded-lg p-3 mb-5 flex items-center justify-between" style={{ background: '#f0f4ff', border: '1px solid #dbeafe' }}>
                  <span className="text-xs" style={{ color: '#6b7280' }}>Referanse</span>
                  <span className="text-sm font-mono font-bold tracking-wider" style={{ color: '#1d4370' }}>
                    {Math.random().toString().slice(2, 8)}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>Engangskode</label>
                    <input type="text" value={bankIdCode} onChange={e => setBankIdCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 rounded-lg text-sm font-mono tracking-[0.3em] text-center"
                      style={{ border: '1.5px solid #d1d5db', background: '#f9fafb', fontSize: '18px' }}
                      placeholder="- - - - - -"
                      autoFocus />
                  </div>

                  {bankIdError && (
                    <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{bankIdError}</p>
                  )}

                  <button onClick={handleBankIdCode}
                    className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: '#1d4370' }}>
                    Bekreft
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-[10px]" style={{ color: '#9ca3af' }}>
                    For demo: skriv inn et vilkårlig tall med 4+ siffer
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            LOADING / VERIFISERING
            ═══════════════════════════════════ */}
        {step === 'loading' && (
          <div className="max-w-sm mx-auto">
            <div className="rounded-2xl p-10 text-center" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'rgba(15,61,84,0.06)' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--ocean)' }} />
              </div>
              <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                {loadingText || 'Vennligst vent...'}
              </h2>
              <p className="text-sm mt-2 mb-6" style={{ color: 'var(--ink-muted)' }}>
                Dette tar kun noen sekunder
              </p>
              <div className="rounded-xl p-3 flex items-center justify-center gap-2"
                style={{ background: 'rgba(15,61,84,0.04)', border: '1px solid rgba(15,61,84,0.08)' }}>
                <span style={{ color: 'var(--ocean)' }}>{icons.shield}</span>
                <p className="text-xs font-medium" style={{ color: 'var(--ocean)' }}>Sikker forbindelse</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            STEG 4: FERDIG UTFYLT SKJEMA
            ═══════════════════════════════════ */}
        {step === 'form' && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl p-8" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(45,107,78,0.08)', color: 'var(--forest)' }}>
                  {icons.check}
                </div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                  Bekreft dine opplysninger
                </h1>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--ink-muted)' }}>
                Opplysningene under er hentet fra Folkeregisteret via ID-porten. Legg til kontaktinformasjon for å fullføre.
              </p>

              {/* Fra Folkeregisteret — ikke redigerbare */}
              <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(15,61,84,0.02)', border: '1px solid rgba(15,61,84,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span style={{ color: 'var(--ocean)' }}>{icons.folkeregister}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ocean)' }}>Hentet fra Folkeregisteret</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: 'Fornavn', value: formData.fornavn },
                    { label: 'Etternavn', value: formData.etternavn },
                    { label: 'Fødselsdato', value: new Date(formData.fodselsdato).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }) },
                    { label: 'Adresse', value: formData.adresse },
                    { label: 'Postnummer', value: formData.postnummer },
                    { label: 'Poststed', value: formData.poststed },
                  ].map((f, i) => (
                    <div key={i}>
                      <div className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--ink-muted)' }}>{f.label}</div>
                      <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{f.value || '–'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kontaktinformasjon — redigerbar */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: 'var(--ink-muted)' }}>{icons.info}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Kontaktinformasjon</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-muted)' }}>E-post *</label>
                    <input type="email" name="epost" value={formData.epost} onChange={handleInputChange} placeholder="kari@example.com"
                      className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ocean)]/30"
                      style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px solid rgba(0,0,0,0.06)', color: 'var(--ink)' }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-muted)' }}>Mobil *</label>
                    <input type="tel" name="mobil" value={formData.mobil} onChange={handleInputChange} placeholder="98765432"
                      className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ocean)]/30"
                      style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px solid rgba(0,0,0,0.06)', color: 'var(--ink)' }} />
                  </div>
                </div>

                {/* Vilkår */}
                <div className="rounded-xl p-5" style={{ background: 'rgba(0,0,0,0.02)' }}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="akseptert" checked={formData.akseptert} onChange={handleInputChange}
                      className="mt-0.5 w-4 h-4 rounded" style={{ accentColor: 'var(--ocean)' }} />
                    <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                      Jeg aksepterer <Link href="#" style={{ color: 'var(--ocean)' }}>vilkårene</Link> for
                      Bergen Bibliotek og samtykker til at mine personopplysninger behandles i henhold til
                      <Link href="#" style={{ color: 'var(--ocean)' }}> personvernerklæringen</Link>.
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01]"
                    style={{ background: 'var(--ocean)' }}>
                    Opprett lånekort {icons.arrow}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            STEG 5: SUKSESS
            ═══════════════════════════════════ */}
        {step === 'success' && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl p-10 md:p-14 text-center mb-8"
              style={{ background: 'linear-gradient(135deg, #1a4d32 0%, var(--forest, #2d6b4e) 60%, #3d9e6b 100%)' }}>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
                {icons.sparkle}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Velkommen, {formData.fornavn}!
              </h1>
              <p className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Ditt lånekort er nå klart til bruk</p>
            </div>

            <div className="rounded-2xl p-8 mb-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div className="text-center mb-8 pb-8" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>Ditt lånekort-nummer</div>
                <div className="text-3xl font-mono font-bold tracking-[0.15em]" style={{ color: 'var(--ocean)' }}>
                  {generatedCardNumber}
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--ink-muted)' }}>
                  Du finner også kortet med QR-kode på Min side.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: icons.book, title: 'Søk i katalogen', desc: 'Finn din neste favorittbok', color: 'var(--ocean)' },
                  { icon: icons.ebook, title: 'Digitalt innhold', desc: 'E-bøker og lydbøker nå', color: 'var(--fjord)' },
                  { icon: icons.calendar, title: 'Arrangementer', desc: 'Meld deg på events', color: 'var(--terracotta)' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-5 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                      style={{ background: `color-mix(in srgb, ${item.color} 8%, transparent)`, color: item.color }}>
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{item.title}</h3>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-muted)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/min-side"
                  className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] shadow-lg"
                  style={{ background: 'var(--ocean)' }}>
                  <span className="flex items-center gap-2">Gå til Min side {icons.arrow}</span>
                </Link>
                <Link href="/katalog"
                  className="px-6 py-3.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ border: '1.5px solid rgba(0,0,0,0.08)', color: 'var(--ink-soft)' }}>
                  Søk i katalogen
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-xs" style={{ color: 'var(--ink-muted)' }}>
              <span style={{ color: 'var(--fjord)' }}>{icons.qr}</span>
              Besøk Min side for å se ditt digitale lånekort med QR-kode
            </div>
          </div>
        )}
      </main>

      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
    </div>
  )
}
