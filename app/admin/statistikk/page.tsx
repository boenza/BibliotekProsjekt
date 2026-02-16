export default function StatistikkPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Statistikk</h1>
      <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
        <div className="flex justify-center mb-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-gray-400">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Statistikk kommer snart!</h2>
        <p className="text-gray-600">Her kan du se detaljerte rapporter.</p>
      </div>
    </div>
  )
}
