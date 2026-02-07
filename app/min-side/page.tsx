'use client'

import Link from 'next/link'

const LOANS = [
  { id: 1, title: 'Nordlys i november', author: 'Maja Lunde', dueDate: '2026-02-15', renewable: true },
  { id: 2, title: 'Vinterhav', author: 'Helene Uri', dueDate: '2026-02-18', renewable: true },
]

const RESERVATIONS = [
  { id: 1, title: 'Bror din på prærien', author: 'Torvald Sund', position: 3, branch: 'Hovedbiblioteket' },
]

const FEES = [
  { id: 1, description: 'Forsinket levering', amount: 50, date: '2026-02-01' },
]

export default function MinSidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#16425b] text-white py-6">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Bergen Bibliotek</h1>
              <p className="text-white/80 mt-1">Min side</p>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="hover:text-white/80">Hjem</Link>
              <Link href="/katalog" className="hover:text-white/80">Katalog</Link>
              <Link href="/arrangementer" className="hover:text-white/80">Arrangementer</Link>
              <Link href="/min-side" className="font-semibold">Min side</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-[#16425b] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl">
                  👤
                </div>
                <h2 className="text-xl font-bold text-gray-900">Bjørn Kjetil</h2>
                <p className="text-gray-600">Lånekort: 123456789</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Aktive lån</div>
                  <div className="text-2xl font-bold text-gray-900">{LOANS.length}</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Reservasjoner</div>
                  <div className="text-2xl font-bold text-gray-900">{RESERVATIONS.length}</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Gebyrer</div>
                  <div className="text-2xl font-bold text-red-600">
                    {FEES.reduce((sum, fee) => sum + fee.amount, 0)} kr
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium mb-3">
                  Endre profil
                </button>
                <button className="w-full py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                  Logg ut
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Loans */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mine lån</h3>
              
              {LOANS.length > 0 ? (
                <div className="space-y-4">
                  {LOANS.map(loan => (
                    <div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{loan.title}</h4>
                        <p className="text-sm text-gray-600">{loan.author}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Forfaller: {loan.dueDate}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {loan.renewable && (
                          <button className="px-4 py-2 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors">
                            Forny
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Ingen aktive lån</p>
              )}
            </div>

            {/* Reservations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mine reservasjoner</h3>
              
              {RESERVATIONS.length > 0 ? (
                <div className="space-y-4">
                  {RESERVATIONS.map(reservation => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{reservation.title}</h4>
                        <p className="text-sm text-gray-600">{reservation.author}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Plassering i kø: <strong>{reservation.position}</strong> • {reservation.branch}
                        </p>
                      </div>
                      <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors">
                        Avbestill
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Ingen aktive reservasjoner</p>
              )}
            </div>

            {/* Fees */}
            {FEES.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Gebyrer</h3>
                
                <div className="space-y-4">
                  {FEES.map(fee => (
                    <div key={fee.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{fee.description}</h4>
                        <p className="text-sm text-gray-500">{fee.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">{fee.amount} kr</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-gray-900">Totalt:</span>
                      <span className="text-2xl font-bold text-red-600">
                        {FEES.reduce((sum, fee) => sum + fee.amount, 0)} kr
                      </span>
                    </div>
                    <button className="w-full py-3 bg-[#ff5b24] text-white rounded-lg hover:bg-[#e64d1f] transition-colors font-medium flex items-center justify-center space-x-2">
                      <span>💳</span>
                      <span>Betal med Vipps</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
