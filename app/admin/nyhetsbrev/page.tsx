'use client'

import { useState, useEffect } from 'react'

interface Arrangement { id: string; tittel: string; dato: string; klokkeslett: string; kategori: string }
interface Anbefaling { id: string; tittel: string; forfatter: string | null; beskrivelse: string }

/* ───── SVG Icons ───── */
const ic = {
  mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  send: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  rocket: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
  chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  bulb: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>,
  book: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>,
}

export default function NyhetsbrevPage() {
  const [emne, setEmne] = useState('')
  const [intro, setIntro] = useState('')
  const [brødtekst, setBrødtekst] = useState('')
  const [bildeUrl, setBildeUrl] = useState('')
  const [arrangementer, setArrangementer] = useState<Arrangement[]>([])
  const [anbefalinger, setAnbefalinger] = useState<Anbefaling[]>([])
  const [valgtArrangementer, setValgtArrangementer] = useState<string[]>([])
  const [valgtAnbefalinger, setValgtAnbefalinger] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => { fetchContent() }, [])

  const fetchContent = async () => {
    try {
      const [arrRes, anbRes] = await Promise.all([fetch('/api/arrangementer'), fetch('/api/anbefalinger')])
      const arrData = await arrRes.json(); const anbData = await anbRes.json()
      if (Array.isArray(arrData)) setArrangementer(arrData)
      if (Array.isArray(anbData)) setAnbefalinger(anbData)
    } catch (error) { console.error('Error:', error) }
  }

  const toggleArr = (id: string) => setValgtArrangementer(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  const toggleAnb = (id: string) => setValgtAnbefalinger(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const handleTestSend = async () => {
    if (!emne) { alert('Fyll ut emne!'); return }
    setIsSending(true)
    await new Promise(r => setTimeout(r, 1500))
    setIsSending(false)
    setToastMessage('Testutsending sendt til admin@bergen.bibliotek.no')
    setShowToast(true); setTimeout(() => setShowToast(false), 5000)
  }

  const selectedArr = arrangementer.filter(a => valgtArrangementer.includes(a.id))
  const selectedAnb = anbefalinger.filter(a => valgtAnbefalinger.includes(a.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">Nyhetsbrev</h1><p className="mt-2 text-gray-600">Opprett og send nyhetsbrev til lånere</p></div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Innhold */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="flex items-center gap-1.5 text-lg font-semibold mb-4">{ic.mail} Innhold</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emne *</label>
                <input type="text" value={emne} onChange={e => setEmne(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]"
                  placeholder="F.eks. 'Nytt fra Bergen Bibliotek — mars 2026'" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headerbilde (valgfritt)</label>
                <input type="text" value={bildeUrl} onChange={e => setBildeUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]"
                  placeholder="https://... (bilde-URL for toppen av nyhetsbrevet)" />
                {bildeUrl && <img src={bildeUrl} alt="" className="mt-2 h-32 rounded-lg object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Introduksjonstekst</label>
                <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]"
                  placeholder="Kort intro til nyhetsbrevet..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brødtekst / hovedinnhold</label>
                <textarea value={brødtekst} onChange={e => setBrødtekst(e.target.value)} rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16425b]"
                  placeholder="Skriv hovedinnholdet i nyhetsbrevet her. Du kan inkludere nyheter, oppdateringer, og annet innhold som er relevant for lånerne..." />
                <p className="mt-1 text-xs text-gray-500">Bruk linjeskift for avsnitt. Teksten vises mellom intro og arrangementer/anbefalinger.</p>
              </div>
            </div>
          </div>

          {/* Velg arrangementer */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="flex items-center gap-1.5 text-lg font-semibold mb-4">{ic.calendar} Inkluder arrangementer</h3>
            {arrangementer.length === 0 ? (
              <p className="text-gray-500 text-sm">Ingen arrangementer tilgjengelig</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {arrangementer.map(arr => (
                  <label key={arr.id} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    valgtArrangementer.includes(arr.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                  }`}>
                    <input type="checkbox" checked={valgtArrangementer.includes(arr.id)} onChange={() => toggleArr(arr.id)} className="w-4 h-4 rounded" />
                    <div><span className="font-medium">{arr.tittel}</span><span className="text-sm text-gray-500 ml-2">{new Date(arr.dato).toLocaleDateString('nb-NO')} kl {arr.klokkeslett}</span></div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Velg anbefalinger */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="flex items-center gap-1.5 text-lg font-semibold mb-4">{ic.star} Inkluder anbefalinger</h3>
            {anbefalinger.length === 0 ? (
              <p className="text-gray-500 text-sm">Ingen anbefalinger tilgjengelig</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {anbefalinger.map(anb => (
                  <label key={anb.id} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    valgtAnbefalinger.includes(anb.id) ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50 border border-transparent'
                  }`}>
                    <input type="checkbox" checked={valgtAnbefalinger.includes(anb.id)} onChange={() => toggleAnb(anb.id)} className="w-4 h-4 rounded" />
                    <div><span className="font-medium">{anb.tittel}</span>{anb.forfatter && <span className="text-sm text-gray-500 ml-2">av {anb.forfatter}</span>}</div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-6 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-medium">{ic.eye} Forhåndsvis</button>
            <button onClick={handleTestSend} disabled={isSending} className="flex items-center gap-1.5 px-6 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium disabled:opacity-50">{ic.send} {isSending ? 'Sender...' : 'Testutsending'}</button>
            <button className="flex items-center gap-1.5 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">{ic.rocket} Send til alle</button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="flex items-center gap-1.5 text-lg font-semibold mb-3">{ic.chart} Statistikk</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg"><div className="text-sm text-gray-600">Abonnenter</div><div className="text-2xl font-bold">2 847</div></div>
              <div className="p-3 bg-gray-50 rounded-lg"><div className="text-sm text-gray-600">Åpningsrate</div><div className="text-2xl font-bold">34%</div></div>
              <div className="p-3 bg-gray-50 rounded-lg"><div className="text-sm text-gray-600">Siste utsending</div><div className="text-sm font-medium">15. jan 2026</div></div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-blue-900 mb-2">{ic.bulb} Tips</h3>
            <p className="text-sm text-blue-800">Bruk brødtekst-feltet til å skrive hovedinnholdet. Velg arrangementer og anbefalinger fra listene. Bruk «Testutsending» for å forhåndsvise.</p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-lg font-semibold">{ic.eye} Forhåndsvisning</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-8">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {bildeUrl ? (
                  <div className="h-48 overflow-hidden"><img src={bildeUrl} alt="" className="w-full h-full object-cover" /></div>
                ) : (
                  <div className="bg-[#16425b] text-white p-6 text-center">
                    <h1 className="flex items-center justify-center gap-2 text-2xl font-bold">{ic.book} Bergen Offentlige Bibliotek</h1>
                    <p className="text-white/80 mt-1">Nyhetsbrev</p>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{emne || 'Emne mangler'}</h2>
                  {intro && <p className="text-gray-700 mb-4">{intro}</p>}
                  {brødtekst && (
                    <div className="text-gray-700 mb-6 whitespace-pre-line leading-relaxed border-l-4 border-[#16425b]/20 pl-4">{brødtekst}</div>
                  )}
                  {selectedArr.length > 0 && (
                    <div className="mb-6">
                      <h3 className="flex items-center gap-1.5 text-lg font-bold mb-3">{ic.calendar} Kommende arrangementer</h3>
                      {selectedArr.map(arr => (
                        <div key={arr.id} className="p-4 bg-gray-50 rounded-lg mb-2">
                          <h4 className="font-semibold">{arr.tittel}</h4>
                          <p className="text-sm text-gray-600">{new Date(arr.dato).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })} kl {arr.klokkeslett}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedAnb.length > 0 && (
                    <div className="mb-6">
                      <h3 className="flex items-center gap-1.5 text-lg font-bold mb-3">{ic.star} Anbefalinger</h3>
                      {selectedAnb.map(anb => (
                        <div key={anb.id} className="p-4 bg-gray-50 rounded-lg mb-2">
                          <h4 className="font-semibold">{anb.tittel}</h4>
                          {anb.forfatter && <p className="text-sm text-gray-600">{anb.forfatter}</p>}
                          <p className="text-sm text-gray-700 mt-1 line-clamp-2">{anb.beskrivelse}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-center text-sm text-gray-500 pt-4 border-t">Bergen Offentlige Bibliotek &middot; Strømgaten 6 &middot; 5015 Bergen</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showToast && <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">{toastMessage}</div>}
    </div>
  )
}
