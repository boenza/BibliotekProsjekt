'use client'

import { useState, useRef, useEffect } from 'react'

interface ImageEditorProps {
  imageUrl: string
  onSave: (editedUrl: string) => void
  onClose: () => void
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
    img.onload = () => {
      setOriginalImage(img)
      drawImage(img)
    }
    img.src = imageUrl
  }, [imageUrl])

  useEffect(() => {
    if (originalImage) {
      drawImage(originalImage)
    }
  }, [brightness, contrast, saturation])

  const drawImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Scale to fit 600px width
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

    // Draw crop overlay
    if (originalImage) {
      drawImage(originalImage)
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      
      // Dim outside crop area
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
      
      // Clear crop area
      const x = Math.min(cropStart.x, e.clientX - rect.left)
      const y = Math.min(cropStart.y, e.clientY - rect.top)
      const w = Math.abs(e.clientX - rect.left - cropStart.x)
      const h = Math.abs(e.clientY - rect.top - cropStart.y)
      
      ctx.clearRect(x, y, w, h)
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
      ctx.drawImage(originalImage, 0, 0, canvasRef.current!.width, canvasRef.current!.height)
      
      // Crop border
      ctx.strokeStyle = '#16425b'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(x, y, w, h)
    }
  }

  const handleCanvasMouseUp = () => {
    setIsCropping(false)
  }

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
    canvas.width = w
    canvas.height = h
    ctx.putImageData(imageData, 0, 0)
    
    setCropMode(false)
  }

  const handleReset = () => {
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setCropMode(false)
    if (originalImage) drawImage(originalImage)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    onSave(dataUrl)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">🖼️ Bilderedigering</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="col-span-2">
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
              <canvas
                ref={canvasRef}
                className={`max-w-full max-h-[400px] ${cropMode ? 'cursor-crosshair' : ''}`}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
              />
            </div>
            {cropMode && (
              <div className="mt-2 flex items-center space-x-3">
                <p className="text-sm text-blue-700">✂️ Dra for å velge utsnitt</p>
                <button onClick={applyCrop} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg">Beskjær</button>
                <button onClick={() => { setCropMode(false); if (originalImage) drawImage(originalImage) }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg">Avbryt</button>
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
