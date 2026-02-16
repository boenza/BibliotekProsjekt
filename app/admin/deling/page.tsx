'use client'

import { useState, useEffect } from 'react'

interface DeltElement {
  id: string
  kildeId: string
  kildeBibliotek: string
  type: 'arrangement' | 'anbefaling' | 'artikkel'
  tittel: string
  data: Record<string, any>
  status: 'mottatt' | 'importert' | 'avvist'
  opprettetSomId: string | null
  mottatt: string
  behandlet: string | null
}

/* ───── SVG Icons ───── */
const ic = {
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  fileText: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  bulb: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>,
  inbox: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  loader: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
}

const TYPE_INFO: Record<string, { ikon: JSX.Element; label: string; farge: string; seksjon: string; url: string }> = {
  arrangement: { ikon: ic.calendar, label: 'Arrangement', farge: 'bg-blue-100 text-blue-800', seksjon: 'Arrangementer', url: '/admin/arrangementer' },
  anbefaling: { ikon: ic.star, label: 'Anbefaling', farge: 'bg-purple-100 text-purple-800', seksjon: 'Anbefalinger', url: '/admin/innhold/anbefalinger' },
  artikkel: { ikon: ic.fileText, label: 'Artikkel', farge: 'bg-teal-100 text-teal-800', seksjon: 'Artikler', url: '/admin/innhold/artikler' },
}

export default function DelingPage() {
  const [elementer, setElementer] = useState<DeltElement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'mottatt' | 'alle' | 'behandlet'>('mottatt')
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [importing, setImporting] = useState<string | null>(null)

  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const res = await fetch('/api/deling'); const data = await res.json(); if (Array.isArray(data)) setElementer(data) }
    catch (e) { console.error(e) } finally { setIsLoading(false) }
  }

  const toast = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 4000) }

  const handleGodta = async (el: DeltElement) => {
    setImporting(el.id)
    try {
      let apiUrl = ''; let payload: Record<string, any> = {}
      const info = TYPE_INFO[el.type]

      if (el.type === 'arrangement') {
        apiUrl = '/api/arrangementer'
        payload = { tittel:el.tittel, beskrivelse:el.data.beskrivelse||'', dato:el.data.dato||new Date().toISOString().split('T')[0], klokkeslett:el.data.klokkeslett||'18:00', sted:el.data.sted||'Bergen Hovedbibliotek — Store sal', kategori:el.data.kategori||'Foredrag', bildeUrl:el.data.bildeUrl||null, publisert:false }
      } else if (el.type === 'anbefaling') {
        apiUrl = '/api/anbefalinger'
        payload = { tittel:el.tittel, type:el.data.type||'enkel', beskrivelse:el.data.beskrivelse||'', forfatter:el.data.forfatter||'', bildeUrl:el.data.bildeUrl||null, publisert:false }
      } else if (el.type === 'artikkel') {
        apiUrl = '/api/artikler'
        payload = { tittel:el.tittel, ingress:el.data.ingress||'', innhold:el.data.innhold||'', kategori:el.data.kategori||'Nyheter', forfatter:el.data.forfatter||el.kildeBibliotek, bildeUrl:el.data.bildeUrl||null, publisert:false }
      }

      const createRes = await fetch(apiUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      const created = await createRes.json()

      await fetch('/api/deling', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:el.id, handling:'importer', opprettetSomId:created.id||null }) })

      toast(`«${el.tittel}» importert til ${info.seksjon} som kladd — rediger den der!`)
      fetchData()
    } catch (e) {
      console.error(e)
      toast('Noe gikk galt ved import')
    } finally { setImporting(null) }
  }

  const handleAvvis = async (el: DeltElement) => {
    if (!confirm(`Avvise «${el.tittel}» fra ${el.kildeBibliotek}?`)) return
    try { await fetch('/api/deling', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:el.id, handling:'avvis' }) }); toast('Avvist'); fetchData() }
    catch { toast('Feil') }
  }

  const handleSlett = async (id: string) => {
    if (!confirm('Fjerne dette elementet?')) return
    try { await fetch(`/api/deling?id=${id}`, { method:'DELETE' }); fetchData() }
    catch { toast('Feil') }
  }

  const filtrerte = elementer.filter(el => {
    if (filter === 'mottatt') return el.status === 'mottatt'
    if (filter === 'behandlet') return el.status !== 'mottatt'
    return true
  })

  const antallMottatt = elementer.filter(e => e.status === 'mottatt').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Deling</h1>
        <p className="mt-2 text-gray-600">Innhold delt fra andre bibliotek. Godta for å importere som kladd i riktig seksjon.</p>
      </div>

      {/* Info-boks */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <span className="text-blue-600 mt-0.5">{ic.bulb}</span>
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Slik fungerer deling</p>
          <p>Når du godtar et delt element, opprettes det automatisk som <strong>kladd</strong> i riktig seksjon:</p>
          <p className="mt-1 flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1">{ic.calendar} Arrangementer &rarr; <code className="bg-blue-100 px-1 rounded">/admin/arrangementer</code></span>
            <span className="inline-flex items-center gap-1">{ic.star} Anbefalinger &rarr; <code className="bg-blue-100 px-1 rounded">/admin/innhold/anbefalinger</code></span>
            <span className="inline-flex items-center gap-1">{ic.fileText} Artikler &rarr; <code className="bg-blue-100 px-1 rounded">/admin/innhold/artikler</code></span>
          </p>
          <p className="mt-1">Der kan du redigere innholdet fritt før du publiserer det.</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'mottatt', label: `Nye (${antallMottatt})` },
            { key: 'behandlet', label: 'Behandlet' },
            { key: 'alle', label: 'Alle' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f.key ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        {antallMottatt > 0 && (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            {antallMottatt} venter på behandling
          </span>
        )}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">Laster...</div>
      ) : filtrerte.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="flex justify-center mb-3 text-gray-300">{ic.inbox}</div>
          <p className="text-gray-500">{filter === 'mottatt' ? 'Ingen nye delte elementer' : 'Ingen elementer'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrerte.map(el => {
            const info = TYPE_INFO[el.type]
            return (
              <div key={el.id}
                className={`bg-white rounded-xl border p-5 transition-all ${
                  el.status === 'mottatt' ? 'border-blue-200 shadow-sm' :
                  el.status === 'importert' ? 'border-green-200 opacity-70' :
                  'border-gray-100 opacity-50'
                }`}>

                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {el.data.bildeUrl ? (
                      <img src={el.data.bildeUrl} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400">
                        {info.ikon}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full font-medium ${info.farge}`}>
                          {info.ikon} {info.label}
                        </span>
                        {el.status === 'importert' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full font-medium bg-green-100 text-green-800">
                            {ic.check} Importert til {info.seksjon}
                          </span>
                        )}
                        {el.status === 'avvist' && (
                          <span className="px-2.5 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-700">Avvist</span>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 text-lg">{el.tittel}</h3>

                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>Fra: <strong>{el.kildeBibliotek}</strong></span>
                        <span>{new Date(el.mottatt).toLocaleDateString('nb-NO', { day:'numeric', month:'short', year:'numeric' })}</span>
                      </div>

                      {(el.data.beskrivelse || el.data.ingress) && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{el.data.beskrivelse || el.data.ingress}</p>
                      )}

                      {el.type === 'arrangement' && el.data.dato && (
                        <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">{ic.calendar} {new Date(el.data.dato).toLocaleDateString('nb-NO')}</span>
                          {el.data.klokkeslett && <span className="inline-flex items-center gap-1">{ic.clock} {el.data.klokkeslett}</span>}
                          {el.data.kategori && <span className="bg-gray-100 px-2 py-0.5 rounded">{el.data.kategori}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    {el.status === 'mottatt' && (
                      <>
                        <button onClick={() => setPreviewId(previewId === el.id ? null : el.id)}
                          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">
                          {ic.eye} Forhåndsvis
                        </button>
                        <button onClick={() => handleGodta(el)} disabled={importing === el.id}
                          className="flex items-center gap-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50">
                          {importing === el.id ? <>{ic.loader} Importerer...</> : <>{ic.check} Godta &rarr; {info.seksjon}</>}
                        </button>
                        <button onClick={() => handleAvvis(el)}
                          className="px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 font-medium">Avvis</button>
                      </>
                    )}
                    {el.status === 'importert' && (
                      <>
                        <a href={info.url} className="px-4 py-2 text-sm bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] font-medium">
                          Rediger i {info.seksjon} &rarr;
                        </a>
                        <button onClick={() => handleSlett(el.id)} className="px-3 py-2 text-sm text-gray-400 hover:text-red-600">Fjern</button>
                      </>
                    )}
                    {el.status === 'avvist' && (
                      <button onClick={() => handleSlett(el.id)} className="px-3 py-2 text-sm text-gray-400 hover:text-red-600">Fjern</button>
                    )}
                  </div>
                </div>

                {previewId === el.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Forhåndsvisning av innhold</h4>
                      <div className="text-sm text-gray-600 space-y-2">
                        {Object.entries(el.data).map(([key, val]) => {
                          if (key === 'bildeUrl') return null
                          if (typeof val === 'object') return <div key={key}><span className="font-medium">{key}:</span> {JSON.stringify(val, null, 2)}</div>
                          return <div key={key}><span className="font-medium">{key}:</span> {String(val)}</div>
                        })}
                      </div>
                      <p className="mt-3 text-xs text-gray-400">Ved godkjenning opprettes dette som kladd i {info.seksjon}. Du kan redigere alt der før publisering.</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showToast && <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">{toastMsg}</div>}
    </div>
  )
}
