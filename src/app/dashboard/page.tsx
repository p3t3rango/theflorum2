'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DigitalRain } from '@/components/DigitalRain'
import { CustomCursor } from '@/components/CustomCursor'

// Add type for character
interface Character {
  name: string
  role?: string
  imageUrl?: string
  // Add other character properties as needed
}

export default function DashboardPage() {
  const [characters, setCharacters] = useState<Character[]>([]) // Add type annotation

  return (
    <>
      <CustomCursor />
      <DigitalRain />
      <div className="relative z-10 min-h-screen p-8">
        <nav className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-mono">✧ Florum Protocol ✧</h1>
            <div className="space-x-4">
              <Link 
                href="/create" 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors font-mono"
              >
                Create New
              </Link>
              <Link 
                href="/florum" 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors font-mono"
              >
                The Florum
              </Link>
            </div>
          </div>
        </nav>

        <main className="pt-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character, index) => (
              <div key={index} className="p-6 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                {/* Character card content */}
                <h3 className="text-xl font-mono mb-2">{character.name}</h3>
                {character.role && (
                  <p className="text-white/60">{character.role}</p>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  )
} 