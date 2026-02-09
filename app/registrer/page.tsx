'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import Toast from '@/components/Toast'

export default function RegistrerPage() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'form' | 'id-porten' | 'success'>('intro')
  const [formData, setFormData] = useState({
    fornavn: '',
    etternavn: '',
    fodselsdato: '',
    adresse: '',
    postnummer: '',
    poststed: '',
    epost: '',
    mobil: '',
    akseptert: false
  })
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [generatedCardNumber, setGeneratedCardNumber] = useState<string>('')

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message)
    setToastType(type)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateForm = () => {
    if (!formData.fornavn || !formData.etternavn) {
      showToast('Fyll inn fornavn og etternavn', 'error')
      return false
    }
    if (!formData.fodselsdato) {
      showToast('Fyll inn fødselsdato', 'error')
      return false
    }
    if (!formData.epost) {
      showToast('Fyll inn e-postadresse', 'error')
      return false
    }
    if (!formData.mobil) {
      showToast('Fyll inn mobilnummer', 'error')
      return false
    }
    if (!formData.akseptert) {
      showToast('Du må akseptere vilkårene', 'error')
      return false
    }
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    // Simuler ID-porten
    setStep('id-porten')
    
    // Etter 2 sekunder, opprett bruker
    setTimeout(() => {
      handleRegistration()
    }, 2000)
  }

  const handleRegistration = async () => {
    try {
      const response = await fetch('/api/registrer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedCardNumber(data.bibliotekkortnummer)
        setStep('success')
      } else {
        showToast('Kunne ikke opprette bruker', 'error')
        setStep('form')
      }
    } catch (error) {
      console.error('Registration error:', error)
      showToast('Noe gikk galt', 'error')
      setStep('form')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="container-custom py-12">
        {/* INTRO STEP */}
        {step === 'intro' && (
          <div className="max-w-3xl mx-auto">
            <div 
              className="rounded-2xl p-12 text-white text-center mb-8"
              style={{
                background: 'linear-gradient(135deg, #16425b 0%, #2a6a8e 100%)'
              }}
            >
              <div className="text-6xl mb-4">📚</div>
              <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                Bli medlem i dag!
              </h1>
              <p className="text-xl opacity-90">
                Få gratis tilgang til tusenvis av bøker, e-bøker, lydbøker, filmer og arrangementer
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                Fordeler med lånekort:
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">📖</span>
                  <div>
                    <h3 className="font-bold mb-1">Ubegrenset utlån</h3>
                    <p className="text-gray-600 text-sm">Lån så mange bøker du vil, helt gratis</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-3xl">📱</span>
                  <div>
                    <h3 className="font-bold mb-1">Digitalt innhold</h3>
                    <p className="text-gray-600 text-sm">E-bøker, lydbøker og filmer på nett</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-3xl">🎭</span>
                  <div>
                    <h3 className="font-bold mb-1">Arrangementer</h3>
                    <p className="text-gray-600 text-sm">Forfatterkveld, foredrag og verksteder</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-3xl">🏆</span>
                  <div>
                    <h3 className="font-bold mb-1">Gamification</h3>
                    <p className="text-gray-600 text-sm">Samle poeng og lås opp achievements</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setStep('form')}
                  className="px-8 py-4 bg-[#16425b] text-white rounded-xl font-bold text-lg hover:bg-[#1a5270] transition-all hover:scale-105 shadow-lg"
                >
                  Registrer deg nå →
                </button>
                
                <Link
                  href="/login"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-[#16425b] hover:text-[#16425b] transition-colors"
                >
                  Har allerede kort? Logg inn
                </Link>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>✓ Gratis • ✓ Ingen binding • ✓ Klar på 2 minutter</p>
            </div>
          </div>
        )}

        {/* FORM STEP */}
        {step === 'form' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                Opprett lånekort
              </h1>
              <p className="text-gray-600 mb-8">
                Fyll ut skjemaet under. Du vil bekrefte opplysningene med BankID i neste steg.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personnavn */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fornavn *
                    </label>
                    <input
                      type="text"
                      name="fornavn"
                      value={formData.fornavn}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#16425b] focus:outline-none"
                      placeholder="Ola"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etternavn *
                    </label>
                    <input
                      type="text"
                      name="etternavn"
                      value={formData.etternavn}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#16425b] focus:outline-none"
                      placeholder="Nordmann"
                    />
                  </div>
                </div>

                {/* Fødselsdato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fødselsdato *
                  </label>
                  <input
                    type="date"
                    name="fodselsdato"
                    value={formData.fodselsdato}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#16425b] focus:outline-none"
                  />
                </div>

                {/* Adresse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#16425b] focus:outline-none"
                    placeholder="Storgata 1"
                  />
                </div>

                {/* Postnummer og sted */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postnummer
                    </label>
                    <input
                      type="text"
                      name="postnummer"
                      value={formData.postnummer}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#16425b] focus:outline-none"
                      placeholder="5003"
                      maxLength={4}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poststed
                    </label>
                    <input
                      type="text"
                      name="poststed"
                      value={formData.poststed}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#16425b] focus:outline-none"
                      placeholder="Bergen"
                    />
                  </div>
                </div>

                {/* Kontaktinfo */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-post *
                    </label>
                    <input
                      type="email"
                      name="epost"
                      value={formData.epost}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#16425b] focus:outline-none"
                      placeholder="ola@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobilnummer *
                    </label>
                    <input
                      type="tel"
                      name="mobil"
                      value={formData.mobil}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#16425b] focus:outline-none"
                      placeholder="12345678"
                    />
                  </div>
                </div>

                {/* Vilkår */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="akseptert"
                      checked={formData.akseptert}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-[#16425b] rounded focus:ring-[#16425b]"
                    />
                    <span className="text-sm text-gray-700">
                      Jeg aksepterer <Link href="#" className="text-[#16425b] hover:underline">vilkårene</Link> for 
                      Bergen Bibliotek og samtykker til at mine personopplysninger behandles i henhold til 
                      <Link href="#" className="text-[#16425b] hover:underline"> personvernerklæringen</Link>.
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-[#16425b] text-white rounded-xl font-bold hover:bg-[#1a5270] transition-colors"
                  >
                    Gå videre til BankID →
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStep('intro')}
                    className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 transition-colors"
                  >
                    Tilbake
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ID-PORTEN STEP */}
        {step === 'id-porten' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-[#16425b] rounded-full mx-auto mb-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              </div>
              
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                Bekrefter med BankID
              </h2>
              
              <p className="text-gray-600 mb-6">
                Du vil nå bli bedt om å bekrefte identiteten din med BankID. 
                Dette tar kun noen sekunder.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  🔒 Sikker identifikasjon via ID-porten
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && (
          <div className="max-w-2xl mx-auto">
            <div 
              className="rounded-2xl p-12 text-white text-center mb-8"
              style={{
                background: 'linear-gradient(135deg, #2d7a50 0%, #16a34a 100%)'
              }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                Velkommen til Bergen Bibliotek!
              </h1>
              <p className="text-xl opacity-90">
                Ditt lånekort er nå klart til bruk
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  Ditt lånekort-nummer:
                </h2>
                <div className="text-4xl font-mono font-bold text-[#16425b] tracking-wider">
                  {generatedCardNumber}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Skriv ned dette eller ta skjermbilde. Du finner det også på Min Side.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="text-3xl mb-3">📚</div>
                  <h3 className="font-bold mb-2">Søk i katalogen</h3>
                  <p className="text-sm text-gray-600">
                    Finn din neste favorittbok
                  </p>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="text-3xl mb-3">📱</div>
                  <h3 className="font-bold mb-2">Digitalt innhold</h3>
                  <p className="text-sm text-gray-600">
                    E-bøker og lydbøker nå
                  </p>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="text-3xl mb-3">🎭</div>
                  <h3 className="font-bold mb-2">Arrangementer</h3>
                  <p className="text-sm text-gray-600">
                    Meld deg på events
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/min-side"
                  className="px-8 py-4 bg-[#16425b] text-white rounded-xl font-bold hover:bg-[#1a5270] transition-all hover:scale-105 shadow-lg"
                >
                  Gå til Min Side →
                </Link>
                
                <Link
                  href="/katalog"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-[#16425b] hover:text-[#16425b] transition-colors"
                >
                  Søk i katalogen
                </Link>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>💡 Tips: Besøk Min Side for å se ditt digitale lånekort med QR-kode</p>
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      {toastMessage && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  )
}
