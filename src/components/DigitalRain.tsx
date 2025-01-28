'use client'

import { useEffect, useRef } from 'react'

export function DigitalRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 8-bit style characters
    const chars = '10'.split('')
    const fontSize = 12
    const columns = canvas.width / fontSize
    const drops: number[] = []

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
    }

    // Color oscillation
    let colorPhase = 0
    const colorSpeed = 0.002 // Adjust speed of color change

    const getColor = () => {
      // Oscillate between purple and red with more dramatic shifts
      const red = Math.sin(colorPhase) * 127 + 128 // Oscillates between pure red and purple
      const blue = Math.cos(colorPhase) * 127 + 128 // Creates purple when mixed with red
      return `rgb(${Math.floor(red)}, 0, ${Math.floor(blue)})`
    }

    const draw = () => {
      // Semi-transparent black to create fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update color phase
      colorPhase += colorSpeed

      // Set text style
      ctx.font = `${fontSize}px monospace`

      // Get current color for this frame
      const currentColor = getColor()
      
      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        
        // Draw with varying opacity but same base color
        const opacity = Math.random() * 0.5 + 0.5
        const [r, g, b] = currentColor.match(/\d+/g)!.map(Number)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
        
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)

        // Reset drop when it reaches bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        // Move drop down
        drops[i]++
      }
    }

    // Animation loop
    const interval = setInterval(draw, 50)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.25 }}
    />
  )
} 