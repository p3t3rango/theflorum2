'use client'

import { useEffect, useRef, useState } from 'react'

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = ctxRef.current
    if (!ctx) return

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
      if (!ctx) return null

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      const reverb = ctx.createConvolver()
      const delay = ctx.createDelay(5.0)
      const delayGain = ctx.createGain()
      
      // Enhanced reverb with longer tail
      const reverbLength = 5
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
      delay.delayTime.value = 0.75
      delayGain.gain.value = 0.3

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

    let activeOscillators: { osc: OscillatorNode, gain: GainNode }[] = []

    function playPad(chord: number[], time: number, duration: number, section: string) {
      if (!ctx) return

      const volume = section === 'chorus' ? 0.04 : 0.03
      chord.forEach((freq, i) => {
        const synth = createSynth('sine')
        if (!synth) return

        synth.osc.frequency.value = freq
        const staggeredTime = time + (i * 0.2)
        const fadeInTime = 0.5

        synth.gain.gain.setValueAtTime(0, staggeredTime)
        synth.gain.gain.linearRampToValueAtTime(volume, staggeredTime + fadeInTime)
        synth.gain.gain.linearRampToValueAtTime(0, time + duration)

        synth.osc.start(staggeredTime)
        synth.osc.stop(time + duration)
        activeOscillators.push(synth)
      })
    }

    function playBass(freq: number, time: number, duration: number, pattern: string) {
      if (!ctx) return

      const synth = createSynth('sine')
      if (!synth) return

      synth.osc.frequency.value = freq
      const volume = 0.06

      synth.gain.gain.setValueAtTime(0, time)
      synth.gain.gain.linearRampToValueAtTime(volume, time + 0.05)
      synth.gain.gain.linearRampToValueAtTime(0, time + duration)

      synth.osc.start(time)
      synth.osc.stop(time + duration)
      activeOscillators.push(synth)
    }

    let timeoutIds: NodeJS.Timeout[] = []

    function playLoop(startTime: number) {
      if (!ctx || !isPlaying) return

      const barDuration = 6
      const idx = Math.floor(startTime / barDuration) % progression.chords.length
      
      playPad(progression.chords[idx], startTime, barDuration, 'verse')
      
      const bassNote = progression.bass[idx]
      for (let i = 0; i < 12; i++) {
        playBass(bassNote, startTime + i * 0.5, 0.4, 'verse')
      }

      const timeoutId = setTimeout(() => {
        playLoop(ctx.currentTime)
      }, (barDuration - 0.1) * 1000)
      
      timeoutIds.push(timeoutId)
    }

    if (isPlaying) {
      playLoop(ctx.currentTime)
    }

    return () => {
      timeoutIds.forEach(clearTimeout)
      activeOscillators.forEach(synth => {
        try {
          synth.osc.stop()
          synth.gain.disconnect()
        } catch (e) {
          // Ignore errors from already stopped oscillators
        }
      })
      activeOscillators = []
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