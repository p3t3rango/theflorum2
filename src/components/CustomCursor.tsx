'use client'

import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(true) // Default to true to prevent flicker

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile() // Initial check
    window.addEventListener('resize', checkMobile)

    // Only add mouse tracking if not mobile
    if (!isMobile) {
      const updatePosition = (e: MouseEvent) => {
        setPosition({ x: e.clientX, y: e.clientY })
      }
      window.addEventListener('mousemove', updatePosition)
      return () => {
        window.removeEventListener('mousemove', updatePosition)
        window.removeEventListener('resize', checkMobile)
      }
    }

    return () => window.removeEventListener('resize', checkMobile)
  }, [isMobile])

  if (isMobile) return null

  return (
    <div 
      className="custom-cursor"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`
      }}
    >
      ⌘
    </div>
  )
} 