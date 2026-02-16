'use client'

import { useState, useRef, useEffect } from 'react'

interface ImageEditorProps {
  imageUrl: string
  onSave: (editedUrl: string) => void
  onClose: () => void
}

const edIcons = {
  image: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  crop: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2v4M2 6h4M18 22v-4M22 18h-4"/><rect x="6" y="6" width="12" height="12" rx="1"/></svg>,
  reset: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  save: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
}

export default function ImageEditor({ imageUrl, onSave, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [cropMode, setCropMode] = useState(false)
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 })
  const [isCropping, setIsCropping] = useState(false)
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { setOriginalImage(img); drawImage(img) }
    img.src = imageUrl
  }, [imageUrl])

  useEffect(() => { if (originalImage) drawImage(originalImage) }, [brightness, contrast, saturation])

  const drawImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const scale = Math.min(600 / img.width, 400 / img.height)
    canvas.width = img.width * scale
    canvas.height = img.height * scale
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropMode) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    setCropStart({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setCropEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setIsCropping(true)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !cropMode) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    setCropEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    if (originalImage) {
      drawImage(originalImage)
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
      const x = Math.min(cropStart.x, e.clientX - rect.left)
      const y = Math.min(cropStart.y, e.clientY - rect.top)
      const w = Math.abs(e.clientX - rect.left - cropStart.x)
      const h = Math.abs(e.clientY - rect.top - cropStart.y)
      ctx.clearRect(x, y, w, h)
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
      ctx.drawImage(originalImage, 0, 0, canvasRef.current!.width, canvasRef.current!.height)
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(x, y, w, h)
    }
  }

  const handleCanvasMouseUp = () => { setIsCropping(false) }

  const applyCrop = () => {
    const canvas = canvasRef.current
    if (!canvas || !originalImage) return
    const x = Math.min(cropStart.x, cropEnd.x)
    const y = Math.min(cropStart.y, cropEnd.y)
    const w = Math.abs(cropEnd.x - cropStart.x)
    const h = Math.abs(cropEnd.y - cropStart.y)
    if (w < 10 || h < 10) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const imageData = ctx.getImageData(x, y, w, h)
    canvas.width = w; canvas.height = h
    ctx.putImageData(imageData, 0, 0)
    setCropMode(false)
  }

  const handleReset = () => {
    setBrightness(100); setContrast(100); setSaturation(100); setCropMode(false)
    if (originalImage) drawImage(originalImage)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    onSave(canvas.toDataURL('image/jpeg', 0.9))
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">{edIcons.image}</div>
            <h3 className="text-xl font-semibold text-gray-900">Bilderedigering</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
              <canvas ref={canvasRef}
                className={`max-w-full max-h-[400px] ${cropMode ? 'cursor-crosshair' : ''}`}
                onMouseDown={handleCanvasMouseDown} onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp} />
            </div>
            {cropMode && (
              <div className="mt-2 flex items-center space-x-3">
                <p className="flex items-center gap-1.5 text-sm text-indigo-700">{edIcons.crop} Dra for å velge utsnitt</p>
                <button onClick={applyCrop} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg">Beskjær</button>
                <button onClick={() => { setCropMode(false); if (originalImage) drawImage(originalImage) }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg">Avbryt</button>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Verktøy</h4>
              <button onClick={() => setCropMode(!cropMode)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-2 ${
                  cropMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {edIcons.crop} Beskjær utsnitt
              </button>
              <button onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                {edIcons.reset} Tilbakestill
              </button>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Justeringer</h4>
              <div className="space-y-4">
                {[
                  { label: 'Lysstyrke', value: brightness, set: setBrightness },
                  { label: 'Kontrast', value: contrast, set: setContrast },
                  { label: 'Metning', value: saturation, set: setSaturation },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{s.label}</span>
                      <span className="font-medium">{s.value}%</span>
                    </div>
                    <input type="range" min={0} max={200} value={s.value}
                      onChange={(e) => s.set(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                {edIcons.save} Lagre endringer
              </button>
              <button onClick={onClose} className="w-full px-4 py-3 text-gray-600 hover:text-gray-900 text-sm">Avbryt</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
