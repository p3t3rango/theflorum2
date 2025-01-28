'use client'

import { useEffect, useRef } from 'react'

export function DigitalRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    type Neuron = {
      x: number
      y: number
      connections: {
        neuron: Neuron
        controlPoints: { x: number; y: number }[]
        subPoints: { x: number; y: number }[]
        pulsePosition: number
        active: boolean
        opacity: number
      }[]
      firing: boolean
      lastFired: number
      cooldown: number
      size: number
    }

    // Create more organic distribution of neurons
    function createOrganicPosition(baseX: number, baseY: number, radius: number) {
      const angle = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * radius // Square root for more natural distribution
      return {
        x: baseX + Math.cos(angle) * r,
        y: baseY + Math.sin(angle) * r
      }
    }

    // Create fractal-like branch points
    function createBranchPoints(start: {x: number, y: number}, end: {x: number, y: number}, depth: number = 2): {x: number, y: number}[] {
      const points = []
      const dx = end.x - start.x
      const dy = end.y - start.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      for (let i = 1; i <= depth; i++) {
        const ratio = i / (depth + 1)
        const baseX = start.x + dx * ratio
        const baseY = start.y + dy * ratio
        const perpX = -dy / dist * (Math.random() * 30 - 15) // Random perpendicular offset
        const perpY = dx / dist * (Math.random() * 30 - 15)
        points.push({
          x: baseX + perpX,
          y: baseY + perpY
        })
      }
      return points
    }

    const neurons: Neuron[] = []
    const numNeurons = window.innerWidth < 768 ? 30 : 50
    const connectionDistance = window.innerWidth < 768 ? 200 : 300

    // Create neurons with organic distribution
    for (let i = 0; i < numNeurons; i++) {
      const pos = createOrganicPosition(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) * 0.4
      )
      neurons.push({
        x: pos.x,
        y: pos.y,
        connections: [],
        firing: false,
        lastFired: 0,
        cooldown: 3000 + Math.random() * 4000,
        size: Math.random() * 2 + 1
      })
    }

    // Create organic connections
    neurons.forEach(neuron => {
      neurons.forEach(otherNeuron => {
        if (neuron !== otherNeuron) {
          const distance = Math.hypot(neuron.x - otherNeuron.x, neuron.y - otherNeuron.y)
          if (distance < connectionDistance) {
            // Create main control points
            const midX = (neuron.x + otherNeuron.x) / 2
            const midY = (neuron.y + otherNeuron.y) / 2
            const offset = (Math.random() - 0.5) * distance * 0.5

            const controlPoints = [
              { x: midX + offset, y: midY + offset },
              { x: midX - offset, y: midY + offset }
            ]

            // Create sub-branch points
            const subPoints = createBranchPoints(
              { x: neuron.x, y: neuron.y },
              { x: otherNeuron.x, y: otherNeuron.y }
            )

            neuron.connections.push({
              neuron: otherNeuron,
              controlPoints,
              subPoints,
              pulsePosition: 0,
              active: false,
              opacity: 0
            })
          }
        }
      })
    })

    // Add color oscillation
    let colorPhase = 0
    const colorSpeed = 0.0002 // Even slower color change

    const getColor = (opacity: number) => {
      // Create a smoother gradient between colors
      const purple = { r: 147, g: 51, b: 234 }
      const red = { r: 234, g: 51, b: 147 }
      
      const t = (Math.sin(colorPhase) + 1) / 2 // Smooth transition between 0 and 1
      
      const r = Math.floor(purple.r * (1 - t) + red.r * t)
      const g = purple.g
      const b = Math.floor(purple.b * (1 - t) + red.b * t)
      
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }

    let lastTime = 0
    const draw = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      colorPhase += deltaTime * colorSpeed

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update neurons
      neurons.forEach(neuron => {
        if (!neuron.firing && currentTime - neuron.lastFired > neuron.cooldown) {
          if (Math.random() < 0.005) {
            neuron.firing = true
            neuron.lastFired = currentTime
            
            // Activate random subset of connections
            const activeConnections = neuron.connections
              .sort(() => Math.random() - 0.5)
              .slice(0, Math.floor(Math.random() * 2) + 1) // Activate 1-2 connections

            activeConnections.forEach(conn => {
              conn.active = true
              conn.pulsePosition = 0
              conn.opacity = 1
            })
          }
        }

        // Update and draw connections
        neuron.connections.forEach(connection => {
          // Update connection state
          if (connection.active) {
            connection.pulsePosition += deltaTime * 0.001
            if (connection.pulsePosition >= 1) {
              connection.active = false
              connection.neuron.firing = true
              connection.neuron.lastFired = currentTime
            }
          }

          // Fade out inactive connections
          if (!connection.active) {
            connection.opacity = Math.max(0, connection.opacity - deltaTime * 0.001)
          }

          // Only draw if there's some opacity
          if (connection.opacity > 0) {
            drawConnection(connection, neuron.x, neuron.y, connection.opacity)
          }
        })

        // Draw neuron
        if (neuron.firing) {
          const timeSinceFired = currentTime - neuron.lastFired
          const glowIntensity = Math.max(0, 1 - timeSinceFired / 1000)
          
          const gradient = ctx.createRadialGradient(
            neuron.x, neuron.y, 0,
            neuron.x, neuron.y, neuron.size * 4
          )
          gradient.addColorStop(0, getColor(glowIntensity))
          gradient.addColorStop(1, getColor(0))

          ctx.beginPath()
          ctx.fillStyle = gradient
          ctx.arc(neuron.x, neuron.y, neuron.size * 4, 0, Math.PI * 2)
          ctx.fill()

          if (timeSinceFired > 1000) {
            neuron.firing = false
          }
        }
      })

      requestAnimationFrame(draw)
    }

    // Helper function for Bezier curve calculations
    function bezierPoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
      const oneMinusT = 1 - t
      return Math.pow(oneMinusT, 3) * p0 +
             3 * Math.pow(oneMinusT, 2) * t * p1 +
             3 * oneMinusT * Math.pow(t, 2) * p2 +
             Math.pow(t, 3) * p3
    }

    // In the draw function, add sub-branch rendering
    const drawConnection = (connection: typeof neurons[0]['connections'][0], startX: number, startY: number, opacity: number) => {
      // Draw main connection
      ctx.beginPath()
      ctx.strokeStyle = getColor(0.1 * opacity)
      ctx.lineWidth = 0.5
      ctx.moveTo(startX, startY)
      ctx.bezierCurveTo(
        connection.controlPoints[0].x,
        connection.controlPoints[0].y,
        connection.controlPoints[1].x,
        connection.controlPoints[1].y,
        connection.neuron.x,
        connection.neuron.y
      )
      ctx.stroke()

      // Draw sub-branches
      connection.subPoints.forEach(point => {
        ctx.beginPath()
        ctx.strokeStyle = getColor(0.05 * opacity)
        ctx.moveTo(point.x, point.y)
        // Create small branching lines
        const angle = Math.random() * Math.PI * 2
        const length = Math.random() * 15
        ctx.lineTo(
          point.x + Math.cos(angle) * length,
          point.y + Math.sin(angle) * length
        )
        ctx.stroke()
      })
    }

    const animationFrame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.2 }}
    />
  )
} 