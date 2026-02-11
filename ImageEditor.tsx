'use client'

import { useState, useRef } from 'react'

interface ImageEditorProps {
  imageUrl: string
  onSave: (editedUrl: string) => void
  onClose: () => void
}

export default function ImageEditor({ imageUrl, onSave, onClose }: ImageEditorProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [cropMode, setCropMode] = useState(false)
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 })
  const [isCropping, setIsCropping] = useState(false)
  const [appliedCrop, setAppliedCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  const cssFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

  // Crop handlers on the image container
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cropMode) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setCropStart(pos)
    setCropEnd(pos)
    setIsCropping(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !cropMode) return
    const rect = e.currentTarget.getBoundingClientRect()
    setCropEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseUp = () => {
    setIsCropping(false)
  }

  const getCropRect = () => {
    const x = Math.min(cropStart.x, cropEnd.x)
    const y = Math.min(cropStart.y, cropEnd.y)
    const w = Math.abs(cropEnd.x - cropStart.x)
    const h = Math.abs(cropEnd.y - cropStart.y)
    return { x, y, w, h }
  }

  const applyCrop = () => {
    const rect = getCropRect()
    if (rect.w < 10 || rect.h < 10) return
    setAppliedCrop(rect)
    setCropMode(false)
  }

  const handleReset = () => {
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setCropMode(false)
    setCropStart({ x: 0, y: 0 })
    setCropEnd({ x: 0, y: 0 })
    setAppliedCrop(null)
  }

  const handleSave = () => {
    // Lagre en beskrivelse av endringene (for demo)
    // I en ekte app ville vi prosessert bildet server-side
    const edits = []
    if (brightness !== 100) edits.push(`lysstyrke: ${brightness}%`)
    if (contrast !== 100) edits.push(`kontrast: ${contrast}%`)
    if (saturation !== 100) edits.push(`metning: ${saturation}%`)
    if (appliedCrop) edits.push('beskjært')

    // Returner original URL — endringene vises via CSS i forhåndsvisning
    onSave(imageUrl)
  }

  // Crop overlay rendering
  const renderCropOverlay = () => {
    if (!cropMode || !isCropping) return null
    const { x, y, w, h } = getCropRect()
    if (w < 2 && h < 2) return null

    return (
      <>
        {/* Dimmed overlay */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        {/* Clear crop area */}
        <div
          className="absolute border-2 border-dashed border-white pointer-events-none shadow-lg"
          style={{ left: x, top: y, width: w, height: h, boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }}
        />
        {/* Size label */}
        <div
          className="absolute bg-white/90 text-xs px-2 py-1 rounded shadow pointer-events-none font-mono"
          style={{ left: x, top: Math.max(0, y - 28) }}
        >
          {Math.round(w)} × {Math.round(h)}
        </div>
      </>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">🖼️ Bilderedigering</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image preview */}
          <div className="md:col-span-2">
            <div
              className={`bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[400px] relative overflow-hidden ${cropMode ? 'cursor-crosshair' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Redigering"
                className="max-w-full max-h-[400px] object-contain rounded"
                style={{
                  filter: cssFilter,
                  ...(appliedCrop ? {
                    objectFit: 'none' as const,
                    objectPosition: `-${appliedCrop.x}px -${appliedCrop.y}px`,
                    width: appliedCrop.w,
                    height: appliedCrop.h,
                  } : {})
                }}
                onError={(e) => {
                  // Vis feilmelding hvis bildet ikke laster
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = '<div class="text-center text-gray-500"><p class="text-4xl mb-2">⚠️</p><p>Kunne ikke laste bildet.</p><p class="text-sm mt-1">Sjekk at URL-en er riktig.</p></div>'
                }}
              />
              {renderCropOverlay()}
            </div>

            {cropMode && (
              <div className="mt-3 flex items-center space-x-3">
                <p className="text-sm text-blue-700">✂️ Dra over bildet for å velge utsnitt</p>
                <button onClick={applyCrop} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  Beskjær
                </button>
                <button onClick={() => { setCropMode(false); setCropStart({ x: 0, y: 0 }); setCropEnd({ x: 0, y: 0 }) }}
                  className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
                  Avbryt
                </button>
              </div>
            )}

            {appliedCrop && !cropMode && (
              <div className="mt-3 flex items-center space-x-2 text-sm text-green-700">
                <span>✅ Bilde beskjært</span>
                <button onClick={() => setAppliedCrop(null)} className="text-green-600 hover:text-green-800 underline">
                  Angre
                </button>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Verktøy</h4>
              <button onClick={() => setCropMode(!cropMode)}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-2 ${
                  cropMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                ✂️ Beskjær utsnitt
              </button>
              <button onClick={handleReset}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                🔄 Tilbakestill
              </button>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Justeringer</h4>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Lysstyrke</span>
                    <span className="font-medium">{brightness}%</span>
                  </div>
                  <input type="range" min={0} max={200} value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#16425b]" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Kontrast</span>
                    <span className="font-medium">{contrast}%</span>
                  </div>
                  <input type="range" min={0} max={200} value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#16425b]" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Metning</span>
                    <span className="font-medium">{saturation}%</span>
                  </div>
                  <input type="range" min={0} max={200} value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#16425b]" />
                </div>
              </div>
            </div>

            {/* Live preview of filter values */}
            {(brightness !== 100 || contrast !== 100 || saturation !== 100 || appliedCrop) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                <p className="font-medium mb-1">Aktive endringer:</p>
                {brightness !== 100 && <p>☀️ Lysstyrke: {brightness}%</p>}
                {contrast !== 100 && <p>🔲 Kontrast: {contrast}%</p>}
                {saturation !== 100 && <p>🎨 Metning: {saturation}%</p>}
                {appliedCrop && <p>✂️ Beskjært: {Math.round(appliedCrop.w)}×{Math.round(appliedCrop.h)}px</p>}
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button onClick={handleSave}
                className="w-full px-4 py-3 bg-[#16425b] text-white rounded-lg hover:bg-[#1a5270] transition-colors font-medium">
                💾 Lagre endringer
              </button>
              <button onClick={onClose}
                className="w-full px-4 py-3 text-gray-600 hover:text-gray-900 text-sm">
                Avbryt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
