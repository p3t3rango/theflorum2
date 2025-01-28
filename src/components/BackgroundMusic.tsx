'use client'

import { useEffect, useRef, useState } from 'react'

interface Section {
  type: 'intro' | 'verse' | 'bridge' | 'chorus' | 'outro'
  duration: number
}

export function BackgroundMusic() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const isPlayingRef = useRef(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const initializeAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
      setIsInitialized(true)
      startMusic()
    } else if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
  }

  const startMusic = () => {
    const ctx = audioContextRef.current

    // Update the progression to be more sci-fi/noir
    const progression = {
      chords: [
        [60, 67, 70, 76],  // Cm9
        [58, 65, 69, 74],  // Bbm9
        [56, 63, 67, 72],  // Abm9
        [61, 68, 71, 77]   // C#m9
      ].map(chord => chord.map(midiToFreq)),
      bass: [36, 34, 32, 37].map(midiToFreq)  // Lower octave for more depth
    }

    // Pentatonic scale for melody
    const scale = [60, 62, 65, 67, 72, 74, 77, 79, 84, 86, 89].map(midiToFreq)

    function midiToFreq(midi: number): number {
      return 440 * Math.pow(2, (midi - 69) / 12)
    }

    function createSynth(type: OscillatorType = 'sine') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      const reverb = ctx.createConvolver()
      const delay = ctx.createDelay(5.0)
      const delayGain = ctx.createGain()
      
      // Enhanced reverb with longer tail
      const reverbLength = 5 // Increased from 3
      const rate = ctx.sampleRate
      const impulse = ctx.createBuffer(2, rate * reverbLength, rate)
      for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel)
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (rate * reverbLength / 8))
        }
      }
      reverb.buffer = impulse

      // Configure delay
      delay.delayTime.value = 0.75 // 3/4 second delay
      delayGain.gain.value = 0.3   // 30% delay feedback

      // Configure filter for darker tone
      filter.type = 'lowpass'
      filter.frequency.value = type === 'sine' ? 1500 : 800
      filter.Q.value = 2

      // Connect nodes with delay feedback loop
      osc.connect(gain)
      gain.connect(filter)
      filter.connect(reverb)
      filter.connect(delay)
      delay.connect(delayGain)
      delayGain.connect(delay)
      delay.connect(ctx.destination)
      reverb.connect(ctx.destination)
      
      return { osc, gain, filter }
    }

    function playPad(chord: number[], time: number, duration: number, section: string) {
      const volume = section === 'chorus' ? 0.04 : 0.03
      chord.forEach((freq, i) => {
        const { osc, gain } = createSynth('sine')
        osc.frequency.value = freq

        // Stagger the entry of each note in the chord
        const staggeredTime = time + (i * 0.2)
        const fadeInTime = 0.5 // Slower fade in

        gain.gain.setValueAtTime(0, staggeredTime)
        gain.gain.linearRampToValueAtTime(volume, staggeredTime + fadeInTime)
        gain.gain.linearRampToValueAtTime(0, time + duration)

        osc.start(staggeredTime)
        osc.stop(time + duration)
      })
    }

    function playBass(freq: number, time: number, duration: number, pattern: 'intro' | 'verse' | 'chorus' | 'outro') {
      const { osc, gain } = createSynth('sine')
      osc.frequency.value = freq

      switch (pattern) {
        case 'intro':
          gain.gain.setValueAtTime(0, time)
          gain.gain.linearRampToValueAtTime(0.05, time + 0.1)
          gain.gain.linearRampToValueAtTime(0, time + duration)
          break
        case 'verse':
        case 'chorus':
          gain.gain.setValueAtTime(0, time)
          gain.gain.linearRampToValueAtTime(0.06, time + 0.05)
          gain.gain.linearRampToValueAtTime(0, time + 0.2)
          break
        case 'outro':
          gain.gain.setValueAtTime(0, time)
          gain.gain.linearRampToValueAtTime(0.05, time + 0.1)
          gain.gain.exponentialRampToValueAtTime(0.001, time + duration)
          break
      }

      osc.start(time)
      osc.stop(time + duration)
    }

    function playMelody(time: number, duration: number, section: string) {
      const note = scale[Math.floor(Math.random() * scale.length)]
      const { osc, gain } = createSynth('sine')
      
      osc.frequency.value = note

      const volume = section === 'chorus' ? 0.04 : 0.02
      gain.gain.setValueAtTime(0, time)
      gain.gain.linearRampToValueAtTime(volume, time + 0.1)
      gain.gain.linearRampToValueAtTime(0, time + duration)

      osc.start(time)
      osc.stop(time + duration)
    }

    function playLoop(startTime: number, section: 'intro' | 'verse' | 'chorus' | 'outro' = 'verse') {
      const barDuration = 6  // Changed from 8 to 6 for faster tempo
      const idx = Math.floor(startTime / barDuration) % progression.chords.length
      
      // Play pad chord
      playPad(progression.chords[idx], startTime, barDuration, section)

      // Play bass with faster rhythm
      const bassNote = progression.bass[idx]
      if (section === 'intro' || section === 'outro') {
        playBass(bassNote, startTime, barDuration, section)
      } else {
        for (let i = 0; i < 12; i++) {  // Increased from 8 to 12 notes per bar
          playBass(bassNote, startTime + i * 0.5, 0.4, section)  // Changed from 1 to 0.5 for faster rhythm
        }
      }

      // Add melody with adjusted timing
      if (section !== 'intro' && Math.random() > 0.8) {
        playMelody(startTime + Math.random() * barDuration, 2, section)  // Changed from 3 to 2 for shorter notes
      }

      // Schedule next loop with adjusted timing
      if (isPlayingRef.current) {
        setTimeout(() => {
          const nextSection = startTime > 48 ? 'chorus' :  // Adjusted section transitions
                             startTime > 72 ? 'outro' : 
                             startTime > 12 ? 'verse' : 'intro'
          playLoop(ctx.currentTime, nextSection)
        }, (barDuration - 0.1) * 1000)
      }
    }

    // Start playing
    isPlayingRef.current = true
    playLoop(ctx.currentTime, 'intro')

    // Cleanup
    return () => {
      isPlayingRef.current = false
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close()
      }
    }
  }

  return (
    <button
      onClick={initializeAudio}
      className="fixed bottom-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      aria-label={isInitialized ? "Music Playing" : "Start Music"}
    >
      {isInitialized ? "🔊" : "🔈"}
    </button>
  )
} 