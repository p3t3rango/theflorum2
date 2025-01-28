'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Check } from 'lucide-react'
import { BackgroundMusic } from '@/components/BackgroundMusic'
import { DigitalRain } from '@/components/DigitalRain'

const spiritTexts = [
  "Initializing spirit connection...",
  "Harmonizing ethereal frequencies...",
  "Calibrating mystical resonance...",
  "Synchronizing with the astral plane...",
  "Channeling ancient wisdom...",
  "Aligning cosmic energies...",
]

const secondSpiritTexts = [
  "Decoding ethereal signatures...",
  "Establishing neural link...",
  "Scanning consciousness patterns...",
  "Validating spirit resonance...",
  "Processing quantum frequencies...",
  "Initiating final handshake..."
]

const roles = [
  { id: 'kindred', name: 'Kindred', element: 'spirit bonds and emotional resonance' },
  { id: 'lithian', name: 'Lithian', element: 'crystal energies and ancient knowledge' },
  { id: 'solaris', name: 'Solaris', element: 'solar light and celestial power' },
  { id: 'chromatic', name: 'Chromatic', element: 'color magic and transformation' },
  { id: 'verdant', name: 'Verdant', element: 'nature\'s growth and renewal' },
  { id: 'aquatic', name: 'Aquatic', element: 'flowing water and adaptation' },
]

interface Character {
  name: string;
  role?: string;
  motivations?: string;
  flaws?: string;
  talents?: string;
  appearance?: {
    age: string;
    height: string;
    features: string;
  };
  imagePrompt?: string;
  imageUrl?: string;
}

const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*♱⚔️✧⚡☽★⚜️✺⚝♰⚕️☯️⚛️✡️☮️⚖️✴️❈❉❊❋⚜️♱⚔️✧⚡☽★⚜️✺"

export default function HomePage() {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState(0)
  const [spiritText, setSpiritText] = useState('')
  const [isGlitching, setIsGlitching] = useState(false)
  const [character, setCharacter] = useState<Character>({ name: '' })
  const [typewriterComplete, setTypewriterComplete] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [hasShownMessage, setHasShownMessage] = useState(false)
  const [userName, setUserName] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedElement, setSelectedElement] = useState('')
  const [characterProfile, setCharacterProfile] = useState<Character>({ name: '' })
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const typewriterEffect = (fullText: string, onComplete?: () => void) => {
    let currentIndex = 0
    setText('')
    setTypewriterComplete(false)
    
    const intervalId = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(prev => fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(intervalId)
        setTypewriterComplete(true)
        onComplete?.()
      }
    }, 50)
    return () => clearInterval(intervalId)
  }

  const generateImagePrompt = async (char: Character) => {
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ character: char })
      })

      if (!response.ok) {
        throw new Error('Failed to generate prompt')
      }

      const data = await response.json()
      return data.prompt
    } catch (error) {
      console.error('Error:', error)
      // Fallback prompt if API fails
      return `A mystical ethereal portrait of ${char.name}, a ${char.role} in the Eternal Garden. 
      Physical traits: ${char.appearance?.features || ''}
      Height: ${char.appearance?.height || ''}
      Age: ${char.appearance?.age || ''}
      They emanate an aura of ${char.talents}, while carrying the weight of ${char.flaws}.
      Their spirit is driven by ${char.motivations}.
      Style: Ethereal digital art with magical elements, cinematic lighting, detailed character design.`
    }
  }

  const handleGenerateImage = async (prompt: string) => {
    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      })

      const data = await response.json()
      console.log('Image generation response:', data) // Debug log

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      // Add a minimum loading time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a promise that resolves when the image loads or rejects on error
      await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          setCharacter(prev => ({
            ...prev,
            imagePrompt: prompt,
            imageUrl: data.imageUrl
          }))
          resolve(null)
        }
        img.onerror = () => {
          reject(new Error('Failed to load generated image'))
        }
        img.src = data.imageUrl
      })

    } catch (error) {
      console.error('Error details:', error) // More detailed error logging
      alert(error instanceof Error ? error.message : 'Failed to generate image. Please try again.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  useEffect(() => {
    // Phase 0: Initial Loading
    if (phase === 0) {
      let currentIndex = 0
      const fullText = 'Loading Florum Protocol...'
      const intervalId = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setText(fullText.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(intervalId)
          setPhase(1)
        }
      }, 100)
      return () => clearInterval(intervalId)
    }
    
    // Phase 1: First Spirit Loading Text
    if (phase === 1) {
      const spiritInterval = setInterval(() => {
        setSpiritText(spiritTexts[Math.floor(Math.random() * spiritTexts.length)])
      }, 200)
      
      const completedTimeout = setTimeout(() => {
        clearInterval(spiritInterval)
        setText('Loading completed')
        
        // Add a delay before moving to the next phase
        setTimeout(() => {
          setPhase(2)
        }, 2000) // Hold for 2 seconds
        
      }, 3000)
      
      return () => {
        clearInterval(spiritInterval)
        clearTimeout(completedTimeout)
      }
    }
    
    // Phase 2: Welcome Message with Matrix effect and Glitch
    if (phase === 2) {
      const fullText = 'Welcome to Florum Protocol'
      let currentIndex = 0
      let matrixInterval: NodeJS.Timeout
      let finalizeInterval: NodeJS.Timeout
      let isComplete = false
      
      // Start with random characters for the full length
      setText(Array(fullText.length).fill('').map(() => 
        matrixChars[Math.floor(Math.random() * matrixChars.length)]
      ).join(''))

      // Scramble effect
      matrixInterval = setInterval(() => {
        if (!isComplete) {
          setText(prev => {
            const chars = prev.split('')
            // Only scramble characters that haven't been finalized
            for (let i = currentIndex; i < fullText.length; i++) {
              chars[i] = matrixChars[Math.floor(Math.random() * matrixChars.length)]
            }
            return chars.join('')
          })
        }
      }, 50)

      // Gradually reveal correct characters
      finalizeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setText(prev => {
            const chars = prev.split('')
            chars[currentIndex] = fullText[currentIndex]
            return chars.join('')
          })
          currentIndex++
        } else {
          isComplete = true
          clearInterval(matrixInterval)
          clearInterval(finalizeInterval)
          setText(fullText) // Ensure final text is correct
          
          // Trigger glitch after matrix effect
          setTimeout(() => {
            setIsGlitching(true)
            setTimeout(() => {
              setPhase(3)
            }, 1000)
          }, 500)
        }
      }, 100)

      return () => {
        clearInterval(matrixInterval)
        clearInterval(finalizeInterval)
      }
    }

    // Phase 3: Second Spirit Loading
    if (phase === 3) {
      setIsGlitching(false)
      const spiritInterval = setInterval(() => {
        setSpiritText(secondSpiritTexts[Math.floor(Math.random() * secondSpiritTexts.length)])
      }, 200)
      
      const chatTimeout = setTimeout(() => {
        clearInterval(spiritInterval)
        setPhase(4)
      }, 3000)
      
      return () => {
        clearInterval(spiritInterval)
        clearTimeout(chatTimeout)
      }
    }

    // Phase 4: Name Input
    if (phase === 4) {
      setText('What is your name?')
    }

    // Phase 5: Role Selection
    if (phase === 5 && !hasShownMessage) {
      setHasShownMessage(true)
      const message = `Ah, ${userName}... A name with weight, with history. Tell me, what path calls to you in the Eternal Garden?`
      typewriterEffect(message)
    }

    // Phase 6: Motivations
    if (phase === 6) {
      const message = `The ${selectedRole}, masters of ${selectedElement}. Many before you have walked this path, but your steps will carve something unique. Now, let us explore further... What drives your spirit? What motivates your journey?`
      typewriterEffect(message)
    }

    // Phase 7: Flaws
    if (phase === 7) {
      const message = "Even the brightest star has shadows. What flaws or challenges weigh upon your heart?"
      typewriterEffect(message)
    }

    // Phase 8: Talents
    if (phase === 8) {
      const message = "From the cracks in your armor, a certain brilliance shines through. What are your greatest talents, the gifts you offer to the Eternal Garden?"
      typewriterEffect(message)
    }

    // Phase 9: Appearance
    if (phase === 9 && !hasShownMessage) {
      setHasShownMessage(true)
      const message = "The Eternal Garden weaves us through our stories, and in its soil, we find purpose. Describe your visage, for it will become part of the lore."
      typewriterEffect(message)
    }

    // Phase 10: Show final profile and transition to image generation
    if (phase === 10) {
      setText(`Your story is ready, ${userName}. Now, let us create your portrait.`)
      // Automatically move to image prompt phase after a moment
      setTimeout(() => {
        setPhase(11)
      }, 3000)
    }

    // Phase 11: Image Prompt Generation and Review
    if (phase === 11) {
      const analyzeAndGeneratePrompt = async () => {
        setIsAnalyzing(true)
        setIsGeneratingPrompt(true)
        try {
          // First get the prompt from our API
          const prompt = await generateImagePrompt(characterProfile)
          setGeneratedPrompt(prompt)
          
          // Then show the review message with typewriter effect
          typewriterEffect(
            "The Eternal Garden has envisioned your form. Review the description below before we bring it to life."
          )
        } catch (error) {
          console.error('Error analyzing character:', error)
          typewriterEffect(
            "The connection to the Eternal Garden is unclear. Please try again."
          )
        } finally {
          setIsAnalyzing(false)
          setIsGeneratingPrompt(false)
        }
      }
      analyzeAndGeneratePrompt()
    }
  }, [phase, character.name, character.role, hasShownMessage, userName, selectedRole, selectedElement])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!typewriterComplete && phase > 4) return

    // Store current input in profile before clearing
    switch (phase) {
      case 4:
        if (!character.name.trim()) return
        setUserName(character.name)
        setCharacterProfile(prev => ({ ...prev, name: character.name }))
        break
      case 5:
        if (!character.role) return
        const role = roles.find(r => r.name === character.role)
        if (role) {
          setSelectedRole(role.name)
          setSelectedElement(role.element)
          setCharacterProfile(prev => ({ ...prev, role: role.name }))
        }
        break
      case 6:
        if (!character.motivations?.trim()) return
        setCharacterProfile(prev => ({ ...prev, motivations: character.motivations }))
        break
      case 7:
        if (!character.flaws?.trim()) return
        setCharacterProfile(prev => ({ ...prev, flaws: character.flaws }))
        break
      case 8:
        if (!character.talents?.trim()) return
        setCharacterProfile(prev => ({ ...prev, talents: character.talents }))
        break
      case 9:
        if (!character.appearance?.age || !character.appearance?.height || !character.appearance?.features) return
        setCharacterProfile(prev => ({ ...prev, appearance: character.appearance }))
        break
    }

    // Reset character state completely with all fields
    setCharacter({
      name: '',
      role: '',
      motivations: '',
      flaws: '',
      talents: '',
      appearance: {
        age: '',
        height: '',
        features: ''
      }
    })
    
    setPhase(prev => prev + 1)
    setTypewriterComplete(false)
    setHasShownMessage(false)
  }

  const renderInput = () => {
    switch (phase) {
      case 4:
  return (
          <input
            type="text"
            value={character.name}
            onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
            className="p-2 rounded bg-white/10 border border-white/20 text-white font-mono"
            placeholder="Enter your name..."
          />
        )
      case 5:
        return (
          <select
            value={character.role}
            onChange={(e) => setCharacter(prev => ({ ...prev, role: e.target.value }))}
            className="p-2 rounded bg-white/10 border border-white/20 text-white font-mono"
          >
            <option value="">Select your role...</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
        )
      case 6:
        return (
          <textarea
            value={character.motivations}
            onChange={(e) => setCharacter(prev => ({ ...prev, motivations: e.target.value }))}
            className="p-2 rounded bg-white/10 border border-white/20 text-white font-mono h-32"
            placeholder="Share your motivations..."
          />
        )
      case 7:
        return (
          <textarea
            value={character.flaws}
            onChange={(e) => setCharacter(prev => ({ ...prev, flaws: e.target.value }))}
            className="p-2 rounded bg-white/10 border border-white/20 text-white font-mono h-32"
            placeholder="Share your flaws and challenges..."
          />
        )
      case 8:
        return (
          <textarea
            value={character.talents}
            onChange={(e) => setCharacter(prev => ({ ...prev, talents: e.target.value }))}
            className="p-2 rounded bg-white/10 border border-white/20 text-white font-mono h-32"
            placeholder="Share your talents..."
          />
        )
      case 9:
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={character.appearance?.age || ''}
              onChange={(e) => setCharacter(prev => ({
                ...prev,
                appearance: { ...prev.appearance, age: e.target.value }
              }))}
              className="w-full p-2 rounded bg-white/10 border border-white/20 text-white font-mono"
              placeholder="Age..."
            />
            <input
              type="text"
              value={character.appearance?.height || ''}
              onChange={(e) => setCharacter(prev => ({
                ...prev,
                appearance: { ...prev.appearance, height: e.target.value }
              }))}
              className="w-full p-2 rounded bg-white/10 border border-white/20 text-white font-mono"
              placeholder="Height..."
            />
            <textarea
              value={character.appearance?.features || ''}
              onChange={(e) => setCharacter(prev => ({
                ...prev,
                appearance: { ...prev.appearance, features: e.target.value }
              }))}
              className="w-full p-2 rounded bg-white/10 border border-white/20 text-white font-mono h-32"
              placeholder="Describe your identifying features..."
            />
          </div>
        )
      case 11:
        return (
          <div className="space-y-6">
            {isAnalyzing ? (
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="text-center mb-4 font-mono">Analyzing your essence...</div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-white/40 h-full animate-[loading_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
            ) : isGeneratingPrompt ? (
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="text-center mb-4 font-mono">Crafting your portrait description...</div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-white/40 h-full animate-[loading_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
            ) : (
              <textarea
                value={generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white font-mono h-32"
                placeholder="Review or edit the image description..."
              />
            )}
            
            {/* Image Generation Section */}
            <div className="mt-8">
              {isGeneratingImage && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-black/50 p-8 rounded-lg border border-white/10 text-center max-w-md mx-auto">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
                    <p className="mt-6 font-mono text-xl">Manifesting your form in the Eternal Garden...</p>
                    <p className="mt-2 text-white/60 text-sm">This may take a moment as DALL-E crafts your portrait</p>
                  </div>
                </div>
              )}
              
              {character.imageUrl ? (
                <div className="space-y-4">
                  <img 
                    src={character.imageUrl} 
                    alt={character.name} 
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      type="button"
                      onClick={() => handleGenerateImage(generatedPrompt)}
                      className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors font-mono flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhase(12)}
                      className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors font-mono flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleGenerateImage(generatedPrompt)}
                  className="w-full p-4 rounded bg-white/10 hover:bg-white/20 transition-colors font-mono flex items-center justify-center gap-2"
                >
                  Generate Portrait
                </button>
              )}
            </div>
          </div>
        )
    }
  }

  const renderProfile = () => (
    <div className="mt-8 p-8 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-mono font-bold mb-2">✧ Character Profile ✧</h2>
        <div className="h-0.5 w-32 bg-white/20 mx-auto"></div>
      </div>

      {character.imageUrl && (
        <div className="mb-12">
          <img 
            src={character.imageUrl} 
            alt={characterProfile.name} 
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-mono text-white/80">✧ Name</h3>
            <p className="text-xl">{characterProfile.name}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-mono text-white/80">✧ Role</h3>
            <p className="text-xl">{characterProfile.role}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-mono text-white/80">✧ Motivations</h3>
          <p className="text-lg leading-relaxed">{characterProfile.motivations}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-mono text-white/80">✧ Flaws</h3>
          <p className="text-lg leading-relaxed">{characterProfile.flaws}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-mono text-white/80">✧ Talents</h3>
          <p className="text-lg leading-relaxed">{characterProfile.talents}</p>
        </div>

        {characterProfile.appearance && (
          <div className="space-y-4">
            <h3 className="text-lg font-mono text-white/80">✧ Appearance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-white/60">Age:</span> {characterProfile.appearance.age}
              </div>
              <div>
                <span className="text-white/60">Height:</span> {characterProfile.appearance.height}
              </div>
            </div>
            <div>
              <span className="text-white/60">Features:</span>
              <p className="mt-2 leading-relaxed">{characterProfile.appearance.features}</p>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-xl font-mono text-center mb-4">Oracle's Reflection</h3>
          <p className="text-lg italic text-center leading-relaxed">
            "The path ahead is shrouded in mystery, but your choices echo with purpose. 
            Tread lightly, for the Eternal Garden remembers all who wander within it."
          </p>
        </div>

        <div className="mt-12 flex justify-center gap-6">
          <button className="px-6 py-3 rounded bg-white/10 hover:bg-white/20 transition-colors font-mono flex items-center gap-2">
            Save Profile
          </button>
          <button className="px-6 py-3 rounded bg-white/10 hover:bg-white/20 transition-colors font-mono flex items-center gap-2">
            Begin Adventure
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <DigitalRain />
      <BackgroundMusic />
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        {/* Show character profile when in image generation phase */}
        {phase >= 10 && (
          <div className="w-full max-w-2xl mb-8">
            <div className="p-6 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
              <h2 className="text-2xl font-mono text-center mb-4">✧ Your Character ✧</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60">Name:</p>
                  <p className="font-mono">{characterProfile.name}</p>
                </div>
                <div>
                  <p className="text-white/60">Role:</p>
                  <p className="font-mono">{characterProfile.role}</p>
                </div>
              </div>
              {/* Add other character details as needed */}
            </div>
          </div>
        )}

        {/* Main chat interface */}
        <div className="w-full max-w-2xl">
          <h1 className={`text-4xl font-bold font-mono text-center mb-8 ${isGlitching ? 'glitch' : ''}`}>
            {text}
            {!typewriterComplete && <span className="animate-blink">|</span>}
          </h1>
          
          {phase >= 4 && phase <= 11 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {renderInput()}
              {phase !== 11 && (
                <button
                  type="submit"
                  className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors font-mono"
                >
                  Continue
                </button>
              )}
            </form>
          )}

          {phase === 12 && renderProfile()}
        </div>
      </div>
    </>
  )
}
