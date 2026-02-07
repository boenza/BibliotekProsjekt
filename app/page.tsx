import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16425b] to-[#2d6a8e] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Felles Formidlingsløsning
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Norges nye bibliotekplattform
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Link
              href="/admin"
              className="bg-[#16425b] hover:bg-[#1a5270] text-white font-semibold py-6 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-lg">CMS Admin</div>
              <div className="text-sm opacity-90 mt-2">Administrer innhold</div>
            </Link>
            
            <Link
              href="/katalog"
              className="bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-6 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="text-lg">Brukersiden</div>
              <div className="text-sm opacity-90 mt-2">Se bibliotekets tilbud</div>
            </Link>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Built with Next.js 15 • React 19 • TypeScript • Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
