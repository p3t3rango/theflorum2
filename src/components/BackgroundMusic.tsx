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
        [196.00, 233.08, 293.66], // Gm (G, Bb, D)
        [349.23, 440.00, 523.25], // Eb (Eb, G, Bb)
        [392.00, 466.16, 587.33], // F  (F, A, C)
        [293.66, 349.23, 440.00], // Dm (D, F, A)
      ],
      bass: [
        98.00,  // G  (one octave lower)
        155.56, // Eb (one octave lower)
        174.61, // F  (one octave lower)
        146.83, // D  (one octave lower)
      ]
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
      className="fixed bottom-4 right-4 p-2 md:p-3 rounded-lg bg-black/20 backdrop-blur border border-white/10 
      hover:bg-white/10 transition-all duration-300 z-50 group scale-75 md:scale-100"
    >
      {isPlaying ? (
        <div className="relative">
          {/* Playing state - animated waves */}
          <div className="flex items-center gap-0.5">
            <div className="w-0.5 h-3 bg-white/80 animate-[soundwave_0.5s_ease-in-out_infinite]" />
            <div className="w-0.5 h-4 bg-white/80 animate-[soundwave_0.5s_ease-in-out_infinite_0.1s]" />
            <div className="w-0.5 h-2 bg-white/80 animate-[soundwave_0.5s_ease-in-out_infinite_0.2s]" />
            <div className="w-0.5 h-3 bg-white/80 animate-[soundwave_0.5s_ease-in-out_infinite_0.3s]" />
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Muted state - crossed speaker */}
          <div className="flex items-center gap-0.5">
            <div className="w-0.5 h-3 bg-white/40" />
            <div className="w-0.5 h-4 bg-white/40" />
            <div className="w-0.5 h-2 bg-white/40" />
            <div className="w-0.5 h-3 bg-white/40" />
          </div>
          <div className="absolute top-1/2 left-1/2 w-6 h-0.5 bg-white/60 -translate-x-1/2 -translate-y-1/2 rotate-45" />
        </div>
      )}
    </button>
  )
} 