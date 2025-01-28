'use client'

import { useEffect, useRef, useState } from 'react'

interface Section {
  type: 'intro' | 'verse' | 'bridge' | 'chorus' | 'outro'
  duration: number
}

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Create AudioContext only when needed
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = ctxRef.current
    if (!ctx) return // Early return if context isn't available

    // Create reverb impulse
    async function createReverb() {
      const seconds = 2
      const decay = 2
      const sampleRate = ctx.sampleRate
      const length = sampleRate * seconds
      const impulse = ctx.createBuffer(2, length, sampleRate)
      const left = impulse.getChannelData(0)
      const right = impulse.getChannelData(1)

      for (let i = 0; i < length; i++) {
        const n = i / length
        left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay)
        right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay)
      }

      return impulse
    }

    function createSynth(type: OscillatorType = 'sine') {
      if (!ctx) return null // Guard clause

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      const reverb = ctx.createConvolver()

      osc.type = type
      osc.frequency.value = 220 // Base frequency
      gain.gain.value = 0.1 // Lower volume
      filter.frequency.value = 700
      filter.Q.value = 1

      createReverb().then(impulse => {
        reverb.buffer = impulse
      })

      osc.connect(filter)
      filter.connect(reverb)
      reverb.connect(gain)
      gain.connect(ctx.destination)

      return { osc, gain, filter, reverb }
    }

    let synths: Array<ReturnType<typeof createSynth>> = []
    let timeoutIds: NodeJS.Timeout[] = []

    function startAmbience() {
      if (!ctx) return // Guard clause

      // Clear any existing timeouts
      timeoutIds.forEach(id => clearTimeout(id))
      timeoutIds = []

      // Stop and disconnect any existing synths
      synths.forEach(synth => {
        if (synth) {
          synth.osc.stop()
          synth.gain.disconnect()
        }
      })
      synths = []

      function playNote() {
        const synth = createSynth()
        if (!synth) return // Guard for null synth

        synths.push(synth)
        synth.osc.start()

        // Random frequency between 220-440 Hz
        synth.osc.frequency.value = 220 + Math.random() * 220

        // Schedule next note
        const nextNote = 2000 + Math.random() * 3000 // Random delay between 2-5 seconds
        const timeoutId = setTimeout(playNote, nextNote)
        timeoutIds.push(timeoutId)

        // Fade out and cleanup after 4 seconds
        setTimeout(() => {
          if (synth.gain.gain.exponentialRampToValueAtTime) {
            synth.gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2)
          }
          setTimeout(() => {
            synth.gain.disconnect()
            const index = synths.indexOf(synth)
            if (index > -1) {
              synths.splice(index, 1)
            }
          }, 2000)
        }, 4000)
      }

      // Start playing notes
      playNote()
    }

    if (isPlaying) {
      startAmbience()
    }

    return () => {
      // Cleanup
      timeoutIds.forEach(id => clearTimeout(id))
      synths.forEach(synth => {
        if (synth) {
          synth.gain.disconnect()
        }
      })
    }
  }, [isPlaying])

  return (
    <button
      onClick={() => setIsPlaying(!isPlaying)}
      className="fixed bottom-4 right-4 p-2 rounded bg-white/10 hover:bg-white/20 transition-colors z-50"
    >
      {isPlaying ? '🔇 Mute' : '🔊 Ambient'}
    </button>
  )
} 