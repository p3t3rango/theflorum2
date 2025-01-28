'use client'

import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Wait for window to be defined
    if (typeof window === 'undefined') return

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    setIsReady(true)
    
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isReady || isMobile || typeof window === 'undefined') return

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', updatePosition)
    return () => window.removeEventListener('mousemove', updatePosition)
  }, [isReady, isMobile])

  if (!isReady || isMobile) return null

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