'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [text, setText] = useState('')
  const fullText = 'Loading Florum Protocol...'
  
  useEffect(() => {
    let currentIndex = 0
    const intervalId = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(intervalId)
      }
    }, 100) // Adjust speed by changing this number (milliseconds)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold font-mono">
        {text}
        <span className="animate-blink">|</span>
      </h1>
    </div>
  )
} 