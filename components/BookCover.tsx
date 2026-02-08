'use client'

import { useMemo } from 'react'

interface BookCoverProps {
  title: string
  author: string
  size?: 'small' | 'normal' | 'large'
  hue?: number
  saturation?: number
}

export default function BookCover({ 
  title, 
  author, 
  size = 'normal',
  hue,
  saturation 
}: BookCoverProps) {
  // Størrelses-faktorer
  const sizeMultiplier = size === 'large' ? 1.8 : size === 'small' ? 0.6 : 1
  const width = Math.round(140 * sizeMultiplier)
  const height = Math.round(200 * sizeMultiplier)
  
  // Generate deterministic hue and saturation from title if not provided
  const coverHue = hue ?? (title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360)
  const coverSat = saturation ?? (30 + (title.length % 30))
  
  // Generate seed from title for consistent randomness
  const seed = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  // Generate decorative shapes
  const shapes = useMemo(() => {
    const shapeArray = []
    // Seeded random function
    const random = (n: number) => {
      const x = Math.sin(seed * (shapeArray.length + n + 1) * 9301 + 49297) * 43758.5453
      return x - Math.floor(x)
    }
    
    const shapeCount = 3 + Math.floor(random(1) * 4)
    
    for (let i = 0; i < shapeCount; i++) {
      const shapeType = random(i * 10) > 0.5 ? 'circle' : 'rect'
      shapeArray.push({
        type: shapeType,
        x: random(i * 2) * 100,
        y: 15 + random(i * 3) * 55,
        size: 8 + random(i * 4) * 30,
        opacity: 0.08 + random(i * 5) * 0.18,
        hueShift: Math.floor(random(i * 6) * 40 - 20),
      })
    }
    
    return shapeArray
  }, [seed])

  return (
    <div 
      style={{
        width,
        height,
        borderRadius: size === 'large' ? 12 : 8,
        background: `linear-gradient(155deg, hsl(${coverHue}, ${coverSat}%, 88%) 0%, hsl(${coverHue}, ${coverSat - 5}%, 78%) 50%, hsl(${coverHue + 15}, ${coverSat}%, 72%) 100%)`,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: size === 'large' 
          ? '8px 12px 32px rgba(0,0,0,0.18)' 
          : '3px 5px 15px rgba(0,0,0,0.1)',
      }}
    >
      {/* Decorative shapes */}
      <svg 
        width="100%" 
        height="100%" 
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {shapes.map((shape, i) => 
          shape.type === 'circle' ? (
            <circle
              key={i}
              cx={`${shape.x}%`}
              cy={`${shape.y}%`}
              r={`${shape.size}%`}
              fill={`hsla(${coverHue + shape.hueShift}, ${coverSat + 10}%, 40%, ${shape.opacity})`}
            />
          ) : (
            <rect
              key={i}
              x={`${shape.x - shape.size / 2}%`}
              y={`${shape.y - shape.size / 2}%`}
              width={`${shape.size * 1.5}%`}
              height={`${shape.size}%`}
              rx="3"
              fill={`hsla(${coverHue + shape.hueShift}, ${coverSat + 10}%, 40%, ${shape.opacity})`}
            />
          )
        )}
        {/* Diagonal line */}
        <line 
          x1="0" 
          y1="0" 
          x2="100%" 
          y2="100%" 
          stroke={`hsla(${coverHue}, ${coverSat}%, 30%, 0.04)`} 
          strokeWidth="1" 
        />
      </svg>

      {/* Title and author overlay */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: size === 'large' ? '20px 18px' : '10px 10px',
          background: `linear-gradient(transparent, hsla(${coverHue}, ${coverSat}%, 20%, 0.7))`,
          color: 'white',
        }}
      >
        <div 
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: size === 'large' ? 18 : size === 'small' ? 9 : 12,
            fontWeight: 700,
            lineHeight: 1.2,
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            marginBottom: size === 'large' ? 4 : 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as any,
            overflow: 'hidden',
          }}
        >
          {title}
        </div>
        <div 
          style={{
            fontSize: size === 'large' ? 13 : size === 'small' ? 7 : 10,
            opacity: 0.85,
            fontWeight: 400,
          }}
        >
          {author}
        </div>
      </div>
    </div>
  )
}
