'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Check } from 'lucide-react'
import { BackgroundMusic } from '@/components/BackgroundMusic'
import { DigitalRain } from '@/components/DigitalRain'
import { CustomCursor } from '@/components/CustomCursor'

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
  { 
    name: 'Kindred', 
    element: 'spirit bonds and emotional resonance',
    description: 'Masters of empathic connections and spiritual harmony'
  },
  { 
    name: 'Lithian', 
    element: 'crystal energies and ancient knowledge',
    description: 'Keepers of crystalline wisdom and timeless secrets'
  },
  { 
    name: 'Solaris', 
    element: 'solar light and celestial power',
    description: 'Channelers of celestial energy and radiant force'
  },
  { 
    name: 'Chromatic', 
    element: 'color magic and transformation',
    description: 'Weavers of prismatic energies and metamorphosis'
  },
  { 
    name: 'Verdant', 
    element: 'nature\'s growth and renewal',
    description: 'Guardians of natural cycles and life force'
  },
  { 
    name: 'Aquatic', 
    element: 'flowing water and adaptation',
    description: 'Shapers of fluid energy and constant change'
  }
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

const promptGenerationSteps = [
  "Analyzing character essence...",
  "Weaving mystical elements...",
  "Harmonizing the vision...",
  "Consulting the Oracle...",
  "Decoding ethereal patterns..."
]

const imageGenerationSteps = [
  "Channeling ethereal energies...",
  "Weaving light and shadow...",
  "Capturing your essence...",
  "Harmonizing the elements...",
  "Crystallizing the vision..."
]

export default function HomePage() {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState(0)
  const [spiritText, setSpiritText] = useState('')
  const [isGlitching, setIsGlitching] = useState(false)
  const [character, setCharacter] = useState<Character>({ 
    name: '', 
    appearance: { age: '', height: '', features: '' }
  })
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
  const [inputValue, setInputValue] = useState('')
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0)
  const [isDissolving, setIsDissolving] = useState(false)
  
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
    }, 25)
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
    // Start dissolve animation
    setIsDissolving(true)
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Clear the UI and start generation
    setText('')
    setInputValue('')
    setIsGeneratingImage(true)
    setTypewriterComplete(true)
    setHasShownMessage(true)
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image')
      }

      // Wait for image to load
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

      // Move to profile phase
      setPhase(12)
    } catch (error) {
      console.error('Error details:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate image. Please try again.')
    } finally {
      setIsDissolving(false)
      setIsGeneratingImage(false)
      setCurrentLoadingStep(0)
    }
  }

  useEffect(() => {
    // Phase 0: Initial Loading - Speed up
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
      }, 70) // Faster typing (was 100)
      return () => clearInterval(intervalId)
    }
    
    // Phase 1: Add glitch effect to "Loading complete"
    if (phase === 1) {
      const spiritInterval = setInterval(() => {
        setSpiritText(spiritTexts[Math.floor(Math.random() * spiritTexts.length)])
      }, 200)
      
      const completedTimeout = setTimeout(() => {
        clearInterval(spiritInterval)
        setText('Loading complete')
        setIsGlitching(true) // Add glitch effect
        
        setTimeout(() => {
          setIsGlitching(false)
          setPhase(2)
        }, 1500) // Shorter hold (was 2000)
        
      }, 2000) // Shorter loading time (was 3000)
      
      return () => {
        clearInterval(spiritInterval)
        clearTimeout(completedTimeout)
      }
    }
    
    // Phase 2: Shorter matrix effect
    if (phase === 2) {
      const fullText = 'Welcome to Florum Protocol'
      let currentIndex = 0
      let matrixInterval: NodeJS.Timeout
      let isComplete = false
      
      setText(Array(fullText.length).fill('').map((_, i) => 
        fullText[i] === ' ' ? ' ' : matrixChars[Math.floor(Math.random() * matrixChars.length)]
      ).join(''))

      matrixInterval = setInterval(() => {
        if (!isComplete) {
          setText(prev => {
            const chars = prev.split('')
            
            for (let i = 0; i < fullText.length; i++) {
              if (fullText[i] === ' ') {
                chars[i] = ' '
                continue
              }

              const progress = currentIndex / fullText.length
              const stabilityThreshold = i <= currentIndex ? 0.8 + (progress * 0.15) : 0.2
              
              chars[i] = Math.random() < stabilityThreshold 
                ? fullText[i] 
                : matrixChars[Math.floor(Math.random() * matrixChars.length)]
            }
            
            return chars.join('')
          })

          const progress = currentIndex / fullText.length
          const increment = progress > 0.7 ? 0.4 : 0.6 // Faster progression
          currentIndex += increment

          if (currentIndex >= fullText.length + 6) { // Shorter end phase (was 8)
            isComplete = true
            setText(fullText)
            clearInterval(matrixInterval)
            
            setTimeout(() => {
              setIsGlitching(true)
              setTimeout(() => {
                setPhase(3)
              }, 600) // Shorter glitch (was 800)
            }, 300) // Shorter pause (was 400)
          }
        }
      }, 45) // Slightly faster interval (was 50)

      return () => clearInterval(matrixInterval)
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
      const message = `Welcome, ${userName}. Which path calls to you?`
      typewriterEffect(message)
    }

    // Phase 6: Motivations
    if (phase === 6) {
      const message = `The ${selectedRole}, master of ${selectedElement}. What drives you?`
      typewriterEffect(message)
    }

    // Phase 7: Flaws
    if (phase === 7) {
      const message = "What flaws shape your journey?"
      typewriterEffect(message)
    }

    // Phase 8: Talents
    if (phase === 8) {
      const message = "What talents do you bring to the Garden?"
      typewriterEffect(message)
    }

    // Phase 9: Appearance
    if (phase === 9 && !hasShownMessage) {
      setHasShownMessage(true)
      const message = "Describe your physical appearance."
      typewriterEffect(message)
    }

    // Phase 10: Show final profile and transition to image generation
    if (phase === 10) {
      setText(`Your story is ready, ${userName}. Now, let us create your portrait.`)
      // Automatically move to image prompt phase after a moment
      setTimeout(() => {
        setPhase(11)
        setIsGeneratingPrompt(true) // Start prompt generation immediately
      }, 3000)
    }

    // Phase 11: Image Prompt Generation and Review
    if (phase === 11 && !hasShownMessage) {
      const analyzeAndGeneratePrompt = async () => {
        setIsAnalyzing(true)
        setIsGeneratingPrompt(true)
        try {
          const prompt = await generateImagePrompt(characterProfile)
          setGeneratedPrompt(prompt)
          setInputValue(prompt)
          setText("The Eternal Garden has envisioned your form. Review the description below before we bring it to life.")
        } catch (error) {
          console.error('Error analyzing character:', error)
          setText("The connection to the Eternal Garden is unclear. Please try again.")
        } finally {
          setIsAnalyzing(false)
          setIsGeneratingPrompt(false)
          setTypewriterComplete(true)
        }
      }
      analyzeAndGeneratePrompt()
    }
  }, [phase, character.name, character.role, hasShownMessage, userName, selectedRole, selectedElement])

  useEffect(() => {
    if (isGeneratingPrompt || isGeneratingImage) {
      const steps = isGeneratingPrompt ? promptGenerationSteps : imageGenerationSteps
      const interval = setInterval(() => {
        setCurrentLoadingStep(prev => (prev + 1) % steps.length)
      }, 2000) // Change message every 2 seconds

      return () => {
        clearInterval(interval)
        setCurrentLoadingStep(0) // Reset step when loading finishes
      }
    }
  }, [isGeneratingPrompt, isGeneratingImage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!typewriterComplete && phase > 4) return

    switch (phase) {
      case 4:
        if (!inputValue.trim()) return
        setUserName(inputValue)
        setCharacterProfile(prev => ({ ...prev, name: inputValue }))
        break
      case 5:
        // Role selection is handled by the button clicks
        return
      case 6:
        if (!inputValue.trim()) return
        setCharacterProfile(prev => ({ ...prev, motivations: inputValue }))
        break
      case 7:
        if (!inputValue.trim()) return
        setCharacterProfile(prev => ({ ...prev, flaws: inputValue }))
        break
      case 8:
        if (!inputValue.trim()) return
        setCharacterProfile(prev => ({ ...prev, talents: inputValue }))
        break
      case 9:
        const { age, height, features } = character.appearance || {}
        if (!age?.trim() || !height?.trim() || !features?.trim()) return
        setCharacterProfile(prev => ({
          ...prev,
          appearance: {
            age: age.trim(),
            height: height.trim(),
            features: features.trim()
          }
        }))
        break
    }

    setInputValue('')
    setPhase(prev => prev + 1)
    setTypewriterComplete(false)
    setHasShownMessage(false)
  }

  const renderInput = () => {
    return (
      <div className="w-full">
        {phase === 5 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map((role) => (
              <button
                key={role.name}
                onClick={() => {
                  setSelectedRole(role.name)
                  setSelectedElement(role.element)
                  setCharacterProfile(prev => ({ ...prev, role: role.name }))
                  setPhase(6)
                }}
                className="p-4 bg-white/5 hover:bg-white/10 rounded border border-white/10 
                transition-colors text-left group backdrop-blur-sm"
              >
                <h3 className="text-lg font-mono mb-2 group-hover:text-purple-400">
                  {role.name}
                </h3>
                <p className="text-sm text-white/60 group-hover:text-white/80">
                  {role.description}
                </p>
                <p className="text-xs text-white/40 mt-2 group-hover:text-white/60">
                  Element: {role.element}
                </p>
              </button>
            ))}
          </div>
        )}
        
        {phase === 9 && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Age"
              value={character.appearance?.age || ''}
              onChange={(e) => setCharacter(prev => ({
                ...prev,
                appearance: { 
                  ...prev.appearance || { height: '', features: '' },
                  age: e.target.value 
                }
              }))}
              className="w-full p-4 bg-white/5 rounded border border-white/10 focus:border-white/20 
              focus:outline-none font-mono"
            />
            <input
              type="text"
              placeholder="Height"
              value={character.appearance?.height || ''}
              onChange={(e) => setCharacter(prev => ({
                ...prev,
                appearance: { 
                  ...prev.appearance || { age: '', features: '' },
                  height: e.target.value 
                }
              }))}
              className="w-full p-4 bg-white/5 rounded border border-white/10 focus:border-white/20 
              focus:outline-none font-mono"
            />
            <textarea
              placeholder="Distinctive Features"
              value={character.appearance?.features || ''}
              onChange={(e) => setCharacter(prev => ({
                ...prev,
                appearance: { 
                  ...prev.appearance || { age: '', height: '' },
                  features: e.target.value 
                }
              }))}
              className="w-full p-4 bg-white/5 rounded border border-white/10 focus:border-white/20 
              focus:outline-none font-mono min-h-[100px]"
            />
          </div>
        )}
        
        {phase === 11 && (
          <div className="space-y-4">
            {isGeneratingPrompt || isGeneratingImage ? (
              <div className="text-center space-y-6 p-8">
                <div className="animate-pulse text-purple-400 text-2xl">✧</div>
                <div className="space-y-2">
                  <p className="text-white/80 font-mono">
                    {isGeneratingPrompt ? 'Consulting the Oracle' : 'Manifesting Your Portrait'}
                  </p>
                  <div className="flex flex-col gap-3 text-sm text-white/60 italic">
                    <p className="min-h-[20px] transition-opacity duration-500">
                      {isGeneratingPrompt 
                        ? promptGenerationSteps[currentLoadingStep]
                        : imageGenerationSteps[currentLoadingStep]
                      }
                    </p>
                  </div>
                </div>
                <div className="h-1 w-48 mx-auto bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500/50 animate-loading"></div>
                </div>
              </div>
            ) : (
              <>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className={`w-full p-4 bg-white/5 rounded border border-white/10 focus:border-white/20 
                  focus:outline-none font-mono min-h-[200px] ${isDissolving ? 'dissolve-out' : ''}`}
                  placeholder="Loading prompt..."
                  disabled={isGeneratingPrompt || isDissolving}
                />
                <button
                  onClick={() => handleGenerateImage(inputValue)}
                  className={`w-full p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded border border-purple-500/30 
                  transition-colors font-mono flex items-center justify-center gap-2 ${isDissolving ? 'dissolve-out' : ''}`}
                  disabled={isGeneratingImage || isDissolving}
                >
                  <span>Generate Portrait</span>
                </button>
              </>
            )}
          </div>
        )}
        
        {phase !== 5 && phase !== 9 && phase !== 11 && phase !== 10 && (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-4 bg-white/5 rounded border border-white/10 focus:border-white/20 
            focus:outline-none text-sm md:text-base font-mono min-h-[100px] md:min-h-[120px]"
            placeholder={getPlaceholder()}
          />
        )}
      </div>
    )
  }

  const renderProfile = () => (
    <div className="mt-8 p-8 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-mono font-bold mb-2">✧ Character Portrait ✧</h2>
        <div className="h-0.5 w-32 bg-white/20 mx-auto"></div>
      </div>

      {character.imageUrl && (
        <div className="mb-12">
          <img 
            src={character.imageUrl} 
            alt={characterProfile.name} 
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
          />
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                // Reset all necessary states before showing edit interface
                setInputValue(character.imagePrompt || '')
                setText('Edit your portrait description')
                setPhase(11)
                setIsGeneratingPrompt(false)
                setIsGeneratingImage(false)
                setTypewriterComplete(true)
                setHasShownMessage(true) // Prevent prompt generation
                setCurrentLoadingStep(0) // Reset loading step
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded border border-white/20 
              transition-colors font-mono text-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Edit & Regenerate</span>
            </button>
          </div>
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

  const getPlaceholder = () => {
    switch (phase) {
      case 4:
        return 'Enter your name...'
      case 6:
        return 'Share your motivations...'
      case 7:
        return 'Share your flaws and challenges...'
      case 8:
        return 'Share your talents...'
      case 9:
        return 'Describe your physical appearance.'
      case 11:
        return 'Review or edit the image description...'
      default:
        return ''
    }
  }

  return (
    <>
      <CustomCursor />
      <DigitalRain />
      <BackgroundMusic />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        {/* Main chat interface */}
        <div className="w-full max-w-2xl">
          {/* Only show title when not in loading states and not in final profile view */}
          {!isGeneratingImage && !isGeneratingPrompt && phase !== 12 && (
            <h1 className="text-4xl font-bold font-mono text-center mb-8 tracking-wide">
              {text}
              {!typewriterComplete && <span className="animate-blink">|</span>}
            </h1>
          )}
          
          {phase >= 4 && phase <= 11 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {renderInput()}
              {phase !== 11 && phase !== 10 && !isGeneratingImage && !isGeneratingPrompt && (
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
