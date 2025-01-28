'use client'

import { useState } from 'react'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSignup: (email: string, password: string) => void
}

export function SignupModal({ isOpen, onClose, onSignup }: SignupModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-black/80 p-8 rounded-lg border border-white/10 max-w-md w-full">
        <h2 className="text-2xl font-mono text-center mb-6">✧ Save Your Journey ✧</h2>
        <form onSubmit={(e) => {
          e.preventDefault()
          onSignup(email, password)
        }}>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-white/5 rounded border border-white/10 focus:border-white/20 
              focus:outline-none font-mono"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-white/5 rounded border border-white/10 focus:border-white/20 
              focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="w-full p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded border border-purple-500/30 
              transition-colors font-mono"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 